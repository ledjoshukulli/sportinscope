import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerBySlug } from "@/lib/content/players";
import { getPublishedArticles } from "@/lib/content/articles";
import type { ArticleSummary } from "@/types";
import { buildMetadata, playerJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { TeamLogo } from "@/components/sports/team-logo";
import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface PlayerPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) {
    return buildMetadata({ title: "Player not found", description: "This player could not be found.", path: `/player/${slug}`, noIndex: true });
  }
  return buildMetadata({
    title: `${player.name}${player.team ? ` — ${player.team.name}` : ""}`,
    description: `News, stats, and profile for ${player.name}${player.team ? `, currently playing for ${player.team.name}` : ""}.`,
    path: `/player/${player.slug}`,
    image: player.photoUrl,
  });
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const teamArticles = player.team
    ? await getPublishedArticles({ teamSlug: player.team.slug, limit: 20 })
    : { items: [] as ArticleSummary[] };

  const playerArticles = teamArticles.items.filter((a) => a.player?.slug === player.slug);
  const relatedArticles = (playerArticles.length > 0 ? playerArticles : teamArticles.items).slice(0, 6);

  const breadcrumbItems = [
    { label: player.sport === "FOOTBALL" ? "Football" : "NBA", href: player.sport === "FOOTBALL" ? "/football" : "/nba" },
    ...(player.team ? [{ label: player.team.name, href: `/team/${player.team.slug}` }] : []),
    { label: player.name },
  ];

  return (
    <div className="container-page flex flex-col gap-10 py-8">
      <JsonLd data={playerJsonLd(player)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems.map((i) => ({ name: i.label, href: i.href ?? `/player/${player.slug}` })))} />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="flex flex-wrap items-center gap-5">
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photoUrl}
            alt={player.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
            {player.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{player.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {player.team ? (
              <Link href={`/team/${player.team.slug}`} className="inline-flex items-center gap-1.5 font-semibold hover:text-primary">
                <TeamLogo src={player.team.logoUrl} alt={player.team.name} color={player.team.colorPrimary} size={18} />
                {player.team.name}
              </Link>
            ) : (
              <span>Free agent</span>
            )}
            {player.position ? <span>· {player.position}</span> : null}
            {player.jerseyNumber ? <span>· #{player.jerseyNumber}</span> : null}
          </p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <section>
            <SectionHeading title="Profile" />
            <dl className="grid grid-cols-2 gap-4 rounded-md border border-border bg-surface p-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nationality</dt>
                <dd className="mt-1 font-semibold">{player.nationality ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Position</dt>
                <dd className="mt-1 font-semibold">{player.position ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Date of Birth</dt>
                <dd className="mt-1 font-semibold">{player.dateOfBirth ? formatDate(player.dateOfBirth) : "—"}</dd>
              </div>
            </dl>
          </section>

          {relatedArticles.length > 0 ? (
            <section>
              <SectionHeading title={`Latest ${player.name} News`} />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">No news for {player.name} yet.</p>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <SidebarAd />
        </aside>
      </div>
    </div>
  );
}
