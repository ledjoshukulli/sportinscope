import type { Transfer, TransferStatus } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { getMockTransfers, mockTransfers } from "@/lib/mock-data/transfers";
import type { TransferInput } from "@/lib/validations";
import { mockTeams } from "@/lib/mock-data/teams";

let memoryTransfers: Transfer[] = getMockTransfers();

/** Prisma stores reportedAt/confirmedAt as native Dates; the domain type expects ISO strings. */
function toTransfer<T extends { reportedAt: Date; confirmedAt: Date | null }>(
  row: T,
): Omit<T, "reportedAt" | "confirmedAt"> & Pick<Transfer, "reportedAt" | "confirmedAt"> {
  return {
    ...row,
    reportedAt: row.reportedAt.toISOString(),
    confirmedAt: row.confirmedAt ? row.confirmedAt.toISOString() : null,
  };
}

export async function getTransfers(opts: { status?: TransferStatus; limit?: number } = {}): Promise<Transfer[]> {
  if (isDatabaseConfigured()) {
    const rows = await prisma.transfer.findMany({
      where: opts.status ? { status: opts.status } : {},
      include: { fromTeam: true, toTeam: true },
      orderBy: { reportedAt: "desc" },
      take: opts.limit,
    });
    return rows.map(toTransfer);
  }
  return memoryTransfers
    .filter((t) => !opts.status || t.status === opts.status)
    .slice(0, opts.limit ?? memoryTransfers.length);
}

export async function createTransfer(input: TransferInput): Promise<Transfer> {
  // Form selects send "" for "None/Unattached/Unconfirmed" — normalize to null
  // so empty strings never hit Prisma as invalid foreign key values.
  const playerId = input.playerId || null;
  const fromTeamId = input.fromTeamId || null;
  const toTeamId = input.toTeamId || null;

  if (isDatabaseConfigured()) {
    const row = await prisma.transfer.create({
      data: { ...input, playerId, fromTeamId, toTeamId },
      include: { fromTeam: true, toTeam: true },
    });
    return toTransfer(row);
  }
  const transfer: Transfer = {
    id: `transfer-${Date.now()}`,
    playerName: input.playerName,
    playerId,
    fromTeam: mockTeams.find((t) => t.id === fromTeamId) ?? null,
    toTeam: mockTeams.find((t) => t.id === toTeamId) ?? null,
    status: input.status,
    feeAmount: input.feeAmount ?? null,
    source: input.source,
    sourceUrl: input.sourceUrl || null,
    sport: input.sport,
    reportedAt: new Date().toISOString(),
    confirmedAt: input.status === "CONFIRMED" ? new Date().toISOString() : null,
  };
  memoryTransfers = [transfer, ...memoryTransfers];
  return transfer;
}

export function resetMemoryTransfers() {
  memoryTransfers = [...mockTransfers];
}
