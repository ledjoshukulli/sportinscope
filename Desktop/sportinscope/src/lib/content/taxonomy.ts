import type { Author, Category, Tag } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { mockAuthors, mockCategories, mockTags } from "@/lib/mock-data/taxonomy";

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

export async function createTag(input: { name: string; slug: string }) {
  if (isDatabaseConfigured()) return prisma.tag.create({ data: input });
  const tag: Tag = { id: `tag-${Date.now()}`, ...input };
  mockTags.push(tag);
  return tag;
}

export async function getAuthors(): Promise<Author[]> {
  if (isDatabaseConfigured()) return prisma.author.findMany({ orderBy: { name: "asc" } });
  return mockAuthors;
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (isDatabaseConfigured()) return prisma.author.findUnique({ where: { slug } });
  return mockAuthors.find((a) => a.slug === slug) ?? null;
}
