"use client";

import type { Standing } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { LeagueTable } from "./league-table";

interface LeagueStandings {
  slug: string;
  name: string;
  standings: Standing[];
  error?: string;
}

export function StandingsTabs({ leagues }: { leagues: LeagueStandings[] }) {
  return (
    <Tabs
      items={leagues.map((league) => ({
        key: league.slug,
        label: league.name,
        content: league.error ? (
          <p role="alert" className="text-sm text-muted-foreground">{league.error}</p>
        ) : <LeagueTable standings={league.standings} />,
      }))}
    />
  );
}
