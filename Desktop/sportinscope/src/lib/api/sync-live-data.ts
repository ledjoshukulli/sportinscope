import type { Match, Player, Sport, Team } from "@/types";
import { getSportsProvider } from "@/lib/api";
import { isDatabaseConfigured, prisma, withDbReconnectRetry } from "@/lib/db";
import { activeSports } from "@/config/sports";
import { slugify } from "@/lib/utils";
import { autoGenerateArticles } from "@/lib/ai/auto-generate-articles";

interface SyncLiveDataOptions {
  sports?: Sport[];
  includePlayers?: boolean;
}

export interface SyncLiveDataResult {
  sports: Sport[];
  teamsUpserted: number;
  playersUpserted: number;
  matchesUpserted: number;
  standingsUpserted: number;
  articlesGenerated: number;
  warnings: string[];
}

function leagueSlugFromProviderLeagueId(leagueId: string | null | undefined): string | null {
  if (!leagueId) return null;
  if (!leagueId.startsWith("league-")) return null;
  return leagueId.slice("league-".length);
}

function toNullableDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function upsertTeam(team: Team, sport: Sport, leagueId: string | null): Promise<string> {
  const slug = slugify(team.slug || team.name);
  const row = await withDbReconnectRetry(() =>
    prisma.team.upsert({
      where: { slug },
      update: {
        name: team.name,
        shortName: team.shortName ?? null,
        sport,
        leagueId,
        logoUrl: team.logoUrl ?? null,
        city: team.city ?? null,
        foundedYear: team.foundedYear ?? null,
        colorPrimary: team.colorPrimary ?? null,
        colorSecondary: team.colorSecondary ?? null,
      },
      create: {
        name: team.name,
        slug,
        shortName: team.shortName ?? null,
        sport,
        leagueId,
        logoUrl: team.logoUrl ?? null,
        city: team.city ?? null,
        foundedYear: team.foundedYear ?? null,
        colorPrimary: team.colorPrimary ?? null,
        colorSecondary: team.colorSecondary ?? null,
      },
      select: { id: true },
    }),
  );
  return row.id;
}

async function upsertMatch(
  match: Match,
  sport: Sport,
  leagueIdsBySlug: Map<string, string>,
): Promise<{ id: string } | null> {
  const leagueSlug = leagueSlugFromProviderLeagueId(match.leagueId);
  const leagueId = (leagueSlug ? leagueIdsBySlug.get(leagueSlug) : null) ?? null;
  if (!leagueId) return null;

  const homeTeamId = await upsertTeam(match.homeTeam, sport, leagueId);
  const awayTeamId = await upsertTeam(match.awayTeam, sport, leagueId);

  const existing = match.id
    ? await withDbReconnectRetry(() => prisma.match.findFirst({ where: { externalId: match.id }, select: { id: true } }))
    : null;


  const data = {
    sport,
    leagueId,
    homeTeamId,
    awayTeamId,
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    status: match.status,
    startTime: new Date(match.startTime),
    venue: match.venue ?? null,
    clock: match.clock ?? null,
    externalId: match.id,
  };

  if (existing) {
    const row = await withDbReconnectRetry(() =>
      prisma.match.update({ where: { id: existing.id }, data, select: { id: true } }),
    );
    return row;
  }

  const row = await withDbReconnectRetry(() => prisma.match.create({ data, select: { id: true } }));
  return row;
}

async function upsertPlayer(player: Player, sport: Sport, teamId: string | null): Promise<void> {
  const slug = slugify(player.slug || player.name);
  await withDbReconnectRetry(() =>
    prisma.player.upsert({
      where: { slug },
      update: {
        name: player.name,
        sport,
        teamId,
        position: player.position ?? null,
        nationality: player.nationality ?? null,
        dateOfBirth: toNullableDate(player.dateOfBirth),
        photoUrl: player.photoUrl ?? null,
        jerseyNumber: player.jerseyNumber ?? null,
      },
      create: {
        name: player.name,
        slug,
        sport,
        teamId,
        position: player.position ?? null,
        nationality: player.nationality ?? null,
        dateOfBirth: toNullableDate(player.dateOfBirth),
        photoUrl: player.photoUrl ?? null,
        jerseyNumber: player.jerseyNumber ?? null,
      },
    }),
  );
}

