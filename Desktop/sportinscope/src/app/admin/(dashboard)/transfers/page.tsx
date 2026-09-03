import type { Metadata } from "next";
import { getTransfers } from "@/lib/content/transfers";
import { getAllTeams } from "@/lib/content/teams";
import { getAllPlayers } from "@/lib/content/players";
import { buildMetadata } from "@/lib/seo";
import { NewTransferButton } from "@/components/admin/transfer-form";
import { TransferCard } from "@/components/sports/transfer-card";

export const metadata: Metadata = buildMetadata({
  title: "Manage Transfers",
  description: "SportInScope CMS transfer management.",
  path: "/admin/transfers",
  noIndex: true,
});

export default async function AdminTransfersPage() {
  const [transfers, teams, players] = await Promise.all([getTransfers(), getAllTeams(), getAllPlayers()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Transfers</h1>
        <NewTransferButton teams={teams} players={players} />
      </div>

      {transfers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {transfers.map((transfer) => (
            <TransferCard key={transfer.id} transfer={transfer} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          No transfers logged yet.
        </p>
      )}
    </div>
  );
}
