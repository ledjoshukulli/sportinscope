import type { Match, Player, Standing, Team } from "@/types";
import type { SportsDataProvider } from "./types";
import { MockSportsProvider } from "./mock-provider";

/**
 * Live implementation backed by balldontlie.io (v1). Activated automatically
 * once NBA_API_KEY is set — see src/lib/api/index.ts.
 *
 * NOTE: verify field names against the current balldontlie API docs
 * (https://docs.balldontlie.io) for your subscription tier — response
 * shapes have changed across API versions — and adjust the mappers below.
 */
const BASE_URL = process.env.NBA_API_BASE_URL ?? "https://api.balldontlie.io/v1";

interface ApiTeam {
  id: number;
  full_name: string;
  name: string;
  abbreviation: string;
  city: string;
}

interface ApiGame {
  id: number;
  date: string;
  status: string;
  period: number;
  time: string | null;
  home_team: ApiTeam;
  visitor_team: ApiTeam;
  home_team_score: number;
  visitor_team_score: number;
}

interface ApiPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position?: string | null;
}

function toTeamStub(t: ApiTeam): Team {
  return {
    id: `bdl-team-${t.id}`,
    name: t.full_name,
    slug: t.name.toLowerCase().replace(/\s+/g, "-"),
    shortName: t.abbreviation,
    sport: "NBA",
    leagueId: "league-nba",
    logoUrl: null,
    city: t.city,
    foundedYear: null,
    colorPrimary: null,
    colorSecondary: null,
  };
}

function mapGame(g: ApiGame): Match {
  const isLive = g.status !== "Final" && !g.status.includes(":") && g.period > 0;
  return {
    id: `bdl-game-${g.id}`,
    sport: "NBA",
    leagueId: "league-nba",
    homeTeamId: `bdl-team-${g.home_team.id}`,
    homeTeam: toTeamStub(g.home_team),
    awayTeamId: `bdl-team-${g.visitor_team.id}`,
    awayTeam: toTeamStub(g.visitor_team),
    homeScore: g.home_team_score,
    awayScore: g.visitor_team_score,
    status: g.status === "Final" ? "FINISHED" : isLive ? "LIVE" : "SCHEDULED",
    startTime: g.date,
    venue: null,
    clock: isLive ? `Q${g.period} ${g.time ?? ""}`.trim() : null,
  };
}

async function apiFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const apiKey = process.env.NBA_API_KEY;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: apiKey ?? "" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`balldontlie request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export class NBADataProvider implements SportsDataProvider {
  readonly sport = "NBA" as const;
  private fallback = new MockSportsProvider("NBA");

  async getLiveMatches(): Promise<Match[]> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const data = await apiFetch<{ data: ApiGame[] }>(`/games?dates[]=${today}`, 30);
      return data.data.filter((g) => g.status !== "Final" && g.period > 0).map(mapGame);
    } catch {
      return this.fallback.getLiveMatches();
    }
  }

  async getUpcomingMatches(limit = 10): Promise<Match[]> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const data = await apiFetch<{ data: ApiGame[] }>(`/games?start_date=${today}&per_page=${limit}`, 300);
      return data.data.filter((g) => g.status !== "Final").slice(0, limit).map(mapGame);
    } catch {
      return this.fallback.getUpcomingMatches(limit);
    }
  }

  async getRecentMatches(limit = 10): Promise<Match[]> {
    try {
      // Bound to the last 14 days — without a date range balldontlie returns
      // games in id order, i.e. the oldest games in its database first.
      const endDate = new Date().toISOString().slice(0, 10);
      const startDate = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
      const data = await apiFetch<{ data: ApiGame[] }>(
        `/games?start_date=${startDate}&end_date=${endDate}&per_page=100`,
        300,
      );
      return data.data
        .filter((g) => g.status === "Final")
        .map(mapGame)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, limit);
    } catch {
      return this.fallback.getRecentMatches(limit);
    }
  }

  async getMatchesForLeague(): Promise<Match[]> {
    // NBA has a single top-level league in this app's model.
    return [...(await this.getUpcomingMatches(20)), ...(await this.getRecentMatches(20))];
  }

  async getStandings(leagueSlug: string): Promise<Standing[]> {
    return this.fallback.getStandings(leagueSlug);
  }

  async getTeams(): Promise<Team[]> {
    try {
      const data = await apiFetch<{ data: ApiTeam[] }>("/teams", 86_400);
      return data.data.map(toTeamStub);
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

      const teamId = Number(team.id.replace("bdl-team-", ""));
      if (!Number.isFinite(teamId)) return this.fallback.getPlayers(teamSlug);

      const data = await apiFetch<{ data: ApiPlayer[] }>(`/players?team_ids[]=${teamId}&per_page=100`, 43_200);
      return data.data.map((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.trim();
        return {
          id: `bdl-player-${p.id}`,
          name: fullName,
          slug: `${fullName.toLowerCase().replace(/\s+/g, "-")}-${p.id}`,
          sport: "NBA",
          teamId: team.id,
          team,
          position: p.position || null,
          nationality: null,
          dateOfBirth: null,
          photoUrl: null,
          jerseyNumber: null,
        };
      });
    } catch {
      return this.fallback.getPlayers(teamSlug);
    }
  }
}
