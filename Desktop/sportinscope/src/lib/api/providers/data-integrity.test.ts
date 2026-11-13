import { afterEach, describe, expect, it, vi } from "vitest";
import { FootballDataProvider } from "./football-data-provider";
import { NBADataProvider } from "./nba-data-provider";
import { MockSportsProvider } from "./mock-provider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("production sports data integrity", () => {
  it("prevents demo scores in production while retaining local demo mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => new MockSportsProvider("FOOTBALL")).toThrow("disabled in production");
    vi.stubEnv("NODE_ENV", "development");
    expect(await new MockSportsProvider("FOOTBALL").getRecentMatches()).not.toHaveLength(0);
  });

  it("does not turn failed live requests into invented results", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(new FootballDataProvider().getRecentMatches()).rejects.toThrow("disabled in production");
    await expect(new NBADataProvider().getRecentMatches()).rejects.toThrow("disabled in production");
    expect(warning).toHaveBeenCalled();
  });

  it("reports unavailable NBA standings instead of displaying a demo ranking", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await new NBADataProvider().getStandings("nba")).toEqual([]);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining("does not implement live standings"));
  });

  it("still allows a successful live provider to run in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ matches: [] })));
    expect(await new FootballDataProvider().getLiveMatches()).toEqual([]);
  });
});
