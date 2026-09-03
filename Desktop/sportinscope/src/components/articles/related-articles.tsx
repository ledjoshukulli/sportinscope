import type { ArticleSummary } from "@/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArticleCard } from "./article-card";
import { cn } from "@/lib/utils";

interface RelatedArticlesProps {
  articles: ArticleSummary[];
  className?: string;
}

export function RelatedArticles({ articles, className }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className={cn(className)} aria-labelledby="related-heading">
      <SectionHeading title="Related Stories" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
