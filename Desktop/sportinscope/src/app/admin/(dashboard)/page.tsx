import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Eye, PenSquare, Archive, Plus } from "lucide-react";
import { getAdminDashboardStats } from "@/lib/content/articles";
import { buildMetadata } from "@/lib/seo";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "SportInScope CMS dashboard.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Published", value: stats.published, icon: FileText, color: "text-success" },
    { label: "Drafts", value: stats.drafts, icon: PenSquare, color: "text-warning" },
    { label: "Archived", value: stats.archived, icon: Archive, color: "text-muted-foreground" },
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-primary" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New Article
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-md border border-border bg-background p-5">
              <Icon className={`h-5 w-5 ${card.color}`} aria-hidden />
              <p className="mt-3 text-2xl font-extrabold tabular-nums">{card.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold tracking-tight">Most Viewed Articles</h2>
        {stats.popularArticles.length > 0 ? (
          <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-background">
            {stats.popularArticles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.id}/edit`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{article.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatRelativeTime(article.updatedAt)} · {article.category.name}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                  {(article.views ?? 0).toLocaleString()} views
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        )}
      </section>
    </div>
  );
}
