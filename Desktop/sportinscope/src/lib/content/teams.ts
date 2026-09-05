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
  if (!slug) return null;
  let team: Team | null = null;
  if (isDatabaseConfigured()) {
    team = await prisma.team.findUnique({ where: { slug }, include: { league: true } });
  } else {
    team = getMockTeamBySlug(slug) ?? null;
  }
  if (team) return team;

  // Fallback for teams from lower leagues or live providers not in DB/mock
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: `fallback-team-${slug}`,
    name,
    slug,
    shortName: name.length > 3 ? name.slice(0, 3).toUpperCase() : name.toUpperCase(),
    sport: "FOOTBALL",
    leagueId: null,
    league: null,
    logoUrl: null,
    city: null,
    foundedYear: null,
    colorPrimary: null,
    colorSecondary: null,
  };
}
