import { z } from "zod";
import type { Standing, Team } from "@/types";
import { slugify } from "@/lib/utils";

const STANDINGS_URL = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";
const SOURCE = { name: "ESPN", url: "https://www.espn.com/nba/standings" };

const responseSchema = z.object({
  children: z.array(z.object({
    name: z.enum(["Eastern Conference", "Western Conference"]),
    standings: z.object({
      seasonDisplayName: z.string().regex(/^\d{4}-\d{2}$/),
      seasonType: z.literal(2),
      entries: z.array(z.object({
        team: z.object({
          id: z.string().regex(/^\d+$/),
          name: z.string().trim().min(1),
          displayName: z.string().trim().min(1),
          abbreviation: z.string().trim().min(1),
          logos: z.array(z.object({ href: z.string().url() })).optional(),
        }),
        stats: z.array(z.object({
          name: z.string(),
          value: z.number().finite().optional(),
        })),
      })).min(1),
    }),
  })).length(2),
});

export function parseEspnNbaStandings(input: unknown): Standing[] {
  const response = responseSchema.parse(input);
  if (new Set(response.children.map((conference) => conference.name)).size !== 2 ||
      new Set(response.children.map((conference) => conference.standings.seasonDisplayName)).size !== 1) {
    throw new Error("ESPN standings must contain both conferences from the same season.");
  }
  const seenTeams = new Set<string>();
  return response.children.flatMap((conference) => {
    const seenRanks = new Set<number>();
    return conference.standings.entries.map(({ team: rawTeam, stats }) => {
      const stat = (name: string): number => {
        const matches = stats.filter((value) => value.name === name);
        const value = matches.length === 1 ? matches[0]?.value : undefined;
        if (value === undefined) throw new Error(`ESPN standings missing ${name} for ${rawTeam.displayName}.`);
        return value;
      };
      const won = stat("wins");
      const lost = stat("losses");
      const position = stat("playoffSeed");
      const winPercentage = stat("winPercent");
      const goalsFor = stat("pointsFor");
      const goalsAgainst = stat("pointsAgainst");
      if (![won, lost, goalsFor, goalsAgainst].every((value) => Number.isInteger(value) && value >= 0) ||
          !Number.isInteger(position) || position < 1 || position > conference.standings.entries.length ||
          winPercentage < 0 || winPercentage > 1 ||
          seenTeams.has(rawTeam.id) || seenRanks.has(position)) {
        throw new Error(`ESPN standings contain an invalid or duplicate record for ${rawTeam.displayName}.`);
      }
      seenTeams.add(rawTeam.id);
      seenRanks.add(position);
      const team: Team = {
        id: `espn-team-${rawTeam.id}`,
        name: rawTeam.displayName,
        slug: slugify(rawTeam.name),
        shortName: rawTeam.abbreviation,
        sport: "NBA",
        leagueId: "league-nba",
        logoUrl: rawTeam.logos?.[0]?.href ?? null,
      };
      return {
        id: `espn-standing-${rawTeam.id}-${conference.standings.seasonDisplayName}`,
        leagueId: "league-nba",
        teamId: team.id,
        team,
        season: conference.standings.seasonDisplayName,
        conference: conference.name,
        position,
        played: won + lost,
        won,
        drawn: 0,
        lost,
        // Shared storage uses wins for basketball; the NBA UI does not display football points.
        points: won,
        goalsFor,
        goalsAgainst,
        winPercentage,
        gamesBehind: stat("gamesBehind"),
        source: SOURCE,
      };
    });
  });
}

export async function getEspnNbaStandings(): Promise<Standing[]> {
  const response = await fetch(STANDINGS_URL, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`ESPN NBA standings request failed: ${response.status} ${response.statusText}`);
  }
  return parseEspnNbaStandings(await response.json());
}
