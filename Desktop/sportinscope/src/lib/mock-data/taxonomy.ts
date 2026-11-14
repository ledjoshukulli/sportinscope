import type { Author, Category, Tag } from "@/types";

export const mockCategories: Category[] = [
  { id: "cat-football-news", name: "Football News", slug: "football-news", sport: "FOOTBALL" },
  { id: "cat-transfers", name: "Transfers", slug: "transfers", sport: "FOOTBALL" },
  { id: "cat-champions-league", name: "Champions League", slug: "champions-league-news", sport: "FOOTBALL" },
  { id: "cat-nba-news", name: "NBA News", slug: "nba-news", sport: "NBA" },
  { id: "cat-trade-rumors", name: "Trade Rumors", slug: "trade-rumors", sport: "NBA" },
  { id: "cat-analysis", name: "Analysis", slug: "analysis", sport: null },
];

export const mockTags: Tag[] = [
  { id: "tag-arsenal", name: "Arsenal", slug: "arsenal" },
  { id: "tag-chelsea", name: "Chelsea", slug: "chelsea" },
  { id: "tag-premier-league", name: "Premier League", slug: "premier-league" },
  { id: "tag-champions-league", name: "Champions League", slug: "champions-league" },
  { id: "tag-la-liga", name: "La Liga", slug: "la-liga" },
  { id: "tag-real-madrid", name: "Real Madrid", slug: "real-madrid" },
  { id: "tag-lakers", name: "Lakers", slug: "lakers" },
  { id: "tag-celtics", name: "Celtics", slug: "celtics" },
  { id: "tag-nba-trades", name: "NBA Trades", slug: "nba-trades" },
  { id: "tag-injury-report", name: "Injury Report", slug: "injury-report" },
  { id: "tag-transfer-news", name: "Transfer News", slug: "transfer-news" },
  { id: "tag-tactics", name: "Tactics", slug: "tactics" },
];

export const sportInScopeAuthor: Author = {
  id: "author-sportinscope",
  name: "SportInScope",
  slug: "sportinscope",
  bio: "Reporting and analysis from SportInScope.",
  title: "Publisher",
};

export const mockAuthors: Author[] = [sportInScopeAuthor];

export function getMockCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find((c) => c.slug === slug);
}

export function getMockAuthorBySlug(slug: string): Author | undefined {
  return slug === sportInScopeAuthor.slug ? sportInScopeAuthor : undefined;
}
