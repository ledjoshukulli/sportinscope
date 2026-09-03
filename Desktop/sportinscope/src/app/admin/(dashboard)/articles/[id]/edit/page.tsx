import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/content/articles";
import { getAuthors, getCategories, getTags } from "@/lib/content/taxonomy";
import { getAllTeams } from "@/lib/content/teams";
import { getAllLeagues } from "@/lib/content/leagues";
import { getAllPlayers } from "@/lib/content/players";
import { buildMetadata } from "@/lib/seo";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata: Metadata = buildMetadata({
  title: "Edit Article",
  description: "Edit a SportInScope article.",
  path: "/admin/articles",
  noIndex: true,
});

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const [article, authors, categories, tags, teams, leagues, players] = await Promise.all([
    getArticleById(id),
    getAuthors(),
    getCategories(),
    getTags(),
    getAllTeams(),
    getAllLeagues(),
    getAllPlayers(),
  ]);

  if (!article) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Edit Article</h1>
      <ArticleForm
        article={article}
        authors={authors}
        categories={categories}
        tags={tags}
        teams={teams}
        leagues={leagues}
        players={players}
      />
    </div>
  );
}
