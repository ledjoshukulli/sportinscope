import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminArticles } from "@/lib/content/articles";
import { buildMetadata } from "@/lib/seo";
import { ArticlesTable } from "@/components/admin/articles-table";
import { cn } from "@/lib/utils";
import type { ArticleStatus } from "@/types";

export const metadata: Metadata = buildMetadata({
  title: "Manage Articles",
  description: "SportInScope CMS article management.",
  path: "/admin/articles",
  noIndex: true,
});

const FILTERS: { label: string; value: ArticleStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Drafts", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

interface AdminArticlesPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const { status, page } = await searchParams;
  const activeStatus = FILTERS.some((f) => f.value === status) ? (status as ArticleStatus) : undefined;
  const currentPage = Number(page) || 1;

  const { items: articles, hasNextPage } = await getAdminArticles({
    status: activeStatus,
    page: currentPage,
    limit: 20,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Article
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((filter) => {
          const isActive = filter.value === "ALL" ? !activeStatus : activeStatus === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.value === "ALL" ? "/admin/articles" : `/admin/articles?status=${filter.value}`}
              className={cn(
                "shrink-0 rounded-md border px-3 py-1.5 text-sm font-semibold",
                isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <ArticlesTable articles={articles} />

      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-between">
          {currentPage > 1 ? (
            <Link
              href={`/admin/articles?${activeStatus ? `status=${activeStatus}&` : ""}page=${currentPage - 1}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {hasNextPage ? (
            <Link
              href={`/admin/articles?${activeStatus ? `status=${activeStatus}&` : ""}page=${currentPage + 1}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Next
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
