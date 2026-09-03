import type { Article, ArticleSummary, PaginatedResult, Sport } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockArticles } from "@/lib/mock-data/articles";
import { estimateReadingTime, slugify } from "@/lib/utils";
import type { ArticleInput } from "@/lib/validations";
import { mockAuthors, mockCategories, mockTags } from "@/lib/mock-data/taxonomy";
import { mockTeams } from "@/lib/mock-data/teams";
import { mockLeagues } from "@/lib/mock-data/leagues";
import { mockPlayers } from "@/lib/mock-data/players";

/**
 * In-memory fallback store used only when no database is configured, so the
 * admin CMS (create/edit/publish/delete) is still fully interactive in local
 * demos. It resets whenever the server restarts — this is a convenience for
 * running the UI without Postgres, not a persistence layer. Once
 * DATABASE_URL is set, every function below automatically switches to
 * Prisma and this store is never touched.
 */
let memoryArticles: Article[] = [...mockArticles];

function toSummary(article: Article): ArticleSummary {
  const { content: _content, ...summary } = article;
  return summary;
}

interface ListOptions {
  page?: number;
  limit?: number;
  sport?: Sport;
  categorySlug?: string;
  teamSlug?: string;
  authorSlug?: string;
  tagSlug?: string;
  includeDrafts?: boolean;
  status?: Article["status"];
}

function matchesFilters(a: Article, opts: ListOptions): boolean {
  if (opts.sport && a.sport !== opts.sport) return false;
  if (opts.categorySlug && a.category.slug !== opts.categorySlug) return false;
  if (opts.teamSlug && a.team?.slug !== opts.teamSlug) return false;
  if (opts.authorSlug && a.author.slug !== opts.authorSlug) return false;
  if (opts.tagSlug && !a.tags.some((t) => t.slug === opts.tagSlug)) return false;
  if (opts.status) return a.status === opts.status;
  if (!opts.includeDrafts) return a.status === "PUBLISHED";
  return true;
}

/** Paginated, published-only article listing — the workhorse behind most public pages. */
export async function getPublishedArticles(opts: ListOptions = {}): Promise<PaginatedResult<ArticleSummary>> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 12;

  if (isDatabaseConfigured()) {
    const where = {
      status: "PUBLISHED" as const,
      ...(opts.sport ? { sport: opts.sport } : {}),
      ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts.teamSlug ? { team: { slug: opts.teamSlug } } : {}),
      ...(opts.authorSlug ? { author: { slug: opts.authorSlug } } : {}),
      ...(opts.tagSlug ? { tags: { some: { tag: { slug: opts.tagSlug } } } } : {}),
    };
    const [total, rows] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: articleInclude,
      }),
    ]);
    return paginate(rows.map(fromPrisma), total, page, limit);
  }

  const filtered = memoryArticles
    .filter((a) => matchesFilters(a, { ...opts, includeDrafts: false }))
    .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, (page - 1) * limit + limit).map(toSummary);
  return paginate(items, total, page, limit);
}

function paginate<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { items, total, page, limit, totalPages, hasNextPage: page < totalPages };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isDatabaseConfigured()) {
    const row = await prisma.article.findUnique({ where: { slug }, include: articleInclude });
    return row ? fromPrisma(row) : null;
  }
  return memoryArticles.find((a) => a.slug === slug) ?? null;
}

/**
 * Full-record lookup by id, including `content` — used by the admin editor
 * (GET /api/admin/articles/[id]) which needs the article body to prefill
 * the form. Deliberately separate from `getAdminArticles`, which returns
 * `ArticleSummary` (content stripped) for the lightweight CMS table view.
 */
export async function getArticleById(id: string): Promise<Article | null> {
  if (isDatabaseConfigured()) {
    const row = await prisma.article.findUnique({ where: { id }, include: articleInclude });
    return row ? fromPrisma(row) : null;
  }
  return memoryArticles.find((a) => a.id === id) ?? null;
}

export async function getFeaturedArticle(sport?: Sport): Promise<ArticleSummary | null> {
  const { items } = await getPublishedArticles({ sport, limit: 1, page: 1 });
  return items[0] ?? null;
}

export async function getLatestArticles(opts: ListOptions = {}): Promise<ArticleSummary[]> {
  const { items } = await getPublishedArticles({ ...opts, limit: opts.limit ?? 6, page: 1 });
  return items;
}

