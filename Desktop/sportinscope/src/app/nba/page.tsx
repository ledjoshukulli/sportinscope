import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/content/articles";
import { getSportsProvider } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/article-card";
import { FeaturedArticle } from "@/components/articles/featured-article";
import { MatchCard } from "@/components/sports/match-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { SidebarAd } from "@/components/ads/sidebar-ad";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "NBA News, Scores & Analysis",
  description: "The latest NBA news, live scores, standings, and in-depth analysis from around the league.",
  path: "/nba",
});

export default async function NbaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const [{ items: articles, hasNextPage }, upcoming] = await Promise.all([
    getPublishedArticles({ sport: "NBA", page: currentPage, limit: 9 }),
    getSportsProvider("NBA").getUpcomingMatches(4),
  ]);

  const [hero, ...rest] = articles;

  return (
    <div className="container-page flex flex-col gap-10 py-8">
      <Breadcrumbs items={[{ label: "NBA" }]} />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          {hero ? <FeaturedArticle article={hero} /> : null}

          <section>
            <SectionHeading title="Latest NBA Stories" />
            {rest.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No more stories yet — check back soon.</p>
            )}

            {(currentPage > 1 || hasNextPage) && (
              <div className="mt-8 flex items-center justify-between">
                <PageLink page={currentPage - 1} disabled={currentPage <= 1} label="Previous" />
                <PageLink page={currentPage + 1} disabled={!hasNextPage} label="Next" />
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-8">
          <SidebarAd />
          <div>
            <SectionHeading title="Upcoming Games" href="/scores" />
            <div className="flex flex-col gap-3">
              {upcoming.length > 0 ? (
                upcoming.map((match) => <MatchCard key={match.id} match={match} />)
              ) : (
                <p className="text-sm text-muted-foreground">No games scheduled right now.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PageLink({ page, disabled, label }: { page: number; disabled: boolean; label: string }) {
  if (disabled) {
    return <span className="text-sm font-semibold text-muted-foreground/50">{label}</span>;
  }
  return (
    <a href={`/nba?page=${page}`} className="text-sm font-semibold text-primary hover:underline">
      {label}
    </a>
  );
}
