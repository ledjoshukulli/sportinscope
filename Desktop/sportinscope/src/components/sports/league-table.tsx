import Link from "next/link";
import type { Standing } from "@/types";
import { TeamLogo } from "./team-logo";
import { cn } from "@/lib/utils";

interface LeagueTableProps {
  standings: Standing[];
  className?: string;
  highlightTeamSlug?: string;
}

/** Full standings table for a league page, sorted by position. */
export function LeagueTable({ standings, className, highlightTeamSlug }: LeagueTableProps) {
  const sorted = [...standings].sort((a, b) => a.position - b.position);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">Standings aren&apos;t available yet.</p>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-md border border-border", className)}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="w-10 px-3 py-2.5 text-center">#</th>
            <th className="px-3 py-2.5">Club</th>
            <th className="w-10 px-2 py-2.5 text-center">P</th>
            <th className="w-10 px-2 py-2.5 text-center">W</th>
            <th className="w-10 px-2 py-2.5 text-center">D</th>
            <th className="w-10 px-2 py-2.5 text-center">L</th>
            <th className="w-14 px-2 py-2.5 text-center">GD</th>
            <th className="w-12 px-3 py-2.5 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const gd = row.goalsFor - row.goalsAgainst;
            const isHighlighted = row.team.slug === highlightTeamSlug;
            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border last:border-0",
                  isHighlighted ? "bg-primary/5" : "hover:bg-muted/40",
                )}
              >
                <td className="px-3 py-2.5 text-center font-bold text-muted-foreground">{row.position}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/team/${row.team.slug}`} className="flex items-center gap-2 font-semibold hover:text-primary">
                    <TeamLogo src={row.team.logoUrl} alt={row.team.name} color={row.team.colorPrimary} size={20} />
                    <span className="truncate">{row.team.name}</span>
                  </Link>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.played}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.won}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.drawn}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.lost}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-2.5 text-center font-bold tabular-nums">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
