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

export const mockAuthors: Author[] = [
  {
    id: "author-james-whitfield",
    name: "James Whitfield",
    slug: "james-whitfield",
    bio: "James covers the Premier League and European football for SportInScope, with a focus on tactics and transfers.",
    title: "Senior Football Writer",
    avatarUrl: "/authors/james-whitfield.jpg",
    twitter: "https://twitter.com/jwhitfieldsis",
  },
  {
    id: "author-maria-santos",
    name: "Maria Santos",
    slug: "maria-santos",
    bio: "Maria reports on La Liga and the Champions League, and has covered European football for over a decade.",
    title: "European Football Correspondent",
    avatarUrl: "/authors/maria-santos.jpg",
    twitter: "https://twitter.com/mariasantossis",
  },
  {
    id: "author-marcus-lee",
    name: "Marcus Lee",
    slug: "marcus-lee",
    bio: "Marcus leads SportInScope's NBA coverage, breaking trade news and analyzing the league night after night.",
    title: "Senior NBA Writer",
    avatarUrl: "/authors/marcus-lee.jpg",
    twitter: "https://twitter.com/marcusleesis",
  },
  {
    id: "author-aisha-brown",
    name: "Aisha Brown",
    slug: "aisha-brown",
    bio: "Aisha covers NBA trade rumors and roster construction across the league.",
    title: "NBA Insider",
    avatarUrl: "/authors/aisha-brown.jpg",
    twitter: "https://twitter.com/aishabrownsis",
  },
  {
    id: "author-editorial-team",
    name: "SportInScope Staff",
    slug: "sportinscope-staff",
    bio: "Reporting and analysis from the SportInScope editorial desk.",
    title: "Editorial Team",
    avatarUrl: "/authors/staff.jpg",
  },
];

export function getMockCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find((c) => c.slug === slug);
}

export function getMockAuthorBySlug(slug: string): Author | undefined {
  return mockAuthors.find((a) => a.slug === slug);
}
