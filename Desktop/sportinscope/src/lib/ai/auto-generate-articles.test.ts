import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockPremierLeagueStandings } from "@/lib/mock-data/standings";

const mocks = vi.hoisted(() => ({
  author: vi.fn(), matches: vi.fn(), leagues: vi.fn(), category: vi.fn(),
  existing: vi.fn(), create: vi.fn(), tag: vi.fn(), standings: vi.fn(),
  matchArticle: vi.fn(), tableArticle: vi.fn(), headlines: vi.fn(), image: vi.fn(),
  transfers: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    author: { upsert: mocks.author },
    match: { findMany: mocks.matches },
    league: { findMany: mocks.leagues },
    category: { findUnique: mocks.category },
    article: { findUnique: mocks.existing, create: mocks.create },
    tag: { upsert: mocks.tag },
    transfer: { findMany: mocks.transfers },
  },
  withDbReconnectRetry: (operation: () => Promise<unknown>) => operation(),
}));
vi.mock("@/lib/api", () => ({ getSportsProvider: () => ({ getStandings: mocks.standings }) }));
vi.mock("@/lib/ai/article-generator", () => ({
  generateMatchOfTheRound: mocks.matchArticle,
  generateStandingsRecap: mocks.tableArticle,
  generateTransferArticle: vi.fn(),
  generateViralNewsArticle: vi.fn(),
}));
vi.mock("@/lib/ai/news-provider", () => ({ getViralSportsHeadlines: mocks.headlines }));
vi.mock("@/lib/ai/image-finder", () => ({ findArticleImage: mocks.image }));

import { autoGenerateArticles } from "./auto-generate-articles";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("AI_API_KEY", "test-key");
  vi.stubEnv("FOOTBALL_API_KEY", "test-key");
  mocks.author.mockResolvedValue({ id: "author" });
  mocks.existing.mockResolvedValue(null);
  mocks.category.mockResolvedValue({ id: "category" });
  mocks.tag.mockResolvedValue({ id: "tag" });
  mocks.image.mockResolvedValue(null);
  mocks.transfers.mockResolvedValue([]);
  mocks.headlines.mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe("automatic reporting pipeline", () => {
  it("rejects legacy demo matches without generating or publishing text", async () => {
    mocks.matches.mockResolvedValue([{
      id: "demo", externalId: "match-1", homeTeam: { name: "Home" }, awayTeam: { name: "Away" },
      league: { id: "league", name: "League", sport: "FOOTBALL" }, homeScore: 1, awayScore: 0,
    }]);
    const result = await autoGenerateArticles({ finishedMatchIds: ["demo"], leagueIds: [], mode: "matches" });
    expect(result.articlesGenerated).toBe(0);
    expect(result.errors[0]).toContain("live-provider record");
    expect(mocks.matchArticle).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("uses a sourced single-season table and skips an unchanged snapshot on a subsequent run", async () => {
    mocks.leagues.mockResolvedValue([{ id: "league", slug: "premier-league", name: "Premier League", sport: "FOOTBALL" }]);
    mocks.standings.mockResolvedValue(mockPremierLeagueStandings.map((row, index) => ({
      ...row, id: `fd-standing-premier-league-${index + 1}`,
    })));
    mocks.tableArticle.mockResolvedValue({
      title: "Table update", excerpt: "A table snapshot.", content: "City and Arsenal are level on points.",
      seoTitle: "Table update", metaDescription: "A table snapshot.", tags: [],
    });
    mocks.create.mockImplementation(async () => {
      mocks.existing.mockResolvedValue({ id: "published" });
      return { id: "published" };
    });
    const input = { finishedMatchIds: [], leagueIds: ["league"] };
    const result = await autoGenerateArticles(input);
    expect(result.articlesGenerated).toBe(1);
    expect(mocks.tableArticle).toHaveBeenCalledWith(expect.objectContaining({
      context: expect.stringContaining("Season: 2025-26"),
    }));
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: "PUBLISHED",
        content: expect.stringContaining("has not been reviewed by a human"),
      }),
    }));
    await autoGenerateArticles(input);
    expect(mocks.tableArticle).toHaveBeenCalledTimes(1);
  });
});
