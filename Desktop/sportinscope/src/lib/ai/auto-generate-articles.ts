import { endOfISOWeek, getISOWeek, getISOWeekYear, startOfISOWeek } from "date-fns";
import { prisma, withDbReconnectRetry } from "@/lib/db";
import { estimateReadingTime, slugify } from "@/lib/utils";
import { generateMatchOfTheRound, generateStandingsRecap, generateTransferArticle, generateViralNewsArticle } from "@/lib/ai/article-generator";
import { getViralSportsHeadlines } from "@/lib/ai/news-provider";
import type { Sport } from "@/types";

/** Fixtures aren't tagged with a round/matchday, so an ISO week is used as the round proxy. */
function getRoundWindow(date: Date): { start: Date; end: Date; key: string } {
  return { start: startOfISOWeek(date), end: endOfISOWeek(date), key: `${getISOWeekYear(date)}-w${getISOWeek(date)}` };
}

const UNRANKED_POSITION = 9999;

/** Combined table position of both sides — lower means a bigger top-of-table clash. */
function matchImportance(match: { homeTeamId: string; awayTeamId: string }, positionByTeamId: Map<string, number>): number {
  return (positionByTeamId.get(match.homeTeamId) ?? UNRANKED_POSITION) + (positionByTeamId.get(match.awayTeamId) ?? UNRANKED_POSITION);
}

// Stock fallback photos (same source used by the mock-data seed) so every
// AI-generated draft has a featured image an editor can swap out later.
const STOCK_IMAGES: Record<"FOOTBALL" | "NBA" | "OTHER", string[]> = {
  FOOTBALL: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop",
  ],
  NBA: [
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
  ],
  OTHER: ["https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop"],
};

function pickFeaturedImage(sport: Sport, seed: string): string {
  const pool = STOCK_IMAGES[sport === "NBA" ? "NBA" : sport === "FOOTBALL" ? "FOOTBALL" : "OTHER"];
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length]!;
}

/** Get-or-create tags by name (matched on slug) and return their ids. */
async function resolveTagIds(names: (string | null | undefined)[]): Promise<string[]> {
  const ids: string[] = [];
  for (const raw of names) {
    const name = raw?.trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    if (!ids.includes(tag.id)) ids.push(tag.id);
  }
  return ids;
}

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
 * Generates articles from live data: one match-of-the-round article per
 * league (the standout top-of-table clash) is published immediately for
 * timely views, while standings recaps, confirmed transfers, and viral news
 * land as DRAFTs in the admin CMS for a human editor to review first. Safe
 * to call repeatedly: every article has a deterministic slug, so re-runs
 * skip anything already generated instead of duplicating it.
 */
