import Link from "next/link";
import type { Team } from "@/types";
import { TeamLogo } from "./team-logo";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: Team;
  className?: string;
}

export function TeamCard({ team, className }: TeamCardProps) {
  return (
    <Link
      href={`/team/${team.slug}`}
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-border bg-surface p-5 text-center transition-colors hover:border-primary/40",
        className,
      )}
    >
      <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={56} />
      <div>
        <p className="font-display text-sm font-bold tracking-tight">{team.name}</p>
        {team.league ? <p className="mt-0.5 text-xs text-muted-foreground">{team.league.name}</p> : null}
      </div>
    </Link>
  );
}
