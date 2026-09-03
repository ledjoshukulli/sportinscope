"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import type { ArticleSummary, ArticleStatus } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_VARIANT: Record<ArticleStatus, BadgeVariant> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "outline",
};

export function ArticlesTable({ articles }: { articles: ArticleSummary[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete article.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error while deleting.");
    } finally {
      setPendingId(null);
    }
  }

  if (articles.length === 0) {
    return <p className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">No articles match this filter.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5">Title</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Sport</th>
              <th className="px-3 py-2.5">Updated</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="max-w-xs px-4 py-3">
                  <p className="truncate font-semibold">{article.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{article.category.name}</p>
                </td>
                <td className="px-3 py-3">
                  <Badge variant={STATUS_VARIANT[article.status]}>{article.status}</Badge>
                </td>
                <td className="px-3 py-3 text-xs font-semibold text-muted-foreground">{article.sport}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{formatRelativeTime(article.updatedAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {article.status === "PUBLISHED" ? (
                      <Link
                        href={`/article/${article.slug}`}
                        target="_blank"
                        aria-label="View published article"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    ) : null}
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      aria-label="Edit article"
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      aria-label="Delete article"
                      disabled={pendingId === article.id}
                      onClick={() => handleDelete(article.id, article.title)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
