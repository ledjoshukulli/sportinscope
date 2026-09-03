import type { League } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockLeagues, getMockLeagueBySlug } from "@/lib/mock-data/leagues";

export async function getAllLeagues(): Promise<League[]> {
  if (isDatabaseConfigured()) return prisma.league.findMany({ orderBy: { name: "asc" } });
  return mockLeagues;
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  if (isDatabaseConfigured()) return prisma.league.findUnique({ where: { slug } });
  return getMockLeagueBySlug(slug) ?? null;
}
