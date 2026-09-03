import type { Metadata } from "next";
import { getSportsProvider } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { StandingsTabs } from "@/components/sports/standings-tabs";
import { activeSports } from "@/config/sports";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "League Standings & Tables",
  description: "Full league standings for the Premier League, Champions League, La Liga, Serie A, Bundesliga, and NBA.",
  path: "/standings",
});

export default async function StandingsPage() {
  const leagueRefs = activeSports.flatMap((sport) =>
    (sport.leagues ?? []).map((league) => ({ ...league, sport: sport.key })),
  );

  const leagues = await Promise.all(
    leagueRefs.map(async (league) => ({
      slug: league.slug,
      name: league.name,
      standings: await getSportsProvider(league.sport).getStandings(league.slug),
    })),
  );

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Standings" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Standings</h1>
      <StandingsTabs leagues={leagues} />
    </div>
  );
}
