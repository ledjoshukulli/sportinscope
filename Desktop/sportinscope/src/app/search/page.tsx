import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchArticles } from "@/lib/content/articles";
import { getAllTeams } from "@/lib/content/teams";
import { getAllPlayers } from "@/lib/content/players";
import { getAllLeagues } from "@/lib/content/leagues";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/articles/article-card";
import { TeamCard } from "@/components/sports/team-card";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search SportInScope for articles, teams, players, and leagues.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const lowerQuery = query.toLowerCase();

  const [articles, teams, players, leagues] = query
    ? await Promise.all([
        searchArticles(query, 12),
        getAllTeams().then((all) => all.filter((t) => t.name.toLowerCase().includes(lowerQuery)).slice(0, 8)),
        getAllPlayers().then((all) => all.filter((p) => p.name.toLowerCase().includes(lowerQuery)).slice(0, 8)),
        getAllLeagues().then((all) => all.filter((l) => l.name.toLowerCase().includes(lowerQuery)).slice(0, 8)),
      ])
    : [[], [], [], []];

  const hasResults = articles.length > 0 || teams.length > 0 || players.length > 0 || leagues.length > 0;

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <Breadcrumbs items={[{ label: "Search" }]} />

      <form action="/search" className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search articles, teams, players…"
          aria-label="Search"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </form>

      {!query ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Start typing to search SportInScope.</p>
      ) : !hasResults ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No results for &ldquo;{query}&rdquo;. Try a team, player, or league name.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {articles.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Articles</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          ) : null}

          {teams.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Teams</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {teams.map((t) => (
                  <TeamCard key={t.id} team={t} />
                ))}
              </div>
            </section>
          ) : null}

          {players.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Players</h2>
              <ul className="flex flex-col divide-y divide-border">
                {players.map((p) => (
                  <li key={p.id} className="py-3">
                    <Link href={`/player/${p.slug}`} className="font-semibold hover:text-primary">
                      {p.name}
                    </Link>
                    <span className="ml-2 text-sm text-muted-foreground">{p.position}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {leagues.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Leagues</h2>
              <ul className="flex flex-col divide-y divide-border">
                {leagues.map((l) => (
                  <li key={l.id} className="py-3">
                    <Link href={`/league/${l.slug}`} className="font-semibold hover:text-primary">
                      {l.name}
                    </Link>
                    {l.country ? <span className="ml-2 text-sm text-muted-foreground">{l.country}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