export async function syncLiveData(options: SyncLiveDataOptions = {}): Promise<SyncLiveDataResult> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sports = options.sports && options.sports.length > 0 ? options.sports : activeSports.map((s) => s.key);
  const includePlayers = options.includePlayers ?? true;

  const leagues = await prisma.league.findMany({ select: { id: true, slug: true, sport: true } });
  const leagueIdsBySlug = new Map(leagues.map((league) => [league.slug, league.id]));

  let teamsUpserted = 0;
  let playersUpserted = 0;
  let matchesUpserted = 0;
  let standingsUpserted = 0;
  const finishedMatchIds: string[] = [];
  const touchedLeagueIds = new Set<string>();
  const warnings: string[] = [];

  if (sports.includes("FOOTBALL") && !process.env.FOOTBALL_API_KEY) {
    warnings.push("FOOTBALL_API_KEY is not set; football provider will fall back to mock data.");
  }
  if (sports.includes("NBA") && !process.env.NBA_API_KEY) {
    warnings.push("NBA_API_KEY is not set; NBA provider will fall back to mock data.");
  }
  warnings.push("Transfers are editorial/manual today; add a transfer-news API integration to auto-sync transfers.");
  if (process.env.AI_API_KEY && !process.env.NEWS_API_KEY) {
    warnings.push("NEWS_API_KEY is not set; skipping viral-news article generation.");
  }

  for (const sport of sports) {
    const provider = getSportsProvider(sport);

    const providerTeams = await provider.getTeams();
    for (const team of providerTeams) {
      const leagueSlug = leagueSlugFromProviderLeagueId(team.leagueId);
      const leagueId = (leagueSlug ? leagueIdsBySlug.get(leagueSlug) : null) ?? null;
      await upsertTeam(team, sport, leagueId);
      teamsUpserted++;
    }

    const sportLeagues = leagues.filter((league) => league.sport === sport);
    const allMatches = [
      ...(await provider.getLiveMatches()),
      ...(await provider.getUpcomingMatches(100)),
      ...(await provider.getRecentMatches(100)),
      ...(
        await Promise.all(sportLeagues.map(async (league) => provider.getMatchesForLeague(league.slug)))
      ).flat(),
    ];

    const uniqueMatches = new Map<string, Match>();
    for (const match of allMatches) {
      if (!match.id) continue;
      uniqueMatches.set(match.id, match);
    }

    for (const match of uniqueMatches.values()) {
      const saved = await upsertMatch(match, sport, leagueIdsBySlug);
      if (saved) {
        matchesUpserted++;
        if (match.status === "FINISHED") finishedMatchIds.push(saved.id);
      } else {
        warnings.push(`Skipped match ${match.id}: could not resolve league ${match.leagueId}`);
      }
    }

    for (const league of sportLeagues) {
      const standings = await provider.getStandings(league.slug);
      for (const row of standings) {
        const teamId = await upsertTeam(row.team, sport, league.id);
        await withDbReconnectRetry(() =>
          prisma.standing.upsert({
            where: {
              leagueId_teamId_season: {
                leagueId: league.id,
                teamId,
                season: row.season,
              },
            },
            update: {
              position: row.position,
              played: row.played,
              won: row.won,
              drawn: row.drawn,
              lost: row.lost,
              points: row.points,
              goalsFor: row.goalsFor,
              goalsAgainst: row.goalsAgainst,
            },
            create: {
              leagueId: league.id,
              teamId,
              season: row.season,
              position: row.position,
              played: row.played,
              won: row.won,
              drawn: row.drawn,
              lost: row.lost,
              points: row.points,
              goalsFor: row.goalsFor,
              goalsAgainst: row.goalsAgainst,
            },
          }),
        );
        standingsUpserted++;
        touchedLeagueIds.add(league.id);
      }
    }

    if (includePlayers) {
      const dbTeams = await withDbReconnectRetry(() =>
        prisma.team.findMany({ where: { sport }, select: { id: true, slug: true } }),
      );
      for (const dbTeam of dbTeams) {
        const players = await provider.getPlayers(dbTeam.slug);
        for (const player of players) {
          await upsertPlayer(player, sport, dbTeam.id);
          playersUpserted++;
        }
      }
    }
  }

  let articlesGenerated = 0;
  if (process.env.AI_API_KEY) {
    try {
      const genResult = await autoGenerateArticles({
        finishedMatchIds,
        leagueIds: [...touchedLeagueIds],
      });
      articlesGenerated = genResult.articlesGenerated;
      warnings.push(...genResult.errors);
    } catch (error) {
      warnings.push(`Article generation failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  } else {
    warnings.push("AI_API_KEY is not set; skipping automatic article generation.");
  }

  return {
    sports,
    teamsUpserted,
    playersUpserted,
    matchesUpserted,
    standingsUpserted,
    articlesGenerated,
    warnings,
  };
}