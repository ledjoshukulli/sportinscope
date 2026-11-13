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
  if (sorted[0]?.team.sport === "NBA") {
    return <NbaStandingsTable standings={sorted} className={className} highlightTeamSlug={highlightTeamSlug} />;
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

function NbaStandingsTable({ standings, className, highlightTeamSlug }: LeagueTableProps) {
  const conferences = [...new Set(standings.map((row) => row.conference ?? "NBA"))];
  const source = standings[0]?.source;
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {conferences.map((conference) => (
        <section key={conference}>
          <h3 className="mb-3 font-display text-lg font-bold">{conference} · {standings[0]?.season}</h3>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <caption className="sr-only">{conference} NBA standings</caption>
              <thead className="bg-surface-raised text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Rank", "Team", "W", "L", "PCT", "GB"].map((label) => (
                    <th key={label} scope="col" className={cn("px-3 py-2.5", label !== "Team" && "text-center")}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.filter((row) => (row.conference ?? "NBA") === conference)
                  .sort((a, b) => a.position - b.position).map((row) => (
                    <tr key={row.id} className={cn("border-t border-border", row.team.slug === highlightTeamSlug ? "bg-primary/5" : "hover:bg-muted/40")}>
                      <td className="px-3 py-2.5 text-center font-bold tabular-nums">{row.position}</td>
                      <td className="px-3 py-2.5">
                        <Link href={`/team/${row.team.slug}`} className="flex items-center gap-2 font-semibold hover:text-primary">
                          <TeamLogo src={row.team.logoUrl} alt={row.team.name} size={20} />
                          {row.team.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{row.won}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{row.lost}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{(row.winPercentage ?? (row.played ? row.won / row.played : 0)).toFixed(3)}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{row.gamesBehind === undefined ? "—" : row.gamesBehind === 0 ? "—" : row.gamesBehind}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {source ? (
        <p className="text-xs text-muted-foreground">
          Source: <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{source.name}</a>.
          {" "}Standings data is cached for one hour. PCT = winning percentage; GB = games behind the conference leader.
        </p>
      ) : null}
    </div>
  );
}
