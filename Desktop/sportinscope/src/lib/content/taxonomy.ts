import type { Author, Category, Tag } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockAuthors, mockCategories, mockTags, sportInScopeAuthor } from "@/lib/mock-data/taxonomy";

export async function getCategories(): Promise<Category[]> {
  if (isDatabaseConfigured()) return prisma.category.findMany({ orderBy: { name: "asc" } });
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (isDatabaseConfigured()) return prisma.category.findUnique({ where: { slug } });
  return mockCategories.find((c) => c.slug === slug) ?? null;
}

export async function createCategory(input: { name: string; slug: string; sport?: Category["sport"] }) {
  if (isDatabaseConfigured()) return prisma.category.create({ data: input });
  const category: Category = { id: `cat-${Date.now()}`, description: null, ...input };
  mockCategories.push(category);
  return category;
}

export async function getTags(): Promise<Tag[]> {
  if (isDatabaseConfigured()) return prisma.tag.findMany({ orderBy: { name: "asc" } });
  return mockTags;
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  if (isDatabaseConfigured()) return prisma.tag.findUnique({ where: { slug } });
  return mockTags.find((t) => t.slug === slug) ?? null;
}

export async function createTag(input: { name: string; slug: string }) {
  if (isDatabaseConfigured()) return prisma.tag.create({ data: input });
  const tag: Tag = { id: `tag-${Date.now()}`, ...input };
  mockTags.push(tag);
  return tag;
}

export async function getAuthors(): Promise<Author[]> {
  if (isDatabaseConfigured()) return [await getSportInScopeAuthor()];
  return mockAuthors;
}

export async function getSportInScopeAuthor(): Promise<Author> {
  if (!isDatabaseConfigured()) return sportInScopeAuthor;

  return prisma.author.upsert({
    where: { slug: sportInScopeAuthor.slug },
    update: {
      name: sportInScopeAuthor.name,
      bio: sportInScopeAuthor.bio,
      title: sportInScopeAuthor.title,
      avatarUrl: null,
      twitter: null,
    },
    create: {
      id: sportInScopeAuthor.id,
      name: sportInScopeAuthor.name,
      slug: sportInScopeAuthor.slug,
      bio: sportInScopeAuthor.bio,
      title: sportInScopeAuthor.title,
    },
  });
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (slug !== sportInScopeAuthor.slug) return null;
  return getSportInScopeAuthor();
}
