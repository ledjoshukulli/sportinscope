import { afterEach, describe, expect, it, vi } from "vitest";
import { getEspnNbaStandings, parseEspnNbaStandings } from "./espn-nba-standings";

function entry(id: string, name: string, rank: number, wins: number, losses: number) {
  return {
    team: { id, name, displayName: `City ${name}`, abbreviation: name.slice(0, 3).toUpperCase() },
    stats: [
      { name: "wins", value: wins },
      { name: "losses", value: losses },
      { name: "playoffSeed", value: rank },
      { name: "winPercent", value: wins / (wins + losses) },
      { name: "gamesBehind", value: rank === 1 ? 0 : 0.5 },
      { name: "pointsFor", value: 1200 },
      { name: "pointsAgainst", value: 1100 },
      { name: "overall" },
    ],
  };
}

function fixture() {
  return {
    children: [
      { name: "Eastern Conference", standings: {
        seasonDisplayName: "2026-27", seasonType: 2,
        entries: [entry("1", "Bulls", 2, 7, 3), entry("2", "Celtics", 1, 7, 3)],
      } },
      { name: "Western Conference", standings: {
        seasonDisplayName: "2026-27", seasonType: 2,
        entries: [entry("3", "Lakers", 1, 8, 2), entry("4", "Trail Blazers", 2, 7, 3)],
      } },
    ],
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("ESPN NBA standings", () => {
  it("uses ESPN conference ranks, preserves tied records and fractional games behind, and keeps compatible team slugs", () => {
    const rows = parseEspnNbaStandings(fixture());
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      conference: "Eastern Conference", position: 2, won: 7, lost: 3,
      played: 10, drawn: 0, winPercentage: 0.7, gamesBehind: 0.5,
      season: "2026-27", source: { name: "ESPN" },
    });
    expect(rows[1]?.position).toBe(1);
    expect(rows[3]?.team.slug).toBe("trail-blazers");
  });

  it("rejects partial or inconsistent conference responses", () => {
    const data = fixture();
    data.children[1]!.standings.seasonDisplayName = "2025-26";
    expect(() => parseEspnNbaStandings(data)).toThrow("same season");
    expect(() => parseEspnNbaStandings({ children: [fixture().children[0]] })).toThrow();
  });

  it("rejects missing stats and duplicated ranks rather than inventing values", () => {
    const missing = fixture();
    missing.children[0]!.standings.entries[0]!.stats = [];
    expect(() => parseEspnNbaStandings(missing)).toThrow("missing wins");
    const duplicate = fixture();
    duplicate.children[0]!.standings.entries[0]!.stats.find((stat) => stat.name === "playoffSeed")!.value = 1;
    expect(() => parseEspnNbaStandings(duplicate)).toThrow("invalid or duplicate");
  });

  it("fetches without a key and uses a one-hour cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(fixture()));
    vi.stubGlobal("fetch", fetchMock);
    expect(await getEspnNbaStandings()).toHaveLength(4);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings",
      expect.objectContaining({ next: { revalidate: 3600 }, signal: expect.any(AbortSignal) }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("headers");
  });
});
