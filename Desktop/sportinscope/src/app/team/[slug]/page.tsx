import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamBySlug } from "@/lib/content/teams";
import { getPlayersByTeamId } from "@/lib/content/players";
import { getPublishedArticles } from "@/lib/content/articles";
import { getSportsProvider } from "@/lib/api";
import { buildMetadata, teamJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { TeamLogo } from "@/components/sports/team-logo";
import { LeagueTable } from "@/components/sports/league-table";
import { MatchCard } from "@/components/sports/match-card";
import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import Link from "next/link";

export const revalidate = 120;

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) {
    return buildMetadata({ title: "Team not found", description: "This team could not be found.", path: `/team/${slug}`, noIndex: true });
  }
  return buildMetadata({
    title: `${team.name} — News, Scores & Standings`,
    description: `Latest news, fixtures, results, and standings for ${team.name}${team.league ? ` in the ${team.league.name}` : ""}.`,
    path: `/team/${team.slug}`,
    image: team.logoUrl,
  });
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) notFound();

  const provider = getSportsProvider(team.sport);
  const [players, articlesResult, leagueMatches, standings] = await Promise.all([
    getPlayersByTeamId(team.id),
    getPublishedArticles({ teamSlug: team.slug, limit: 6 }),
    team.league ? provider.getMatchesForLeague(team.league.slug) : Promise.resolve([]),
    team.league ? provider.getStandings(team.league.slug) : Promise.resolve([]),
  ]);

  const teamMatches = leagueMatches
    .filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const upcoming = teamMatches.filter((m) => m.status === "SCHEDULED").slice(0, 5);
  const recent = teamMatches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  const breadcrumbItems = [
    { label: team.sport === "FOOTBALL" ? "Football" : "NBA", href: team.sport === "FOOTBALL" ? "/football" : "/nba" },
    { label: team.name },
  ];

  return (
    <div className="container-page flex flex-col gap-10 py-8">
      <JsonLd data={teamJsonLd(team)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems.map((i) => ({ name: i.label, href: i.href ?? `/team/${team.slug}` })))} />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="flex flex-wrap items-center gap-5">
        <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={72} />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{team.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {team.league ? (
              <Link href={`/league/${team.league.slug}`} className="font-semibold hover:text-primary">
                {team.league.name}
              </Link>
            ) : null}
            {team.city ? ` · ${team.city}` : null}
            {team.foundedYear ? ` · Founded ${team.foundedYear}` : null}
          </p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          {team.league && standings.length > 0 ? (
            <section>
              <SectionHeading title="Standings" href={`/league/${team.league.slug}`} />
              <LeagueTable standings={standings} highlightTeamSlug={team.slug} />
            </section>
          ) : null}

          {upcoming.length > 0 ? (
            <section>
              <SectionHeading title="Upcoming Fixtures" />
              <div className="flex flex-col gap-3">
                {upcoming.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ) : null}

          {recent.length > 0 ? (
            <section>
              <SectionHeading title="Recent Results" />
              <div className="flex flex-col gap-3">
                {recent.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ) : null}

          {players.length > 0 ? (
            <section>
              <SectionHeading title="Squad" />
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {players.map((player) => (
                  <li key={player.id}>
                    <Link
                      href={`/player/${player.slug}`}
                      className="flex flex-col rounded-md border border-border bg-surface p-3 hover:border-primary/40"
                    >
                      <span className="font-semibold">{player.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {player.position}
                        {player.jerseyNumber ? ` · #${player.jerseyNumber}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {articlesResult.items.length > 0 ? (
            <section>
              <SectionHeading title={`Latest ${team.name} News`} />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articlesResult.items.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          ) : null}

          {upcoming.length === 0 &&
          recent.length === 0 &&
          players.length === 0 &&
          articlesResult.items.length === 0 &&
          standings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No fixtures, standings, or articles on file for {team.name} right now.
            </p>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <SidebarAd />
        </aside>
      </div>
    </div>
  );
}