/** Related content by shared team, league, category, or tags — used for internal linking. */
export async function getRelatedArticles(article: Article | ArticleSummary, limit = 4): Promise<ArticleSummary[]> {
  const { items } = await getPublishedArticles({ sport: article.sport, limit: 20 });
  return items
    .filter((a) => a.id !== article.id)
    .map((a) => ({
      article: a,
      score:
        (a.team && a.team.id === article.team?.id ? 3 : 0) +
        (a.league && a.league.id === article.league?.id ? 2 : 0) +
        (a.category.id === article.category.id ? 2 : 0) +
        a.tags.filter((t) => article.tags.some((at) => at.id === t.id)).length,
    }))
    .sort((a, b) => b.score - a.score || new Date(b.article.publishedAt ?? 0).getTime() - new Date(a.article.publishedAt ?? 0).getTime())
    .slice(0, limit)
    .map((x) => x.article);
}

/** Trending = recent views weighted toward recency ("view velocity"), not a hardcoded list. */
export async function getTrendingArticles(limit = 6): Promise<ArticleSummary[]> {
  const { items } = await getPublishedArticles({ limit: 50 });
  const now = Date.now();
  return items
    .map((a) => {
      const ageHours = Math.max(1, (now - new Date(a.publishedAt ?? now).getTime()) / 3_600_000);
      const velocity = (a.views ?? 0) / ageHours;
      return { article: a, velocity };
    })
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, limit)
    .map((x) => x.article);
}

export async function searchArticles(query: string, limit = 10): Promise<ArticleSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (isDatabaseConfigured()) {
    const rows = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }],
      },
      take: limit,
      include: articleInclude,
      orderBy: { publishedAt: "desc" },
    });
    return rows.map(fromPrisma).map(toSummary);
  }
  return memoryArticles
    .filter((a) => a.status === "PUBLISHED")
    .filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q))
    .slice(0, limit)
    .map(toSummary);
}

// ---------------------------------------------------------------------------
// Admin CMS operations
// ---------------------------------------------------------------------------

export async function getAdminArticles(opts: ListOptions = {}): Promise<PaginatedResult<ArticleSummary>> {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;

  if (isDatabaseConfigured()) {
    const where = opts.status ? { status: opts.status } : {};
    const [total, rows] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: articleInclude,
      }),
    ]);
    return paginate(rows.map(fromPrisma).map(toSummary), total, page, limit);
  }

  const filtered = memoryArticles
    .filter((a) => matchesFilters(a, { ...opts, includeDrafts: true }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const items = filtered.slice((page - 1) * limit, (page - 1) * limit + limit).map(toSummary);
  return paginate(items, filtered.length, page, limit);
}

export async function getAdminDashboardStats() {
  const all = isDatabaseConfigured() ? await prisma.article.findMany({ include: articleInclude }) : memoryArticles;
  const articles = isDatabaseConfigured() ? (all as PrismaArticleRow[]).map(fromPrisma) : (all as Article[]);
  const published = articles.filter((a) => a.status === "PUBLISHED");
  const drafts = articles.filter((a) => a.status === "DRAFT");
  const totalViews = articles.reduce((sum, a) => sum + (a.views ?? 0), 0);
  const popular = [...articles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  return {
    totalArticles: articles.length,
    published: published.length,
    drafts: drafts.length,
    archived: articles.filter((a) => a.status === "ARCHIVED").length,
    totalViews,
    popularArticles: popular.map(toSummary),
  };
}

function resolveRelations(input: ArticleInput) {
  const author = mockAuthors.find((a) => a.id === input.authorId);
  const category = mockCategories.find((c) => c.id === input.categoryId);
  if (!author) throw new Error("Unknown author");
  if (!category) throw new Error("Unknown category");
  const team = input.teamId ? mockTeams.find((t) => t.id === input.teamId) ?? null : null;
  const league = input.leagueId ? mockLeagues.find((l) => l.id === input.leagueId) ?? null : null;
  const player = input.playerId ? mockPlayers.find((p) => p.id === input.playerId) ?? null : null;
  const tags = mockTags.filter((t) => input.tagIds.includes(t.id));
  return { author, category, team, league, player, tags };
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  if (isDatabaseConfigured()) {
    const row = await prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug || slugify(input.title),
        excerpt: input.excerpt,
        content: input.content,
        featuredImage: input.featuredImage || null,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? input.publishedAt ?? new Date().toISOString() : null,
        readingTimeMins: estimateReadingTime(input.content),
        seoTitle: input.seoTitle || null,
        metaDescription: input.metaDescription || null,
        canonicalUrl: input.canonicalUrl || null,
        authorId: input.authorId,
        categoryId: input.categoryId,
        sport: input.sport,
        teamId: input.teamId || null,
        leagueId: input.leagueId || null,
        playerId: input.playerId || null,
        tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
      },
      include: articleInclude,
    });
    return fromPrisma(row);
  }

  const { author, category, team, league, player, tags } = resolveRelations(input);
  const now = new Date().toISOString();
  const article: Article = {
    id: `article-${Date.now()}`,
    title: input.title,
    slug: input.slug || slugify(input.title),
    excerpt: input.excerpt,
    content: input.content,
    featuredImage: input.featuredImage || null,
    status: input.status,
    publishedAt: input.status === "PUBLISHED" ? input.publishedAt ?? now : null,
    updatedAt: now,
    createdAt: now,
    readingTimeMins: estimateReadingTime(input.content),
    seoTitle: input.seoTitle || null,
    metaDescription: input.metaDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    author,
    category,
    sport: input.sport,
    team,
    league,
    player,
    tags,
    views: 0,
  };
  memoryArticles = [article, ...memoryArticles];
  return article;
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article | null> {
  if (isDatabaseConfigured()) {
    const row = await prisma.article.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        featuredImage: input.featuredImage || null,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? input.publishedAt ?? new Date().toISOString() : null,
        readingTimeMins: estimateReadingTime(input.content),
        seoTitle: input.seoTitle || null,
        metaDescription: input.metaDescription || null,
        canonicalUrl: input.canonicalUrl || null,
        authorId: input.authorId,
        categoryId: input.categoryId,
        sport: input.sport,
        teamId: input.teamId || null,
        leagueId: input.leagueId || null,
        playerId: input.playerId || null,
        tags: { deleteMany: {}, create: input.tagIds.map((tagId) => ({ tagId })) },
      },
      include: articleInclude,
    });
    return fromPrisma(row);
  }

  const idx = memoryArticles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const { author, category, team, league, player, tags } = resolveRelations(input);
  const existing = memoryArticles[idx]!;
  const updated: Article = {
    ...existing,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    featuredImage: input.featuredImage || null,
    status: input.status,
    publishedAt: input.status === "PUBLISHED" ? existing.publishedAt ?? new Date().toISOString() : existing.publishedAt,
    updatedAt: new Date().toISOString(),
    readingTimeMins: estimateReadingTime(input.content),
    seoTitle: input.seoTitle || null,
    metaDescription: input.metaDescription || null,
    canonicalUrl: input.canonicalUrl || null,
    author,
    category,
    sport: input.sport,
    team,
    league,
    player,
    tags,
  };
  memoryArticles = [...memoryArticles.slice(0, idx), updated, ...memoryArticles.slice(idx + 1)];
  return updated;
}

