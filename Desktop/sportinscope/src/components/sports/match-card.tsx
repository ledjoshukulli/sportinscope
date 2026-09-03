import Link from "next/link";
import type { Match } from "@/types";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { TeamLogo } from "./team-logo";
import { cn, formatDate, formatTime } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  className?: string;
}

/** Full-width match row used on the /scores listing and league pages. */
export function MatchCard({ match, className }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const hasScore = isLive || isFinished;

  return (
    // @container: layout below reacts to this card's own rendered width, not the viewport,
    // so it stacks correctly even when embedded in a narrow sidebar on a wide screen.
    <div className={cn("@container", className)}>
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground @sm:w-40 @sm:shrink-0">
          <Link href={`/league/${match.league?.slug ?? ""}`} className="truncate hover:text-primary">
            {match.league?.name ?? "Match"}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center gap-4">
          <TeamColumn team={match.homeTeam} score={hasScore ? match.homeScore : undefined} align="right" />
          <div className="flex w-16 shrink-0 flex-col items-center gap-1">
            {isLive ? (
              <LiveBadge />
            ) : isFinished ? (
              <Badge variant="outline">FT</Badge>
            ) : match.status === "POSTPONED" ? (
              <Badge variant="warning">Postponed</Badge>
            ) : match.status === "CANCELLED" ? (
              <Badge variant="warning">Cancelled</Badge>
            ) : (
              <span className="text-xs font-bold text-foreground">{formatTime(match.startTime)}</span>
            )}
            {isLive && match.clock ? <span className="text-[11px] font-bold text-live">{match.clock}</span> : null}
          </div>
          <TeamColumn team={match.awayTeam} score={hasScore ? match.awayScore : undefined} align="left" />
        </div>

        <div className="text-xs text-muted-foreground @sm:w-32 @sm:shrink-0 @sm:text-right">
          <div>{formatDate(match.startTime)}</div>
          {match.venue ? <div className="truncate">{match.venue}</div> : null}
        </div>
      </div>
    </div>
  );
}

function TeamColumn({
  team,
  score,
  align,
}: {
  team: Match["homeTeam"];
  score?: number | null;
  align: "left" | "right";
}) {
  return (
    <Link
      href={`/team/${team.slug}`}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        align === "right" ? "flex-row-reverse text-right" : "text-left",
      )}
    >
      <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={28} />
      {/* Below @sm container width there isn't room for full names side by side without
          ugly mid-word truncation, so show the short code instead (e.g. "TOU"). */}
      <span className="truncate text-sm font-semibold hover:text-primary @sm:hidden">
        {team.shortName ?? team.name}
      </span>
      <span className="hidden truncate text-sm font-semibold hover:text-primary @sm:inline">{team.name}</span>
      {score !== undefined ? <span className="ml-1 text-base font-bold tabular-nums">{score ?? "-"}</span> : null}
    </Link>
  );
}
