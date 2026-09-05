import Link from "next/link";
import type { Match } from "@/types";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { sportsEventJsonLd } from "@/lib/seo";
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
  const leagueSlug = match.league?.slug;

  return (
    // @container: layout below reacts to this card's own rendered width, not the viewport,
    // so it stacks correctly even when embedded in a narrow sidebar on a wide screen.
    <div className={cn("@container", className)}>
      <JsonLd data={sportsEventJsonLd(match)} />
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 @xl:flex-row @xl:items-center @xl:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground @xl:w-40 @xl:shrink-0">
          {leagueSlug ? (
            <Link href={`/league/${leagueSlug}`} className="truncate hover:text-primary">
              {match.league?.name ?? "Match"}
            </Link>
          ) : (
            <span className="truncate">{match.league?.name ?? "Match"}</span>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-1 items-center justify-center gap-4 @xl:w-auto">
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

        <div className="text-xs text-muted-foreground @xl:w-32 @xl:shrink-0 @xl:text-right">
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
  const isClickable = Boolean(team && team.slug);
  const content = (
    <>
      <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={28} />
      {/* Below @xl container width there isn't room for full names side by side without
          ugly mid-word truncation, so show the short code instead (e.g. "TOU"). */}
      <span className="truncate text-sm font-semibold hover:text-primary @xl:hidden">
        {team.shortName ?? team.name}
      </span>
      <span className="hidden truncate text-sm font-semibold hover:text-primary @xl:inline">{team.name}</span>
      {score !== undefined ? <span className="ml-1 text-base font-bold tabular-nums">{score ?? "-"}</span> : null}
    </>
  );

  if (!isClickable) {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2",
          align === "right" ? "flex-row-reverse text-right" : "text-left",
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/team/${team.slug}`}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        align === "right" ? "flex-row-reverse text-right" : "text-left",
      )}
    >
      {content}
    </Link>
  );
}
