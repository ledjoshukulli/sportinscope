import type { Transfer } from "@/types";
import { mockTeams } from "./teams";

function team(slug: string) {
  return mockTeams.find((x) => x.slug === slug) ?? null;
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export const mockTransfers: Transfer[] = [
  {
    id: "transfer-1",
    playerName: "Victor Osimhen",
    fromTeam: team("napoli"),
    toTeam: team("chelsea"),
    status: "NEGOTIATING",
    feeAmount: "€75m (reported)",
    source: "Fabrizio Romano",
    sourceUrl: "https://twitter.com/fabrizioromano",
    sport: "FOOTBALL",
    reportedAt: daysAgo(1),
  },
  {
    id: "transfer-2",
    playerName: "Marcus Rashford",
    fromTeam: team("manchester-united"),
    toTeam: team("barcelona"),
    status: "MEDICAL",
    feeAmount: "€45m + add-ons",
    source: "The Athletic",
    sourceUrl: "https://theathletic.com",
    sport: "FOOTBALL",
    reportedAt: daysAgo(2),
  },
  {
    id: "transfer-3",
    playerName: "Federico Chiesa",
    fromTeam: team("juventus"),
    toTeam: team("liverpool"),
    status: "CONFIRMED",
    feeAmount: "€12m",
    source: "Sky Sports",
    sourceUrl: "https://skysports.com",
    sport: "FOOTBALL",
    reportedAt: daysAgo(6),
    confirmedAt: daysAgo(5),
  },
  {
    id: "transfer-4",
    playerName: "Nico Williams",
    fromTeam: null,
    toTeam: team("barcelona"),
    status: "RUMOR",
    feeAmount: "Release clause reportedly €58m",
    source: "AS",
    sourceUrl: "https://as.com",
    sport: "FOOTBALL",
    reportedAt: daysAgo(0.5),
  },
  {
    id: "transfer-5",
    playerName: "Joshua Kimmich",
    fromTeam: team("bayern-munich"),
    toTeam: team("psg"),
    status: "REPORTED",
    feeAmount: "Contract expiring — free transfer mooted",
    source: "L'Équipe",
    sourceUrl: "https://lequipe.fr",
    sport: "FOOTBALL",
    reportedAt: daysAgo(3),
  },
  {
    id: "transfer-6",
    playerName: "Ademola Lookman",
    fromTeam: null,
    toTeam: team("inter-milan"),
    status: "RUMOR",
    feeAmount: "Undisclosed",
    source: "Gazzetta dello Sport",
    sourceUrl: "https://gazzetta.it",
    sport: "FOOTBALL",
    reportedAt: daysAgo(1.5),
  },
  {
    id: "transfer-7",
    playerName: "Bruno Guimarães",
    fromTeam: team("newcastle-united"),
    toTeam: team("real-madrid"),
    status: "NEGOTIATING",
    feeAmount: "€90m release clause",
    source: "Marca",
    sourceUrl: "https://marca.com",
    sport: "FOOTBALL",
    reportedAt: daysAgo(4),
  },
];

export function getMockTransfers(): Transfer[] {
  return [...mockTransfers].sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(),
  );
}
