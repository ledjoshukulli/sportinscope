import type { Player } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockPlayers, getMockPlayerBySlug, getMockPlayersByTeam } from "@/lib/mock-data/players";

/** Prisma stores dateOfBirth as a native Date; our domain type expects an ISO string. */
function toPlayer<T extends { dateOfBirth: Date | null }>(
  row: T,
): Omit<T, "dateOfBirth"> & Pick<Player, "dateOfBirth"> {
  return { ...row, dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toISOString() : null };
}

export async function getAllPlayers(): Promise<Player[]> {
  if (isDatabaseConfigured()) {
    const rows = await prisma.player.findMany({ include: { team: true }, orderBy: { name: "asc" } });
    return rows.map(toPlayer);
  }
  return mockPlayers;
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  if (isDatabaseConfigured()) {
    const row = await prisma.player.findUnique({ where: { slug }, include: { team: true } });
    return row ? toPlayer(row) : null;
  }
  return getMockPlayerBySlug(slug) ?? null;
}

export async function getPlayersByTeamId(teamId: string): Promise<Player[]> {
  if (isDatabaseConfigured()) {
    const rows = await prisma.player.findMany({ where: { teamId }, include: { team: true } });
    return rows.map(toPlayer);
  }
  return getMockPlayersByTeam(teamId);
}
