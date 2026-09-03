import Link from "next/link";
import Image from "next/image";
import type { ArticleSummary } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";

type Variant = "default" | "horizontal" | "compact";

interface Props {
  article: ArticleSummary;
  variant?: Variant;
  className?: string;
}

/** Standard story card used across grids, section lists, and "Latest" rails. */
export function ArticleCard({ article, variant = "default", className }: Props) {
  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className={cn("group flex gap-4 rounded-md", className)}
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-36">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              sizes="144px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1.5">
          <span className="kicker">{article.category.name}</span>
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug tracking-tight group-hover:text-primary sm:text-base">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {article.author.name} · {formatRelativeTime(article.publishedAt ?? article.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`} className={cn("group block", className)}>
        <span className="kicker">{article.category.name}</span>
        <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug tracking-tight group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(article.publishedAt ?? article.createdAt)}</p>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`} className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-muted">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <span className="kicker">{article.category.name}</span>
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug tracking-tight group-hover:text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {article.author.name} · {formatRelativeTime(article.publishedAt ?? article.createdAt)} · {article.readingTimeMins} min read
        </p>
      </div>
    </Link>
  );
}
