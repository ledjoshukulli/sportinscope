import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Article, Author, League, Match, Player, Team } from "@/types";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
}

/** Central metadata builder — every page composes its <Metadata> through this so title templates, OG, and Twitter cards stay consistent site-wide. */
export function buildMetadata(input: PageMetaInput): Metadata {
  const url = `${siteConfig.url}${input.path}`;
  const image = input.image ?? `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      type: input.type ?? "website",
      ...(input.type === "article"
        ? {
            publishedTime: input.publishedTime ?? undefined,
            modifiedTime: input.modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [siteConfig.social.twitter, siteConfig.social.facebook, siteConfig.social.instagram],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };
}

export function articleJsonLd(article: Article) {
  const keywords = article.tags ? article.tags.map((t) => t.name).join(", ") : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage ? [article.featuredImage] : undefined,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    keywords,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: `${siteConfig.url}/author/${article.author.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/article/${article.slug}`,
    },
    articleSection: article.category.name,
  };
}

export function sportsEventJsonLd(match: Match) {
  const statusMap: Record<Match["status"], string> = {
    SCHEDULED: "https://schema.org/EventScheduled",
    LIVE: "https://schema.org/EventMovedOnline",
    FINISHED: "https://schema.org/EventCompleted",
    POSTPONED: "https://schema.org/EventPostponed",
    CANCELLED: "https://schema.org/EventCancelled",
  };

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate: match.startTime,
    eventStatus: statusMap[match.status] ?? "https://schema.org/EventScheduled",
    sport: match.sport === "FOOTBALL" ? "Soccer" : "Basketball",
    homeTeam: {
      "@type": "SportsTeam",
      name: match.homeTeam.name,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: match.awayTeam.name,
    },
    location: match.venue
      ? {
          "@type": "Place",
          name: match.venue,
        }
      : undefined,
  };
}

export function authorJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${siteConfig.url}/author/${author.slug}`,
    image: author.avatarUrl ?? undefined,
    description: author.bio ?? undefined,
    jobTitle: author.title ?? "Sports Journalist",
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

export function teamJsonLd(team: Team) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: team.sport === "FOOTBALL" ? "Soccer" : "Basketball",
    url: `${siteConfig.url}/team/${team.slug}`,
    logo: team.logoUrl ?? undefined,
    memberOf: team.league ? { "@type": "SportsOrganization", name: team.league.name } : undefined,
  };
}

export function playerJsonLd(player: Player) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    url: `${siteConfig.url}/player/${player.slug}`,
    image: player.photoUrl ?? undefined,
    nationality: player.nationality ?? undefined,
    memberOf: player.team ? { "@type": "SportsTeam", name: player.team.name } : undefined,
  };
}

export function leagueJsonLd(league: League) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: league.name,
    url: `${siteConfig.url}/league/${league.slug}`,
    logo: league.logoUrl ?? undefined,
  };
}
