import type { Metadata } from "next";
import { getAuthors, getCategories, getTags } from "@/lib/content/taxonomy";
import { getAllTeams } from "@/lib/content/teams";
import { getAllLeagues } from "@/lib/content/leagues";
import { getAllPlayers } from "@/lib/content/players";
import { buildMetadata } from "@/lib/seo";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = buildMetadata({
  title: "New Article",
  description: "Create a new SportInScope article.",
  path: "/admin/articles/new",
  noIndex: true,
});

export default async function NewArticlePage() {
  const [authors, categories, tags, teams, leagues, players] = await Promise.all([
    getAuthors(),
    getCategories(),
    getTags(),
    getAllTeams(),
    getAllLeagues(),
    getAllPlayers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">New Article</h1>
      <ArticleForm authors={authors} categories={categories} tags={tags} teams={teams} leagues={leagues} players={players} />
    </div>
  );
}
