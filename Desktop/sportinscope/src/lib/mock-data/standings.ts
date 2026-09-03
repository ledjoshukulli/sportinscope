import type { Standing } from "@/types";
import { mockTeams } from "./teams";

function team(slug: string) {
  const t = mockTeams.find((x) => x.slug === slug);
  if (!t) throw new Error(`Mock team not found: ${slug}`);
  return t;
}

const SEASON = "2025-26";

interface Row {
  slug: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
}

function toStandings(leagueId: string, rows: Row[]): Standing[] {
  return rows
    .map((r, i) => ({
      id: `standing-${leagueId}-${r.slug}`,
      leagueId,
      teamId: team(r.slug).id,
      team: team(r.slug),
      season: SEASON,
      position: i + 1,
      played: r.played,
      won: r.won,
      drawn: r.drawn,
      lost: r.lost,
      points: r.won * 3 + r.drawn,
      goalsFor: r.gf,
      goalsAgainst: r.ga,
    }))
    .sort((a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst))
    .map((s, i) => ({ ...s, position: i + 1 }));
}

export const mockPremierLeagueStandings: Standing[] = toStandings("league-premier-league", [
  { slug: "manchester-city", played: 8, won: 6, drawn: 1, lost: 1, gf: 19, ga: 8 },
  { slug: "arsenal", played: 8, won: 6, drawn: 1, lost: 1, gf: 17, ga: 6 },
  { slug: "liverpool", played: 8, won: 5, drawn: 2, lost: 1, gf: 16, ga: 9 },
  { slug: "chelsea", played: 8, won: 5, drawn: 1, lost: 2, gf: 15, ga: 10 },
  { slug: "newcastle-united", played: 8, won: 4, drawn: 2, lost: 2, gf: 13, ga: 9 },
  { slug: "aston-villa", played: 8, won: 4, drawn: 1, lost: 3, gf: 12, ga: 11 },
  { slug: "tottenham-hotspur", played: 8, won: 3, drawn: 3, lost: 2, gf: 14, ga: 12 },
  { slug: "brighton", played: 8, won: 3, drawn: 2, lost: 3, gf: 11, ga: 11 },
  { slug: "manchester-united", played: 8, won: 3, drawn: 1, lost: 4, gf: 10, ga: 12 },
  { slug: "west-ham", played: 8, won: 2, drawn: 2, lost: 4, gf: 8, ga: 13 },
]);

export const mockLaLigaStandings: Standing[] = toStandings("league-la-liga", [
  { slug: "real-madrid", played: 8, won: 7, drawn: 0, lost: 1, gf: 20, ga: 7 },
  { slug: "barcelona", played: 8, won: 6, drawn: 1, lost: 1, gf: 22, ga: 9 },
  { slug: "atletico-madrid", played: 8, won: 5, drawn: 2, lost: 1, gf: 15, ga: 8 },
  { slug: "sevilla", played: 8, won: 3, drawn: 2, lost: 3, gf: 10, ga: 11 },
]);

export const mockSerieAStandings: Standing[] = toStandings("league-serie-a", [
  { slug: "inter-milan", played: 8, won: 6, drawn: 1, lost: 1, gf: 18, ga: 7 },
  { slug: "napoli", played: 8, won: 5, drawn: 2, lost: 1, gf: 15, ga: 8 },
  { slug: "juventus", played: 8, won: 5, drawn: 1, lost: 2, gf: 14, ga: 9 },
  { slug: "ac-milan", played: 8, won: 4, drawn: 2, lost: 2, gf: 13, ga: 10 },
]);

export const mockBundesligaStandings: Standing[] = toStandings("league-bundesliga", [
  { slug: "bayern-munich", played: 8, won: 7, drawn: 1, lost: 0, gf: 24, ga: 6 },
  { slug: "borussia-dortmund", played: 8, won: 5, drawn: 1, lost: 2, gf: 17, ga: 11 },
  { slug: "rb-leipzig", played: 8, won: 4, drawn: 2, lost: 2, gf: 14, ga: 10 },
]);

export const mockNbaStandings: Standing[] = toStandings("league-nba", [
  { slug: "celtics", played: 12, won: 10, drawn: 0, lost: 2, gf: 0, ga: 0 },
  { slug: "nuggets", played: 12, won: 9, drawn: 0, lost: 3, gf: 0, ga: 0 },
  { slug: "bucks", played: 12, won: 8, drawn: 0, lost: 4, gf: 0, ga: 0 },
  { slug: "lakers", played: 12, won: 7, drawn: 0, lost: 5, gf: 0, ga: 0 },
  { slug: "knicks", played: 12, won: 7, drawn: 0, lost: 5, gf: 0, ga: 0 },
  { slug: "warriors", played: 12, won: 6, drawn: 0, lost: 6, gf: 0, ga: 0 },
  { slug: "suns", played: 12, won: 6, drawn: 0, lost: 6, gf: 0, ga: 0 },
  { slug: "mavericks", played: 12, won: 5, drawn: 0, lost: 7, gf: 0, ga: 0 },
  { slug: "76ers", played: 12, won: 4, drawn: 0, lost: 8, gf: 0, ga: 0 },
  { slug: "timberwolves", played: 12, won: 4, drawn: 0, lost: 8, gf: 0, ga: 0 },
]);

export const mockStandingsByLeagueSlug: Record<string, Standing[]> = {
  "premier-league": mockPremierLeagueStandings,
  "la-liga": mockLaLigaStandings,
  "serie-a": mockSerieAStandings,
  "bundesliga": mockBundesligaStandings,
  "nba": mockNbaStandings,
};
