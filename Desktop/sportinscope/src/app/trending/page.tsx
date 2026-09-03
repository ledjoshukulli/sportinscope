import type { Metadata } from "next";
import { getTrendingArticles } from "@/lib/content/articles";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/article-card";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Trending Now",
  description: "The most-read football and NBA stories on SportInScope right now, ranked by reader view velocity.",
  path: "/trending",
});

export default async function TrendingPage() {
  const articles = await getTrendingArticles(20);

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Trending" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Trending Now</h1>
      <p className="max-w-2xl text-muted-foreground">Ranked by how fast readers are engaging with each story right now.</p>

      {articles.length > 0 ? (
        <div className="flex flex-col divide-y divide-border">
          {articles.map((article, i) => (
            <div key={article.id} className="flex items-center gap-4 py-4">
              <span className="w-8 shrink-0 text-center font-display text-2xl font-extrabold text-muted-foreground">
                {i + 1}
              </span>
              <ArticleCard article={article} variant="horizontal" className="flex-1" />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing is trending yet — check back once readers start engaging with stories.
        </p>
      )}
    </div>
  );
}
