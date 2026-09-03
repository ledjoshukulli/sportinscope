import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeagueBySlug } from "@/lib/content/leagues";
import { getTeamsBySport } from "@/lib/content/teams";
import { getPublishedArticles } from "@/lib/content/articles";
import { getSportsProvider } from "@/lib/api";
import { buildMetadata, leagueJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { LeagueTable } from "@/components/sports/league-table";
import { TeamCard } from "@/components/sports/team-card";
import { MatchCard } from "@/components/sports/match-card";
import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SidebarAd } from "@/components/ads/sidebar-ad";

export const revalidate = 180;

interface LeaguePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) {
    return buildMetadata({ title: "League not found", description: "This league could not be found.", path: `/league/${slug}`, noIndex: true });
  }
  return buildMetadata({
    title: `${league.name} — Standings, Scores & News`,
    description: `Full standings, fixtures, results, and news coverage for the ${league.name}.`,
    path: `/league/${league.slug}`,
    image: league.logoUrl,
  });
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league) notFound();

  const provider = getSportsProvider(league.sport);
  const [allTeams, standings, matches, sportArticles] = await Promise.all([
    getTeamsBySport(league.sport),
    provider.getStandings(league.slug),
    provider.getMatchesForLeague(league.slug),
    getPublishedArticles({ sport: league.sport, limit: 20 }),
  ]);

  const teams = allTeams.filter((t) => t.league?.slug === league.slug || t.leagueId === league.id);
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 6);
  const recent = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 6);

  const leagueArticles = sportArticles.items.filter((a) => a.league?.slug === league.slug);
  const relatedArticles = (leagueArticles.length > 0 ? leagueArticles : sportArticles.items).slice(0, 6);

  const breadcrumbItems = [
    { label: league.sport === "FOOTBALL" ? "Football" : "NBA", href: league.sport === "FOOTBALL" ? "/football" : "/nba" },
    { label: league.name },
  ];

  return (
    <div className="container-page flex flex-col gap-10 py-8">
      <JsonLd data={leagueJsonLd(league)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems.map((i) => ({ name: i.label, href: i.href ?? `/league/${league.slug}` })))} />

      <Breadcrumbs items={breadcrumbItems} />

      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{league.name}</h1>
        {league.country ? <p className="mt-1 text-sm text-muted-foreground">{league.country}</p> : null}
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <section>
            <SectionHeading title="Standings" />
            <LeagueTable standings={standings} />
          </section>

          {upcoming.length > 0 ? (
            <section>
              <SectionHeading title="Upcoming Fixtures" href="/scores" />
              <div className="flex flex-col gap-3">
                {upcoming.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ) : null}

          {recent.length > 0 ? (
            <section>
              <SectionHeading title="Recent Results" href="/scores" />
              <div className="flex flex-col gap-3">
                {recent.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ) : null}

          {teams.length > 0 ? (
            <section>
              <SectionHeading title="Clubs" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </section>
          ) : null}

          {relatedArticles.length > 0 ? (
            <section>
              <SectionHeading title={`Latest ${league.name} News`} />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <SidebarAd />
        </aside>
      </div>
    </div>
  );
}
