import { prisma, withDbReconnectRetry } from "@/lib/db";
import { estimateReadingTime, slugify } from "@/lib/utils";
import { generateLeagueRoundup, generateStandingsRecap, generateTransferArticle, generateViralNewsArticle } from "@/lib/ai/article-generator";
import { getViralSportsHeadlines } from "@/lib/ai/news-provider";

export interface AutoGenerateArticlesInput {
  /** DB ids of matches upserted as FINISHED during the triggering sync run. */
  finishedMatchIds: string[];
  /** DB ids of leagues whose standings were upserted during the triggering sync run. */
  leagueIds: string[];
}

export interface AutoGenerateArticlesResult {
  articlesGenerated: number;
  skipped: number;
  errors: string[];
}

const AI_AUTHOR_SLUG = "ai-desk";

async function getOrCreateAiAuthor() {
  return prisma.author.upsert({
    where: { slug: AI_AUTHOR_SLUG },
    update: {},
    create: {
      name: "SportInScope AI Desk",
      slug: AI_AUTHOR_SLUG,
      bio: "Automated recaps generated from live data. Every draft is reviewed by an editor before publishing.",
      title: "Automated Reporting",
    },
  });
}

async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const category = await prisma.category.findUnique({ where: { slug } });
  return category?.id ?? null;
}

async function articleSlugExists(slug: string): Promise<boolean> {
  const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(existing);
}

/**
 * Generates DRAFT articles from live data (results roundups, standings,
 * confirmed transfers, viral news). Never publishes automatically — every
 * draft lands in the admin CMS for a human editor to review, edit, and
 * publish. Safe to call repeatedly: every draft has a deterministic slug, so
 * re-runs skip anything already generated instead of duplicating it.
 */