export async function setArticleStatus(id: string, status: Article["status"]): Promise<void> {
  if (isDatabaseConfigured()) {
    await prisma.article.update({
      where: { id },
      data: { status, publishedAt: status === "PUBLISHED" ? new Date().toISOString() : undefined },
    });
    return;
  }
  memoryArticles = memoryArticles.map((a) =>
    a.id === id
      ? { ...a, status, publishedAt: status === "PUBLISHED" ? a.publishedAt ?? new Date().toISOString() : a.publishedAt }
      : a,
  );
}

export async function deleteArticle(id: string): Promise<void> {
  if (isDatabaseConfigured()) {
    await prisma.article.delete({ where: { id } });
    return;
  }
  memoryArticles = memoryArticles.filter((a) => a.id !== id);
}

export async function recordArticleView(articleId: string, meta: { referrer?: string; sessionHash?: string }) {
  if (isDatabaseConfigured()) {
    await prisma.articleView.create({
      data: { articleId, referrer: meta.referrer, sessionHash: meta.sessionHash },
    });
    return;
  }
  memoryArticles = memoryArticles.map((a) => (a.id === articleId ? { ...a, views: (a.views ?? 0) + 1 } : a));
}

// ---------------------------------------------------------------------------
// Prisma row -> domain mapping
// ---------------------------------------------------------------------------

const articleInclude = {
  author: true,
  category: true,
  team: true,
  league: true,
  player: true,
  tags: { include: { tag: true } },
  _count: { select: { views: true } },
} as const;

type PrismaArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: Article["status"];
  publishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  readingTimeMins: number;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  sport: Sport;
  author: Article["author"];
  category: Article["category"];
  team: Article["team"] | null;
  league: Article["league"] | null;
  player: Article["player"] | null;
  tags: { tag: Article["tags"][number] }[];
  _count?: { views: number };
};

function fromPrisma(row: PrismaArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    featuredImage: row.featuredImage,
    status: row.status,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    readingTimeMins: row.readingTimeMins,
    seoTitle: row.seoTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    author: row.author,
    category: row.category,
    sport: row.sport,
    team: row.team,
    league: row.league,
    player: row.player,
    tags: row.tags.map((t) => t.tag),
    views: row._count?.views ?? 0,
  };
}
