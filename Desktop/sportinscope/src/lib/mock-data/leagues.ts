import type { League } from "@/types";

export const mockLeagues: League[] = [
  {
    id: "league-premier-league",
    name: "Premier League",
    slug: "premier-league",
    sport: "FOOTBALL",
    country: "England",
    logoUrl: "/leagues/premier-league.svg",
    tier: 1,
  },
  {
    id: "league-champions-league",
    name: "Champions League",
    slug: "champions-league",
    sport: "FOOTBALL",
    country: "Europe",
    logoUrl: "/leagues/champions-league.svg",
    tier: 1,
  },
  {
    id: "league-la-liga",
    name: "La Liga",
    slug: "la-liga",
    sport: "FOOTBALL",
    country: "Spain",
    logoUrl: "/leagues/la-liga.svg",
    tier: 1,
  },
  {
    id: "league-serie-a",
    name: "Serie A",
    slug: "serie-a",
    sport: "FOOTBALL",
    country: "Italy",
    logoUrl: "/leagues/serie-a.svg",
    tier: 1,
  },
  {
    id: "league-bundesliga",
    name: "Bundesliga",
    slug: "bundesliga",
    sport: "FOOTBALL",
    country: "Germany",
    logoUrl: "/leagues/bundesliga.svg",
    tier: 1,
  },
  {
    id: "league-ligue-1",
    name: "Ligue 1",
    slug: "ligue-1",
    sport: "FOOTBALL",
    country: "France",
    logoUrl: "/leagues/ligue-1.svg",
    tier: 1,
  },
  {
    id: "league-nba",
    name: "NBA",
    slug: "nba",
    sport: "NBA",
    country: "United States",
    logoUrl: "/leagues/nba.svg",
    tier: 1,
  },
];

export function getMockLeagueBySlug(slug: string): League | undefined {
  return mockLeagues.find((l) => l.slug === slug);
}
