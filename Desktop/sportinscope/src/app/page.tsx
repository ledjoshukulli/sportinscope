import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedArticle, getLatestArticles, getTrendingArticles } from "@/lib/content/articles";
import { getSportsProvider } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { LiveScoresBar } from "@/components/sports/live-scores-bar";
import { TrendingBar } from "@/components/navigation/trending-bar";
import { FeaturedArticle } from "@/components/articles/featured-article";
import { ArticleCard } from "@/components/articles/article-card";
import { MatchCard } from "@/components/sports/match-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsletterBlock } from "@/components/newsletter/newsletter-form";
import { ArticleAd } from "@/components/ads/article-ad";
import type { TrendingTopic } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Football & NBA News, Scores and Analysis",
  description:
    "Breaking football and NBA news, live scores, standings, transfers, and in-depth analysis — all in one place.",
  path: "/",
});

export default async function HomePage() {
  const [featured, latestFootball, latestNba, trending] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles({ sport: "FOOTBALL", limit: 4 }),
    getLatestArticles({ sport: "NBA", limit: 4 }),
    getTrendingArticles(8),
  ]);

  const [footballProvider, nbaProvider] = [getSportsProvider("FOOTBALL"), getSportsProvider("NBA")];
  const [liveFootball, liveNba, upcomingFootball, upcomingNba] = await Promise.all([
    footballProvider.getLiveMatches(),
    nbaProvider.getLiveMatches(),
    footballProvider.getUpcomingMatches(4),
    nbaProvider.getUpcomingMatches(4),
  ]);

  const liveMatches = [...liveFootball, ...liveNba];
  const scoreBarMatches = liveMatches.length > 0 ? liveMatches : [...upcomingFootball, ...upcomingNba].slice(0, 8);
  const matchCenter = [...upcomingFootball, ...upcomingNba]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 6);

  const trendingTopics: TrendingTopic[] = trending.slice(0, 8).map((article, i) => ({
    label: article.title,
    slug: article.slug,
    href: `/article/${article.slug}`,
    score: trending.length - i,
  }));

  return (
    <>
      <LiveScoresBar matches={scoreBarMatches} />
      <TrendingBar topics={trendingTopics} />

      <div className="container-page flex flex-col gap-14 py-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Football and NBA news, scores, transfers, and analysis
        </h1>
        {featured ? <FeaturedArticle article={featured} /> : null}

        <section aria-labelledby="latest-football-heading">
          <SectionHeading title="Latest Football" href="/football" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestFootball.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <ArticleAd />

        <section aria-labelledby="latest-nba-heading">
          <SectionHeading title="Latest NBA" href="/nba" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestNba.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <section aria-labelledby="trending-heading" className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeading title="Popular Right Now" href="/trending" />
            <div className="flex flex-col divide-y divide-border">
              {trending.slice(0, 6).map((article, i) => (
                <div key={article.id} className="flex items-center gap-4 py-4">
                  <span className="w-6 shrink-0 text-center font-display text-xl font-extrabold text-muted-foreground">
                    {i + 1}
                  </span>
                  <ArticleCard article={article} variant="horizontal" className="flex-1" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading title="Match Center" href="/scores" />
            <div className="flex flex-col gap-3">
              {matchCenter.length > 0 ? (
                matchCenter.map((match) => <MatchCard key={match.id} match={match} />)
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming matches scheduled right now.</p>
              )}
            </div>
            <Link
              href="/transfers"
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              See the latest transfer news →
            </Link>
          </div>
        </section>

        <NewsletterBlock />
      </div>
    </>
  );
}
