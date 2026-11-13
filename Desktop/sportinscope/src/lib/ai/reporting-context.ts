import { createHash } from "node:crypto";
import type { Standing } from "@/types";

export interface ReportedMatch {
  externalId: string | null;
  startTime: Date;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore: number | null;
  awayScore: number | null;
}

export function hasReportedScore(match: ReportedMatch): match is ReportedMatch & { homeScore: number; awayScore: number } {
  return /^(fd-match-|bdl-game-)\d+$/.test(match.externalId ?? "") &&
    Number.isInteger(match.homeScore) && Number.isInteger(match.awayScore) &&
    match.homeScore !== null && match.awayScore !== null &&
    match.homeScore >= 0 && match.awayScore >= 0;
}

export function buildMatchContext(match: ReportedMatch, history: ReportedMatch[]): string {
  if (!hasReportedScore(match)) throw new Error("Match has no supported live source or complete final score.");
  const lines = [
    `Match date (UTC): ${match.startTime.toISOString()}.`,
    `Source record: ${match.externalId}.`,
  ];

  for (const [teamId, name] of [[match.homeTeamId, match.homeTeam.name], [match.awayTeamId, match.awayTeam.name]]) {
    const recent = history
      .filter((game) => hasReportedScore(game) && game.startTime < match.startTime &&
        (game.homeTeamId === teamId || game.awayTeamId === teamId))
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 5);
    if (!recent.length) {
      lines.push(`${name}: no earlier sourced results available in our database.`);
      continue;
    }
    const scores = recent.map((game) =>
      `${game.startTime.toISOString().slice(0, 10)}: ${game.homeTeam.name} ${game.homeScore}-${game.awayScore} ${game.awayTeam.name} (${game.externalId})`);
    lines.push(`${name} - latest ${recent.length} available earlier results:\n${scores.join("\n")}`);
  }
  lines.push("These are available recorded results, not necessarily a complete recent-form sample. Final scores do not describe tactics or match events.");
  lines.push(match.externalId?.startsWith("fd-match-")
    ? "Data source: football-data.org (https://www.football-data.org/)."
    : "Data source: balldontlie (https://www.balldontlie.io/). NBA standings are not part of this match recap's source data.");
  return lines.join("\n\n");
}

export function getStandingsSnapshot(rows: Standing[]): { rows: Standing[]; season: string; key: string; context: string } {
  if (!rows.length) throw new Error("No sourced standings available.");
  if (rows.some((row) => !/^fd-standing-[a-z0-9-]+-\d+$/.test(row.id))) {
    throw new Error("Refusing standings without supported live-provider source records.");
  }
  const seasons = [...new Set(rows.map((row) => row.season))];
  if (seasons.length !== 1) throw new Error("Refusing to combine standings from different seasons.");
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  if (new Set(sorted.map((row) => row.teamId)).size !== sorted.length) {
    throw new Error("Standings contain duplicate teams.");
  }
  for (const row of sorted) {
    if (![row.position, row.played, row.won, row.drawn, row.lost, row.points, row.goalsFor, row.goalsAgainst]
      .every((value) => Number.isInteger(value) && value >= 0) ||
      row.position < 1 || row.won + row.drawn + row.lost !== row.played) {
      throw new Error(`Invalid standings record for ${row.team.name}.`);
    }
  }
  const season = seasons[0]!;
  const table = sorted.map((row) => ({
    team: row.team.name, position: row.position, played: row.played, won: row.won,
    drawn: row.drawn, lost: row.lost, points: row.points, goalsFor: row.goalsFor, goalsAgainst: row.goalsAgainst,
  }));
  const key = createHash("sha256").update(JSON.stringify({ season, table })).digest("hex").slice(0, 16);
  const leader = sorted[0]!;
  const context = [
    `Season: ${season}.`,
    ...sorted.map((row) =>
      `${row.position}. ${row.team.name}: P${row.played}, W${row.won}, D${row.drawn}, L${row.lost}, ${row.points} points; goals ${row.goalsFor}-${row.goalsAgainst}, goal difference ${row.goalsFor - row.goalsAgainst}; ${leader.points - row.points} points behind the first-placed team.`),
    "Points gaps are a snapshot, not predictions. Unequal games played limit direct comparisons. No previous table is supplied, so changes in position cannot be established.",
    "Data source: football-data.org (https://www.football-data.org/).",
  ].join("\n\n");
  return { rows: sorted, season, key, context };
}

export function appendReportingNotes(content: string, context: string): string {
  return `${content.trim()}\n\nData and reporting notes\n\n${context}\n\nThis article was generated automatically using the supplied data and has not been reviewed by a human before publication.`;
}
