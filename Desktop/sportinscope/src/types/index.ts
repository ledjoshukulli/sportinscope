/**
 * Shared domain types used across the app, mock providers, and Prisma-backed
 * services. These mirror prisma/schema.prisma but stay decoupled from
 * @prisma/client so UI code and mock data never need a live database.
 */

export type Sport = "FOOTBALL" | "NBA" | "NFL" | "MLB" | "F1" | "TENNIS" | "NHL";

export const ACTIVE_SPORTS: Sport[] = ["FOOTBALL", "NBA"];
export const UPCOMING_SPORTS: Sport[] = ["NFL", "MLB", "F1", "TENNIS", "NHL"];

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
export type TransferStatus = "RUMOR" | "REPORTED" | "NEGOTIATING" | "MEDICAL" | "CONFIRMED";
export type NewsletterStatus = "PENDING" | "CONFIRMED" | "UNSUBSCRIBED";
export type UserRole = "ADMIN" | "EDITOR";

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
  twitter?: string | null;
  title?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sport?: Sport | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface League {
  id: string;
  name: string;
  slug: string;
  sport: Sport;
  country?: string | null;
  logoUrl?: string | null;
  tier?: number | null;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  shortName?: string | null;
  sport: Sport;
  leagueId?: string | null;
  league?: League | null;
  logoUrl?: string | null;
  city?: string | null;
  foundedYear?: number | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
}

export interface Player {
  id: string;
  name: string;
  slug: string;
  sport: Sport;
  teamId?: string | null;
  team?: Team | null;
  position?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  jerseyNumber?: number | null;
}

export interface Match {
  id: string;
  sport: Sport;
  leagueId: string;
  league?: League;
  homeTeamId: string;
  homeTeam: Team;
  awayTeamId: string;
  awayTeam: Team;
  homeScore?: number | null;
  awayScore?: number | null;
  status: MatchStatus;
  startTime: string; // ISO 8601
  venue?: string | null;
  clock?: string | null; // "72'" or "Q4 03:21"
}

export interface Standing {
  id: string;
  leagueId: string;
  teamId: string;
  team: Team;
  season: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Transfer {
  id: string;
  playerName: string;
  playerId?: string | null;
  fromTeam?: Team | null;
  toTeam?: Team | null;
  status: TransferStatus;
  feeAmount?: string | null;
  source: string;
  sourceUrl?: string | null;
  sport: Sport;
  reportedAt: string;
  confirmedAt?: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string | null;
  status: ArticleStatus;
  publishedAt?: string | null;
  updatedAt: string;
  createdAt: string;
  readingTimeMins: number;
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;

  author: Author;
  category: Category;
  sport: Sport;
  team?: Team | null;
  league?: League | null;
  player?: Player | null;
  tags: Tag[];

  views?: number;
}

/** Lightweight shape used for listing/cards where full content isn't needed. */
export type ArticleSummary = Omit<Article, "content">;

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CursorResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SearchResult {
  articles: ArticleSummary[];
  teams: Team[];
  players: Player[];
  leagues: League[];
}

export interface TrendingTopic {
  label: string;
  slug: string;
  href: string;
  score: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
