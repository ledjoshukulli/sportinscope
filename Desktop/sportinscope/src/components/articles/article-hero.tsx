import Image from "next/image";
import type { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ShareBar } from "./share-bar";
import { formatDate, cn } from "@/lib/utils";

interface ArticleHeroProps {
  article: Article;
  className?: string;
}

/** Headline block for the article detail page: kicker, title, dek, byline, share, hero image. */
export function ArticleHero({ article, className }: ArticleHeroProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <Badge variant={article.sport === "FOOTBALL" ? "football" : "nba"}>{article.category.name}</Badge>
        {article.tags.slice(0, 3).map((tag) => (
          <span key={tag.id} className="text-xs font-semibold text-muted-foreground">
            #{tag.name}
          </span>
        ))}
      </div>

      <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {article.title}
      </h1>

      <p className="text-lg text-muted-foreground">{article.excerpt}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
        <div className="flex items-center gap-3">
          {article.author.avatarUrl ? (
            <Image
              src={article.author.avatarUrl}
              alt={article.author.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {article.author.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
          )}
          <span>
            <span className="block text-sm font-bold">{article.author.name}</span>
            <span className="block text-xs text-muted-foreground">
              {formatDate(article.publishedAt ?? article.createdAt)} · {article.readingTimeMins} min read
            </span>
          </span>
        </div>
        <ShareBar path={`/article/${article.slug}`} title={article.title} />
      </div>

      {article.featuredImage ? (
        <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
        </figure>
      ) : null}
    </header>
  );
}
