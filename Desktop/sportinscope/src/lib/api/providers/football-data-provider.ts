import type { Match, MatchStatus, Player, Standing, Team } from "@/types";
import type { SportsDataProvider } from "./types";
import { MockSportsProvider } from "./mock-provider";
import { slugify } from "@/lib/utils";

/**
 * Live implementation backed by football-data.org (v4). Activated
 * automatically once FOOTBALL_API_KEY is set — see src/lib/api/index.ts.
 *
 * NOTE: field names below match football-data.org's documented v4 response
 * shape at the time this was written. Double-check against the current API
 * docs (https://www.football-data.org/documentation/quickstart) if you use
 * a different competitions/plan tier, and adjust `mapMatch` accordingly.
 */
const BASE_URL = process.env.FOOTBALL_API_BASE_URL ?? "https://api.football-data.org/v4";

const LEAGUE_CODE_BY_SLUG: Record<string, string> = {
  "premier-league": "PL",
  "champions-league": "CL",
  "la-liga": "PD",
  "serie-a": "SA",
  "bundesliga": "BL1",
  "ligue-1": "FL1",
};

function statusFromApi(status: string): MatchStatus {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
      return "LIVE";
    case "FINISHED":
      return "FINISHED";
    case "POSTPONED":
      return "POSTPONED";
    case "CANCELLED":
    case "SUSPENDED":
      return "CANCELLED";
    default:
      return "SCHEDULED";
  }
}

interface ApiTeamRef {
  id: number;
  name: string | null;
  shortName?: string | null;
  tla?: string | null;
  crest?: string;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  minute?: number | null;
  venue?: string | null;
  competition: { id: number; name: string };
  homeTeam: ApiTeamRef;
  awayTeam: ApiTeamRef;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

interface ApiCompetition {
  id: number;
  name: string;
  code?: string;
}

interface ApiCompetitionTeamsResponse {
  competition: ApiCompetition;
  teams: ApiTeamRef[];
}

interface ApiSquadPlayer {
  id: number;
  name: string;
  position?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  shirtNumber?: number | null;
}

interface ApiTeamWithSquad {
  id: number;
  squad?: ApiSquadPlayer[];
}

function toTeamStub(t: ApiTeamRef): Team {
  const name = t.name || t.shortName || t.tla || `Team ${t.id}`;
  return {
    id: `fd-team-${t.id}`,
    name,
    slug: (t.shortName || name).toLowerCase().replace(/\s+/g, "-"),
    shortName: t.tla ?? t.shortName ?? null,
    sport: "FOOTBALL",
    leagueId: null,
    logoUrl: t.crest ?? null,
    city: null,
    foundedYear: null,
    colorPrimary: null,
    colorSecondary: null,
  };
}

function mapMatch(m: ApiMatch, leagueId: string): Match {
  return {
    id: `fd-match-${m.id}`,
    sport: "FOOTBALL",
    leagueId,
    // Matches from the general (non-competition-scoped) endpoint don't
    // resolve to one of our known leagues, but the API still tells us the
    // real competition name — show that instead of a generic "Match" label.
    league:
      leagueId === "league-unknown"
        ? {
            id: `fd-competition-${m.competition.id}`,
            name: m.competition.name,
            slug: slugify(m.competition.name),
            sport: "FOOTBALL",
          }
        : undefined,
    homeTeamId: `fd-team-${m.homeTeam.id}`,
    homeTeam: toTeamStub(m.homeTeam),
    awayTeamId: `fd-team-${m.awayTeam.id}`,
    awayTeam: toTeamStub(m.awayTeam),
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    status: statusFromApi(m.status),
    startTime: m.utcDate,
    venue: m.venue ?? null,
    clock: m.minute ? `${m.minute}'` : null,
  };
}

async function apiFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": apiKey ?? "" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`football-data.org request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export class FootballDataProvider implements SportsDataProvider {
  readonly sport = "FOOTBALL" as const;
  /** Falls back to mock data if a live request ever fails, so the site never shows a broken page because of a third-party outage. */
  private fallback = new MockSportsProvider("FOOTBALL");
  /** In-process cache: without it, getTeamBySlug/getPlayers would re-fetch all
   *  6 competitions' team lists on every call (e.g. once per team during a
   *  player sync), multiplying request volume ~7x against a rate-limited API. */
  private teamsCache: { data: Team[]; expiresAt: number } | null = null;

  async getLiveMatches(): Promise<Match[]> {
    try {
      const data = await apiFetch<{ matches: ApiMatch[] }>("/matches?status=LIVE", 30);
      return data.matches.map((m) => mapMatch(m, "league-unknown"));
    } catch {
      return this.fallback.getLiveMatches();
    }
  }

