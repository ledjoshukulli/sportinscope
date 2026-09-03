import type { Sport, Team } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockTeams, getMockTeamBySlug, getMockTeamsBySport } from "@/lib/mock-data/teams";

export async function getAllTeams(): Promise<Team[]> {
  if (isDatabaseConfigured()) return prisma.team.findMany({ include: { league: true }, orderBy: { name: "asc" } });
  return mockTeams;
}

export async function getTeamsBySport(sport: Sport): Promise<Team[]> {
  if (isDatabaseConfigured())
    return prisma.team.findMany({ where: { sport }, include: { league: true }, orderBy: { name: "asc" } });
  return getMockTeamsBySport(sport);
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  if (isDatabaseConfigured()) return prisma.team.findUnique({ where: { slug }, include: { league: true } });
  return getMockTeamBySlug(slug) ?? null;
}
