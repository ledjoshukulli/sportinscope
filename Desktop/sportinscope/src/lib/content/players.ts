import type { Player } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockPlayers, getMockPlayerBySlug, getMockPlayersByTeam } from "@/lib/mock-data/players";

export async function getAllPlayers(): Promise<Player[]> {
  if (isDatabaseConfigured()) return prisma.player.findMany({ include: { team: true }, orderBy: { name: "asc" } });
  return mockPlayers;
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  if (isDatabaseConfigured()) return prisma.player.findUnique({ where: { slug }, include: { team: true } });
  return getMockPlayerBySlug(slug) ?? null;
}

export async function getPlayersByTeamId(teamId: string): Promise<Player[]> {
  if (isDatabaseConfigured()) return prisma.player.findMany({ where: { teamId }, include: { team: true } });
  return getMockPlayersByTeam(teamId);
}
