import type { League } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockLeagues, getMockLeagueBySlug } from "@/lib/mock-data/leagues";

export async function getAllLeagues(): Promise<League[]> {
  if (isDatabaseConfigured()) return prisma.league.findMany({ orderBy: { name: "asc" } });
  return mockLeagues;
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  if (!slug) return null;
  let league: League | null = null;
  if (isDatabaseConfigured()) {
    league = await prisma.league.findUnique({ where: { slug } });
  } else {
    league = getMockLeagueBySlug(slug) ?? null;
  }
  if (league) return league;

  // Fallback for lower leagues or un-tracked competitions
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: `fallback-league-${slug}`,
    name,
    slug,
    sport: "FOOTBALL",
    logoUrl: null,
    country: null,
  };
}