export async function autoGenerateArticles(input: AutoGenerateArticlesInput): Promise<AutoGenerateArticlesResult> {
  const result: AutoGenerateArticlesResult = { articlesGenerated: 0, skipped: 0, errors: [] };
  if (!process.env.AI_API_KEY) return result;

  const author = await getOrCreateAiAuthor();

  // --- Results roundups (one article per league per day, not one per match) ---
  if (input.finishedMatchIds.length > 0) {
    const matches = await prisma.match.findMany({
      where: { id: { in: input.finishedMatchIds }, status: "FINISHED" },
      include: { homeTeam: true, awayTeam: true, league: true },
    });

    const byLeague = new Map<string, typeof matches>();
    for (const match of matches) {
      const arr = byLeague.get(match.leagueId) ?? [];
      arr.push(match);
      byLeague.set(match.leagueId, arr);
    }

    const today = new Date().toISOString().slice(0, 10);
    for (const [leagueId, leagueMatches] of byLeague) {
      const league = leagueMatches[0]!.league;
      const slug = `results-roundup-${league.slug}-${today}`;
      try {
        if (await articleSlugExists(slug)) {
          result.skipped++;
          continue;
        }
        const categorySlug = league.sport === "NBA" ? "nba-news" : "football-news";
        const categoryId = await getCategoryIdBySlug(categorySlug);
        if (!categoryId) {
          result.errors.push(`Roundup ${leagueId}: missing category "${categorySlug}"`);
          continue;
        }
        const generated = await generateLeagueRoundup({
          leagueName: league.name,
          results: leagueMatches.map((m) => ({
            homeTeamName: m.homeTeam.name,
            awayTeamName: m.awayTeam.name,
            homeScore: m.homeScore ?? 0,
            awayScore: m.awayScore ?? 0,
          })),
        });
        await withDbReconnectRetry(() =>
          prisma.article.create({
            data: {
              title: generated.title,
              slug,
              excerpt: generated.excerpt.slice(0, 320),
              content: generated.content,
              status: "DRAFT",
              readingTimeMins: estimateReadingTime(generated.content),
              authorId: author.id,
              categoryId,
              sport: league.sport,
              leagueId: league.id,
            },
          }),
        );
        result.articlesGenerated++;
      } catch (error) {
        result.errors.push(`Roundup ${leagueId}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }
  }

  // --- Standings recaps --------------------------------------------------
  if (input.leagueIds.length > 0) {
    const leagues = await prisma.league.findMany({ where: { id: { in: input.leagueIds } } });
    const today = new Date().toISOString().slice(0, 10);

    for (const league of leagues) {
      const slug = `standings-update-${league.slug}-${today}`;
      try {
        if (await articleSlugExists(slug)) {
          result.skipped++;
          continue;
        }
        const standings = await prisma.standing.findMany({
          where: { leagueId: league.id },
          include: { team: true },
          orderBy: { position: "asc" },
        });
        if (standings.length === 0) continue;

        const categoryId = await getCategoryIdBySlug("analysis");
        if (!categoryId) {
          result.errors.push(`Standings ${league.slug}: missing category "analysis"`);
          continue;
        }
        const generated = await generateStandingsRecap({
          leagueName: league.name,
          rows: standings.map((s) => ({
            position: s.position,
            teamName: s.team.name,
            points: s.points,
            played: s.played,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
          })),
        });
        await withDbReconnectRetry(() =>
          prisma.article.create({
            data: {
              title: generated.title,
              slug,
              excerpt: generated.excerpt.slice(0, 320),
              content: generated.content,
              status: "DRAFT",
              readingTimeMins: estimateReadingTime(generated.content),
              authorId: author.id,
              categoryId,
              sport: league.sport,
              leagueId: league.id,
            },
          }),
        );
        result.articlesGenerated++;
      } catch (error) {
        result.errors.push(`Standings ${league.slug}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }
  }

  // --- Confirmed transfers -------------------------------------------------
  // Always scanned (not scoped to this sync run) since transfers are logged
  // manually at arbitrary times; the slug dedup above makes re-scans safe.
  const confirmedTransfers = await prisma.transfer.findMany({
    where: { status: "CONFIRMED" },
    include: { fromTeam: true, toTeam: true },
  });

  for (const transfer of confirmedTransfers) {
    const slug = `transfer-update-${transfer.id}`;
    try {
      if (await articleSlugExists(slug)) {
        result.skipped++;
        continue;
      }
      const categoryId = await getCategoryIdBySlug("transfers");
      if (!categoryId) {
        result.errors.push(`Transfer ${transfer.id}: missing category "transfers"`);
        continue;
      }
      const generated = await generateTransferArticle({
        playerName: transfer.playerName,
        fromTeamName: transfer.fromTeam?.name ?? null,
        toTeamName: transfer.toTeam?.name ?? null,
        status: transfer.status,
        feeAmount: transfer.feeAmount,
        source: transfer.source,
      });
      await withDbReconnectRetry(() =>
        prisma.article.create({
          data: {
            title: generated.title,
            slug,
            excerpt: generated.excerpt.slice(0, 320),
            content: generated.content,
            status: "DRAFT",
            readingTimeMins: estimateReadingTime(generated.content),
            authorId: author.id,
            categoryId,
            sport: transfer.sport,
            teamId: transfer.toTeamId ?? transfer.fromTeamId ?? null,
            playerId: transfer.playerId ?? null,
          },
        }),
      );
      result.articlesGenerated++;
    } catch (error) {
      result.errors.push(`Transfer ${transfer.id}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  // --- Viral news --------------------------------------------------------
  // Real trending sports headlines from NewsAPI, rewritten as original
  // commentary (never a verbatim copy) with the source attributed by name.
  try {
    const headlines = await getViralSportsHeadlines(5);
    for (const headline of headlines) {
      const slug = `viral-${slugify(headline.title).slice(0, 80)}`;
      try {
        if (await articleSlugExists(slug)) {
          result.skipped++;
          continue;
        }
        const isNba = /nba|basketball/i.test(headline.title);
        const categorySlug = isNba ? "nba-news" : "football-news";
        const categoryId = await getCategoryIdBySlug(categorySlug);
        if (!categoryId) {
          result.errors.push(`Viral news: missing category "${categorySlug}"`);
          continue;
        }
        const generated = await generateViralNewsArticle({
          headline: headline.title,
          description: headline.description,
          sourceName: headline.sourceName,
          sourceUrl: headline.url,
        });
        await withDbReconnectRetry(() =>
          prisma.article.create({
            data: {
              title: generated.title,
              slug,
              excerpt: generated.excerpt.slice(0, 320),
              content: generated.content,
              status: "DRAFT",
              readingTimeMins: estimateReadingTime(generated.content),
              authorId: author.id,
              categoryId,
              sport: isNba ? "NBA" : "FOOTBALL",
            },
          }),
        );
        result.articlesGenerated++;
      } catch (error) {
        result.errors.push(`Viral news "${headline.title}": ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }
  } catch (error) {
    result.errors.push(`Viral news fetch failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  return result;
}
