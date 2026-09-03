import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/content/articles";
import { getAllTeams } from "@/lib/content/teams";
import { getAllPlayers } from "@/lib/content/players";
import { getAllLeagues } from "@/lib/content/leagues";
import { siteConfig } from "@/config/site";

const STATIC_ROUTES = [
  "",
  "/football",
  "/nba",
  "/scores",
  "/standings",
  "/transfers",
  "/analysis",
  "/trending",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

/**
 * Generated at request time (or at build time for a static export) rather
 * than hard-coded — every published article, team, player, and league gets
 * its own entry automatically as content is added through the CMS.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: articles }, teams, players, leagues] = await Promise.all([
    getPublishedArticles({ limit: 500 }),
    getAllTeams(),
    getAllPlayers(),
    getAllLeagues(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/article/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const teamEntries: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${siteConfig.url}/team/${team.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const playerEntries: MetadataRoute.Sitemap = players.map((player) => ({
    url: `${siteConfig.url}/player/${player.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const leagueEntries: MetadataRoute.Sitemap = leagues.map((league) => ({
    url: `${siteConfig.url}/league/${league.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries, ...teamEntries, ...playerEntries, ...leagueEntries];
}