  async getUpcomingMatches(limit = 10): Promise<Match[]> {
    try {
      // Bound to the next 9 days so this never surfaces fixtures scheduled
      // months out ahead of genuinely upcoming ones. (The free-tier /matches
      // endpoint rejects ranges over 10 days.) No `status` filter here: the
      // API uses both SCHEDULED (no confirmed kickoff yet) and TIMED (has a
      // confirmed kickoff) for not-yet-played fixtures, so filter client-side.
      const dateFrom = new Date().toISOString().slice(0, 10);
      const dateTo = new Date(Date.now() + 9 * 86_400_000).toISOString().slice(0, 10);
      const data = await apiFetch<{ matches: ApiMatch[] }>(`/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, 300);
      return data.matches
        .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
        .map((m) => mapMatch(m, "league-unknown"))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, limit);
    } catch {
      return this.fallback.getUpcomingMatches(limit);
    }
  }

  async getRecentMatches(limit = 10): Promise<Match[]> {
    try {
      // Bound to the last 9 days — without a date range the API returns
      // finished matches from anywhere in its history, oldest first. (The
      // free-tier /matches endpoint rejects ranges over 10 days.)
      const dateTo = new Date().toISOString().slice(0, 10);
      const dateFrom = new Date(Date.now() - 9 * 86_400_000).toISOString().slice(0, 10);
      const data = await apiFetch<{ matches: ApiMatch[] }>(
        `/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        300,
      );
      return data.matches
        .map((m) => mapMatch(m, "league-unknown"))
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, limit);
    } catch {
      return this.fallback.getRecentMatches(limit);
    }
  }

  async getMatchesForLeague(leagueSlug: string): Promise<Match[]> {
    const code = LEAGUE_CODE_BY_SLUG[leagueSlug];
    if (!code) return this.fallback.getMatchesForLeague(leagueSlug);
    try {
      const data = await apiFetch<{ matches: ApiMatch[] }>(`/competitions/${code}/matches`, 300);
      return data.matches.map((m) => mapMatch(m, `league-${leagueSlug}`));
    } catch {
      return this.fallback.getMatchesForLeague(leagueSlug);
    }
  }

  async getStandings(leagueSlug: string): Promise<Standing[]> {
    const code = LEAGUE_CODE_BY_SLUG[leagueSlug];
    if (!code) return this.fallback.getStandings(leagueSlug);
    try {
      interface ApiStandingRow {
        position: number;
        team: ApiTeamRef;
        playedGames: number;
        won: number;
        draw: number;
        lost: number;
        points: number;
        goalsFor: number;
        goalsAgainst: number;
      }
      interface ApiStandingsResponse {
        season: { startDate: string; endDate: string };
        standings: { type: string; table: ApiStandingRow[] }[];
      }
      const data = await apiFetch<ApiStandingsResponse>(`/competitions/${code}/standings`, 900);
      const table = data.standings.find((s) => s.type === "TOTAL")?.table ?? [];
      const season = `${new Date(data.season.startDate).getFullYear()}-${String(
        new Date(data.season.endDate).getFullYear(),
      ).slice(2)}`;
      return table.map((row) => ({
        id: `fd-standing-${leagueSlug}-${row.team.id}`,
        leagueId: `league-${leagueSlug}`,
        teamId: `fd-team-${row.team.id}`,
        team: toTeamStub(row.team),
        season,
        position: row.position,
        played: row.playedGames,
        won: row.won,
        drawn: row.draw,
        lost: row.lost,
        points: row.points,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
      }));
    } catch {
      return this.fallback.getStandings(leagueSlug);
    }
  }

  async getTeams(): Promise<Team[]> {
    if (this.teamsCache && this.teamsCache.expiresAt > Date.now()) {
      return this.teamsCache.data;
    }
    try {
      const responses = await Promise.all(
        Object.entries(LEAGUE_CODE_BY_SLUG).map(async ([leagueSlug, code]) => {
          const data = await apiFetch<ApiCompetitionTeamsResponse>(`/competitions/${code}/teams`, 21_600);
          return { leagueSlug, teams: data.teams };
        }),
      );

      const byId = new Map<number, Team>();
      for (const { leagueSlug, teams } of responses) {
        for (const t of teams) {
          byId.set(t.id, {
            ...toTeamStub(t),
            leagueId: `league-${leagueSlug}`,
          });
        }
      }

      const teams = [...byId.values()];
      this.teamsCache = { data: teams, expiresAt: Date.now() + 21_600 * 1000 };
      return teams;
    } catch {
      return this.fallback.getTeams();
    }
  }

  async getTeamBySlug(slug: string): Promise<Team | null> {
    try {
      const teams = await this.getTeams();
      return teams.find((team) => team.slug === slug) ?? null;
    } catch {
      return this.fallback.getTeamBySlug(slug);
    }
  }

  async getPlayers(teamSlug: string): Promise<Player[]> {
    try {
      const team = await this.getTeamBySlug(teamSlug);
      if (!team) return this.fallback.getPlayers(teamSlug);

      const teamId = Number(team.id.replace("fd-team-", ""));
      if (!Number.isFinite(teamId)) return this.fallback.getPlayers(teamSlug);

      const data = await apiFetch<ApiTeamWithSquad>(`/teams/${teamId}`, 21_600);
      const squad = data.squad ?? [];

      return squad.map((p) => ({
        id: `fd-player-${p.id}`,
        name: p.name,
        slug: `${(p.name ?? "player").toLowerCase().replace(/\s+/g, "-")}-${p.id}`,
        sport: "FOOTBALL",
        teamId: team.id,
        team,
        position: p.position ?? null,
        nationality: p.nationality ?? null,
        dateOfBirth: p.dateOfBirth ?? null,
        photoUrl: null,
        jerseyNumber: p.shirtNumber ?? null,
      }));
    } catch {
      return this.fallback.getPlayers(teamSlug);
    }
  }
}
