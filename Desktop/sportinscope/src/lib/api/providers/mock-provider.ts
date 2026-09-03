import type { Match, Player, Sport, Standing, Team } from "@/types";
import type { SportsDataProvider } from "./types";
import { generateMockMatches } from "@/lib/mock-data/matches";
import { getMockTeamsBySport, getMockTeamBySlug, mockTeams } from "@/lib/mock-data/teams";
import { mockPlayers, getMockPlayersByTeam } from "@/lib/mock-data/players";
import { mockStandingsByLeagueSlug } from "@/lib/mock-data/standings";
import { getMockLeagueBySlug } from "@/lib/mock-data/leagues";

/**
 * Default provider used whenever a real API key isn't configured. Every
 * method has the same async shape a real HTTP-backed provider would have,
 * so pages/components never need to know which one is active.
 */
export class MockSportsProvider implements SportsDataProvider {
  constructor(public readonly sport: Sport) {}

  async getLiveMatches(): Promise<Match[]> {
    return generateMockMatches().filter((m) => m.sport === this.sport && m.status === "LIVE");
  }

  async getUpcomingMatches(limit = 10): Promise<Match[]> {
    return generateMockMatches()
      .filter((m) => m.sport === this.sport && m.status === "SCHEDULED")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, limit);
  }

  async getRecentMatches(limit = 10): Promise<Match[]> {
    return generateMockMatches()
      .filter((m) => m.sport === this.sport && m.status === "FINISHED")
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async getMatchesForLeague(leagueSlug: string): Promise<Match[]> {
    const league = getMockLeagueBySlug(leagueSlug);
    if (!league) return [];
    return generateMockMatches().filter((m) => m.leagueId === league.id);
  }

  async getStandings(leagueSlug: string): Promise<Standing[]> {
    return mockStandingsByLeagueSlug[leagueSlug] ?? [];
  }

  async getTeams(): Promise<Team[]> {
    return getMockTeamsBySport(this.sport);
  }

  async getTeamBySlug(slug: string): Promise<Team | null> {
    const t = getMockTeamBySlug(slug);
    return t && t.sport === this.sport ? t : null;
  }

  async getPlayers(teamSlug: string): Promise<Player[]> {
    const t = getMockTeamBySlug(teamSlug);
    if (!t) return [];
    return getMockPlayersByTeam(t.id);
  }
}

/** Escape hatch for code (e.g. search) that needs every team/player regardless of sport. */
export function getAllMockTeams(): Team[] {
  return mockTeams;
}
export function getAllMockPlayers(): Player[] {
  return mockPlayers;
}
