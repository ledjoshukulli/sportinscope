import { describe, expect, it } from "vitest";
import { mockPremierLeagueStandings } from "@/lib/mock-data/standings";
import { buildMatchContext, getStandingsSnapshot, hasReportedScore, type ReportedMatch } from "./reporting-context";

const sourcedRows = mockPremierLeagueStandings.map((row, index) => ({
  ...row, id: `fd-standing-premier-league-${index + 1}`,
}));

const match: ReportedMatch = {
  externalId: "bdl-game-123",
  startTime: new Date("2026-11-12T20:00:00Z"),
  homeTeamId: "home",
  awayTeamId: "away",
  homeTeam: { name: "Home" },
  awayTeam: { name: "Away" },
  homeScore: 123,
  awayScore: 112,
};

describe("sourced match context", () => {
  it("rejects demo and missing final scores but accepts a real zero score", () => {
    expect(hasReportedScore({ ...match, externalId: "match-123" })).toBe(false);
    expect(hasReportedScore({ ...match, homeScore: null })).toBe(false);
    expect(hasReportedScore({ ...match, homeScore: -1 })).toBe(false);
    expect(hasReportedScore({ ...match, externalId: "fd-match-456", homeScore: 0 })).toBe(true);
    expect(() => buildMatchContext({ ...match, homeScore: null }, [])).toThrow("complete final score");
  });

  it("includes only earlier sourced results and explains the incomplete sample", () => {
    const context = buildMatchContext(match, [
      { ...match, externalId: "bdl-game-122", startTime: new Date("2026-11-10T20:00:00Z"), homeScore: 100 },
      { ...match, externalId: "bdl-game-124", startTime: new Date("2026-11-13T20:00:00Z") },
      { ...match, externalId: "demo-125", startTime: new Date("2026-11-09T20:00:00Z") },
    ]);
    expect(context).toContain("Home 100-112 Away (bdl-game-122)");
    expect(context).not.toContain("bdl-game-124");
    expect(context).not.toContain("demo-125");
    expect(context).toContain("not necessarily a complete");
    expect(context).toContain("NBA standings are not part of this match recap");
  });
});

describe("standings snapshots", () => {
  it("rejects mixed seasons and duplicate teams", () => {
    const row = sourcedRows[0]!;
    expect(() => getStandingsSnapshot([row, { ...sourcedRows[1]!, season: "2026-27" }]))
      .toThrow("different seasons");
    expect(() => getStandingsSnapshot([row, row])).toThrow("duplicate teams");
  });

  it("deduplicates unchanged tables regardless of input order and changes the key when results change", () => {
    const snapshot = getStandingsSnapshot(sourcedRows);
    expect(getStandingsSnapshot([...sourcedRows].reverse()).key).toBe(snapshot.key);
    expect(getStandingsSnapshot(sourcedRows.map((row, index) =>
      index === 0 ? { ...row, played: row.played + 1, won: row.won + 1, points: row.points + 3 } : row)).key)
      .not.toBe(snapshot.key);
    expect(snapshot.context).toContain("Season: 2025-26");
    expect(snapshot.context).toContain("goal difference 11");
    expect(snapshot.context).toContain("Unequal games played");
  });

  it("rejects inconsistent records rather than producing invented analysis", () => {
    expect(() => getStandingsSnapshot(mockPremierLeagueStandings)).toThrow("live-provider source");
    expect(() => getStandingsSnapshot([{ ...sourcedRows[0]!, played: 100 }]))
      .toThrow("Invalid standings record");
  });
});
