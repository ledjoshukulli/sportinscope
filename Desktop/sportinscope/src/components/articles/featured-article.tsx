import Link from "next/link";
import Image from "next/image";
import type { ArticleSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, cn } from "@/lib/utils";

interface FeaturedArticleProps {
  article: ArticleSummary;
  className?: string;
}

/** Large hero treatment for the homepage's lead story. */
export function FeaturedArticle({ article, className }: FeaturedArticleProps) {
  return (
    <Link href={`/article/${article.slug}`} className={cn("group relative block overflow-hidden rounded-md", className)}>
      <div className="relative aspect-[16/9] w-full bg-muted sm:aspect-[16/7]">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            unoptimized={article.featuredImage.includes(".supabase.co/")}
            sizes="100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-8">
        <Badge variant={article.sport === "FOOTBALL" ? "football" : "nba"} className="w-fit">
          {article.category.name}
        </Badge>
        <h2 className="max-w-3xl font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          {article.title}
        </h2>
        <p className="max-w-2xl text-sm text-white/80 sm:text-base">{article.excerpt}</p>
        <p className="text-xs font-semibold text-white/70">
          {article.author.name} · {formatRelativeTime(article.publishedAt ?? article.createdAt)} · {article.readingTimeMins} min read
        </p>
      </div>
    </Link>
  );
}
