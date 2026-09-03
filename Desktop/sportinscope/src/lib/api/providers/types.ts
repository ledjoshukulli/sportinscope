import type { Match, Player, Sport, Standing, Team } from "@/types";

/**
 * Contract every sports data source must implement, whether it's backed by
 * mock data, a live API, or the database. UI code (ScoreCard, MatchCenter,
 * LeagueTable, etc.) only ever talks to this interface — never to a
 * specific vendor's response shape — so swapping providers later never
 * requires touching components or pages.
 */
export interface SportsDataProvider {
  readonly sport: Sport;

  getLiveMatches(): Promise<Match[]>;
  getUpcomingMatches(limit?: number): Promise<Match[]>;
  getRecentMatches(limit?: number): Promise<Match[]>;
  getMatchesForLeague(leagueSlug: string): Promise<Match[]>;
  getStandings(leagueSlug: string): Promise<Standing[]>;
  getTeams(): Promise<Team[]>;
  getTeamBySlug(slug: string): Promise<Team | null>;
  getPlayers(teamSlug: string): Promise<Player[]>;
}
