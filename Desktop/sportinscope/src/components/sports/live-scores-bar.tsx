import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Match } from "@/types";
import { ScoreCard } from "./score-card";
import { cn } from "@/lib/utils";

interface LiveScoresBarProps {
  matches: Match[];
  className?: string;
}

/**
 * Homepage strip directly under the header showing live/upcoming matches
 * across active sports. Renders nothing if there's genuinely no match data
 * (e.g. an off-season lull) rather than an empty bar.
 */
export function LiveScoresBar({ matches, className }: LiveScoresBarProps) {
  if (matches.length === 0) return null;

  return (
    <div className={cn("border-b border-border bg-surface-raised", className)} aria-label="Live and upcoming scores">
      <div className="container-page flex items-center gap-3 py-3">
        <div className="flex flex-1 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {matches.map((match) => (
            <ScoreCard key={match.id} match={match} />
          ))}
        </div>
        <Link
          href="/scores"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          All scores
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
