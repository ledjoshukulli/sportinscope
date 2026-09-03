import Link from "next/link";
import type { Match } from "@/types";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { TeamLogo } from "./team-logo";
import { cn, formatTime } from "@/lib/utils";

interface ScoreCardProps {
  match: Match;
  className?: string;
}

/** Compact match card used in the horizontal live-scores ticker under the header. */
export function ScoreCard({ match, className }: ScoreCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const hasScore = isLive || isFinished;

  return (
    <Link
      href={`/league/${match.league?.slug ?? ""}`}
      className={cn(
        "flex w-52 shrink-0 flex-col gap-2 rounded-md border border-border bg-surface p-3 transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {match.league?.name ?? "Match"}
        </span>
        {isLive ? (
          <LiveBadge />
        ) : isFinished ? (
          <Badge variant="outline">FT</Badge>
        ) : match.status === "POSTPONED" ? (
          <Badge variant="warning">PPD</Badge>
        ) : match.status === "CANCELLED" ? (
          <Badge variant="warning">Cancelled</Badge>
        ) : (
          <span className="text-[11px] font-semibold text-muted-foreground">{formatTime(match.startTime)}</span>
        )}
      </div>

      <TeamRow team={match.homeTeam} score={hasScore ? match.homeScore : undefined} />
      <TeamRow team={match.awayTeam} score={hasScore ? match.awayScore : undefined} />

      {isLive && match.clock ? (
        <span className="text-[11px] font-bold text-live">{match.clock}</span>
      ) : null}
    </Link>
  );
}

function TeamRow({ team, score }: { team: Match["homeTeam"]; score?: number | null }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={20} />
        <span className="truncate text-sm font-semibold">{team.shortName ?? team.name}</span>
      </div>
      {score !== undefined ? <span className="text-sm font-bold tabular-nums">{score ?? "-"}</span> : null}
    </div>
  );
}
