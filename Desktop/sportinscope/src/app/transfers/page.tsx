import type { Metadata } from "next";
import Link from "next/link";
import { getTransfers } from "@/lib/content/transfers";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { TransferCard } from "@/components/sports/transfer-card";
import { cn } from "@/lib/utils";
import type { TransferStatus } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "Transfer News & Rumors",
  description: "The latest football and basketball transfer rumors, reports, and confirmed moves.",
  path: "/transfers",
});

const FILTERS: { label: string; value: TransferStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Rumors", value: "RUMOR" },
  { label: "Reported", value: "REPORTED" },
  { label: "Negotiating", value: "NEGOTIATING" },
  { label: "Confirmed", value: "CONFIRMED" },
];

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = FILTERS.some((f) => f.value === status) ? (status as TransferStatus) : undefined;

  const transfers = await getTransfers({ status: activeFilter });

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Transfers" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Transfer News</h1>

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((filter) => {
          const isActive = filter.value === "ALL" ? !activeFilter : activeFilter === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.value === "ALL" ? "/transfers" : `/transfers?status=${filter.value}`}
              className={cn(
                "shrink-0 rounded-md border px-3 py-1.5 text-sm font-semibold",
                isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {transfers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {transfers.map((transfer) => (
            <TransferCard key={transfer.id} transfer={transfer} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">No transfers match this filter yet.</p>
      )}
    </div>
  );
}