export async function autoGenerateArticles(input: AutoGenerateArticlesInput): Promise<AutoGenerateArticlesResult> {
  const result: AutoGenerateArticlesResult = { articlesGenerated: 0, skipped: 0, errors: [] };
  if (!process.env.AI_API_KEY) return result;

  const author = await getOrCreateAiAuthor();

  // --- Match of the round: for each league, the single standout fixture ---
  // --- (top-of-table clash, picked from the whole round's fixture list) ---
  // --- is published the moment THAT match finishes — other matches in the ---
  // --- same round are ignored even if they finish first. ---
  if (input.finishedMatchIds.length > 0) {
    const finishedMatches = await prisma.match.findMany({
      where: { id: { in: input.finishedMatchIds }, status: "FINISHED" },
      include: { homeTeam: true, awayTeam: true, league: true },
    });

    for (const finished of finishedMatches) {
      const league = finished.league;
      const { start, end, key: roundKey } = getRoundWindow(finished.startTime);
      const slug = `match-of-the-round-${league.slug}-${roundKey}`;
      try {
        if (await articleSlugExists(slug)) {
          result.skipped++;
          continue;
        }

        // The full round's fixture list (any status) decides which match is "the" pick.
        const roundMatches = await prisma.match.findMany({
          where: { leagueId: league.id, startTime: { gte: start, lte: end } },
          include: { homeTeam: true, awayTeam: true },
        });

        const teamIds = [...new Set(roundMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]))];
        const standings = await prisma.standing.findMany({ where: { leagueId: league.id, teamId: { in: teamIds } } });
        const positionByTeamId = new Map(standings.map((s) => [s.teamId, s.position]));

        const best = roundMatches.reduce((top, m) =>
          matchImportance(m, positionByTeamId) < matchImportance(top, positionByTeamId) ? m : top,
        );

        if (best.id !== finished.id) {
          // This finished match isn't the round's identified standout — wait for the pick instead.
          continue;
        }

        const categorySlug = league.sport === "NBA" ? "nba-news" : "football-news";
        const categoryId = await getCategoryIdBySlug(categorySlug);
        if (!categoryId) {
          result.errors.push(`Match of the round ${league.id}: missing category "${categorySlug}"`);
          continue;
        }

        const generated = await generateMatchOfTheRound({
          leagueName: league.name,
          homeTeamName: finished.homeTeam.name,
          awayTeamName: finished.awayTeam.name,
          homeScore: finished.homeScore ?? 0,
          awayScore: finished.awayScore ?? 0,
          homePosition: positionByTeamId.get(finished.homeTeamId) ?? null,
          awayPosition: positionByTeamId.get(finished.awayTeamId) ?? null,
        });
        const tagIds = await resolveTagIds([league.name, finished.homeTeam.name, finished.awayTeam.name, ...generated.tags]);
        await withDbReconnectRetry(() =>
          prisma.article.create({
            data: {
              title: generated.title,
              slug,
              excerpt: generated.excerpt.slice(0, 320),
              content: generated.content,
              featuredImage: pickFeaturedImage(league.sport, slug),
              seoTitle: generated.seoTitle.slice(0, 70),
              metaDescription: generated.metaDescription.slice(0, 160),
              status: "PUBLISHED",
              publishedAt: new Date(),
              readingTimeMins: estimateReadingTime(generated.content),
              authorId: author.id,
              categoryId,
              sport: league.sport,
              leagueId: league.id,
              tags: { create: tagIds.map((tagId) => ({ tagId })) },
            },
          }),
        );
        result.articlesGenerated++;
      } catch (error) {
        result.errors.push(`Match of the round ${league.id}: ${error instanceof Error ? error.message : "unknown error"}`);
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
        const tagIds = await resolveTagIds([league.name, "standings", ...generated.tags]);
        await withDbReconnectRetry(() =>
          prisma.article.create({
            data: {
              title: generated.title,
              slug,
              excerpt: generated.excerpt.slice(0, 320),
              content: generated.content,
              featuredImage: pickFeaturedImage(league.sport, slug),
              seoTitle: generated.seoTitle.slice(0, 70),
              metaDescription: generated.metaDescription.slice(0, 160),
              status: "DRAFT",
              readingTimeMins: estimateReadingTime(generated.content),
              authorId: author.id,
              categoryId,
              sport: league.sport,
              leagueId: league.id,
              tags: { create: tagIds.map((tagId) => ({ tagId })) },
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
      const leagueId = transfer.toTeam?.leagueId ?? transfer.fromTeam?.leagueId ?? null;
      const tagIds = await resolveTagIds([transfer.playerName, transfer.fromTeam?.name, transfer.toTeam?.name, ...generated.tags]);
      await withDbReconnectRetry(() =>
        prisma.article.create({
          data: {
            title: generated.title,
            slug,
            excerpt: generated.excerpt.slice(0, 320),
            content: generated.content,
            featuredImage: pickFeaturedImage(transfer.sport, slug),
            seoTitle: generated.seoTitle.slice(0, 70),
            metaDescription: generated.metaDescription.slice(0, 160),
            status: "DRAFT",
            readingTimeMins: estimateReadingTime(generated.content),
            authorId: author.id,
            categoryId,
            sport: transfer.sport,
            leagueId,
            teamId: transfer.toTeamId ?? transfer.fromTeamId ?? null,
            playerId: transfer.playerId ?? null,
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
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
        const sport: Sport = isNba ? "NBA" : "FOOTBALL";
        const tagIds = await resolveTagIds(["trending", ...generated.tags]);
        await withDbReconnectRetry(() =>
          prisma.article.create({
            data: {
              title: generated.title,
              slug,
              excerpt: generated.excerpt.slice(0, 320),
              content: generated.content,
              featuredImage: pickFeaturedImage(sport, slug),
              seoTitle: generated.seoTitle.slice(0, 70),
              metaDescription: generated.metaDescription.slice(0, 160),
              status: "DRAFT",
              readingTimeMins: estimateReadingTime(generated.content),
              authorId: author.id,
              categoryId,
              sport,
              tags: { create: tagIds.map((tagId) => ({ tagId })) },
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
