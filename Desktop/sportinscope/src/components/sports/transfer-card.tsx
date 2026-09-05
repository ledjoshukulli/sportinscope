import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Transfer, TransferStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TeamLogo } from "./team-logo";
import { cn, formatRelativeTime } from "@/lib/utils";

interface TransferCardProps {
  transfer: Transfer;
  className?: string;
}

const STATUS_LABEL: Record<TransferStatus, string> = {
  RUMOR: "Rumor",
  REPORTED: "Reported",
  NEGOTIATING: "Negotiating",
  MEDICAL: "Medical",
  CONFIRMED: "Confirmed",
};

const STATUS_VARIANT: Record<TransferStatus, "default" | "warning" | "success" | "outline"> = {
  RUMOR: "outline",
  REPORTED: "default",
  NEGOTIATING: "warning",
  MEDICAL: "warning",
  CONFIRMED: "success",
};

export function TransferCard({ transfer, className }: TransferCardProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-md border border-border bg-surface p-4", className)}>
      <div className="flex items-center justify-between">
        <Badge variant={STATUS_VARIANT[transfer.status]}>{STATUS_LABEL[transfer.status]}</Badge>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(transfer.reportedAt)}</span>
      </div>

      <p className="font-display text-base font-bold tracking-tight">
        {transfer.playerId ? (
          <Link href={`/player/${transfer.playerId}`} className="hover:text-primary">
            {transfer.playerName}
          </Link>
        ) : (
          transfer.playerName
        )}
      </p>

      <div className="flex items-center gap-3 text-sm">
        <ClubChip team={transfer.fromTeam} placeholder="Unattached" />
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <ClubChip team={transfer.toTeam} placeholder="Unconfirmed" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Source: {transfer.source}</span>
        {transfer.feeAmount ? <span className="font-semibold text-foreground">{transfer.feeAmount}</span> : null}
      </div>
    </div>
  );
}

function ClubChip({ team, placeholder }: { team: Transfer["fromTeam"]; placeholder: string }) {
  if (!team) {
    return <span className="text-sm text-muted-foreground">{placeholder}</span>;
  }
  if (!team.slug) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 font-semibold">
        <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={20} />
        <span className="truncate">{team.shortName ?? team.name}</span>
      </div>
    );
  }
  return (
    <Link href={`/team/${team.slug}`} className="flex min-w-0 items-center gap-1.5 font-semibold hover:text-primary">
      <TeamLogo src={team.logoUrl} alt={team.name} color={team.colorPrimary} size={20} />
      <span className="truncate">{team.shortName ?? team.name}</span>
    </Link>
  );
}
