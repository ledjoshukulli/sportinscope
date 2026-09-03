import type { Metadata } from "next";
import { getSportsProvider } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ScoresView } from "@/components/sports/scores-view";
import { activeSports } from "@/config/sports";

export const revalidate = 30;

export const metadata: Metadata = buildMetadata({
  title: "Live Scores",
  description: "Live football and NBA scores, upcoming fixtures, and recent results — updated continuously.",
  path: "/scores",
});

export default async function ScoresPage() {
  const providers = activeSports.map((s) => getSportsProvider(s.key));

  const [live, upcoming, recent] = await Promise.all([
    Promise.all(providers.map((p) => p.getLiveMatches())).then((r) => r.flat()),
    Promise.all(providers.map((p) => p.getUpcomingMatches(10))).then((r) =>
      r.flat().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    ),
    Promise.all(providers.map((p) => p.getRecentMatches(10))).then((r) =>
      r.flat().sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    ),
  ]);

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Scores" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Live Scores</h1>
      <ScoresView live={live} upcoming={upcoming} recent={recent} />
    </div>
  );
}
