import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/content/articles";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/article-card";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "In-Depth Analysis",
  description: "Long-form tactical breakdowns, statistical deep-dives, and expert analysis across football and the NBA.",
  path: "/analysis",
});

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { items: articles, hasNextPage } = await getPublishedArticles({
    categorySlug: "analysis",
    page: currentPage,
    limit: 12,
  });

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Analysis" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Analysis</h1>
      <p className="max-w-2xl text-muted-foreground">
        Tactical breakdowns, statistical deep-dives, and expert takes — beyond the headline.
      </p>

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">No analysis pieces published yet.</p>
      )}

      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-between">
          {currentPage > 1 ? (
            <a href={`/analysis?page=${currentPage - 1}`} className="text-sm font-semibold text-primary hover:underline">
              Previous
            </a>
          ) : (
            <span />
          )}
          {hasNextPage ? (
            <a href={`/analysis?page=${currentPage + 1}`} className="text-sm font-semibold text-primary hover:underline">
              Next
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
