import { z } from "zod";

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const sportSchema = z.enum(["FOOTBALL", "NBA", "NFL", "MLB", "F1", "TENNIS", "NHL"]);

/**
 * Server-side source of truth for article create/update. The admin editor
 * uses react-hook-form + this same schema on the client for instant
 * feedback, but every API route re-validates with this schema — client
 * validation alone is never trusted.
 */
export const articleInputSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(180),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(320),
  content: z.string().min(50, "Content must be at least 50 characters"),
  featuredImage: z.string().url().optional().or(z.literal("")),
  status: articleStatusSchema.default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
  authorId: z.string().min(1, "Author is required"),
  categoryId: z.string().min(1, "Category is required"),
  sport: sportSchema,
  teamId: z.string().optional().nullable(),
  leagueId: z.string().optional().nullable(),
  playerId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  seoTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const transferInputSchema = z.object({
  playerName: z.string().min(2).max(120),
  playerId: z.string().optional().nullable(),
  fromTeamId: z.string().optional().nullable(),
  toTeamId: z.string().optional().nullable(),
  status: z.enum(["RUMOR", "REPORTED", "NEGOTIATING", "MEDICAL", "CONFIRMED"]),
  feeAmount: z.string().max(60).optional().nullable(),
  source: z.string().min(2).max(120),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sport: sportSchema.default("FOOTBALL"),
});

export type TransferInput = z.infer<typeof transferInputSchema>;

export const myTeamsSchema = z.object({
  teamSlugs: z.array(z.string()).max(20),
});
