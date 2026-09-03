import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { TrendingTopic } from "@/types";
import { cn } from "@/lib/utils";

interface TrendingBarProps {
  topics: TrendingTopic[];
  className?: string;
}

/**
 * Horizontal, horizontally-scrollable strip of currently-trending stories.
 * Sits directly under the live scores bar on the homepage. Renders nothing
 * if there's no trending data yet (e.g. a brand-new site with no view
 * history) rather than showing an empty shell.
 */
export function TrendingBar({ topics, className }: TrendingBarProps) {
  if (topics.length === 0) return null;

  return (
    <div className={cn("border-b border-border bg-surface", className)} aria-label="Trending now">
      <div className="container-page flex items-center gap-3 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          Trending
        </span>
        <ul className="flex shrink-0 items-center gap-2">
          {topics.map((topic, i) => (
            <li key={topic.slug} className="flex shrink-0 items-center gap-2">
              {i > 0 ? <span className="text-border" aria-hidden>·</span> : null}
              <Link
                href={topic.href}
                className="whitespace-nowrap text-sm font-medium text-foreground/80 hover:text-primary"
              >
                {topic.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
