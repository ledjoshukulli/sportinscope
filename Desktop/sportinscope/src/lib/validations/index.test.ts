import { describe, expect, it } from "vitest";
import {
  articleInputSchema,
  loginSchema,
  newsletterSubscribeSchema,
  paginationSchema,
  searchQuerySchema,
  transferInputSchema,
} from "./index";

const validArticle = {
  title: "Arsenal Make Major Move",
  slug: "arsenal-make-major-move",
  excerpt: "A short excerpt describing the story.",
  content: "This is a sufficiently long article body used purely for validation testing purposes.",
  status: "PUBLISHED" as const,
  authorId: "author-1",
  categoryId: "cat-1",
  sport: "FOOTBALL" as const,
  tagIds: [],
};

describe("articleInputSchema", () => {
  it("accepts a well-formed article", () => {
    const result = articleInputSchema.safeParse(validArticle);
    expect(result.success).toBe(true);
  });

  it("rejects a title that is too short", () => {
    const result = articleInputSchema.safeParse({ ...validArticle, title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase or spaces", () => {
    const result = articleInputSchema.safeParse({ ...validArticle, slug: "Not A Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects content under the minimum length", () => {
    const result = articleInputSchema.safeParse({ ...validArticle, content: "too short" });
    expect(result.success).toBe(false);
  });

  it("defaults status to DRAFT when omitted", () => {
    const { status, ...rest } = validArticle;
    const result = articleInputSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("DRAFT");
  });

  it("rejects an invalid sport", () => {
    const result = articleInputSchema.safeParse({ ...validArticle, sport: "CRICKET" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    expect(loginSchema.safeParse({ email: "admin@sportinscope.com", password: "longenough" }).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "longenough" }).success).toBe(false);
  });

  it("rejects a too-short password", () => {
    expect(loginSchema.safeParse({ email: "admin@sportinscope.com", password: "short" }).success).toBe(false);
  });
});

describe("newsletterSubscribeSchema", () => {
  it("accepts a valid email", () => {
    expect(newsletterSubscribeSchema.safeParse({ email: "reader@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(newsletterSubscribeSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("transferInputSchema", () => {
  const validTransfer = {
    playerName: "Victor Osimhen",
    status: "RUMOR" as const,
    source: "Fabrizio Romano",
  };

  it("accepts a minimal valid transfer and defaults sport to FOOTBALL", () => {
    const result = transferInputSchema.safeParse(validTransfer);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sport).toBe("FOOTBALL");
  });

  it("rejects a player name that is too short", () => {
    expect(transferInputSchema.safeParse({ ...validTransfer, playerName: "A" }).success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = transferInputSchema.safeParse({ ...validTransfer, status: "UNKNOWN" });
    expect(result.success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("rejects an empty query", () => {
    expect(searchQuerySchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("accepts a non-empty query", () => {
    expect(searchQuerySchema.safeParse({ q: "arsenal" }).success).toBe(true);
  });
});

describe("paginationSchema", () => {
  it("applies defaults when omitted", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it("coerces numeric strings from query params", () => {
    const result = paginationSchema.safeParse({ page: "3", limit: "20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects a limit above the maximum", () => {
    expect(paginationSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});
