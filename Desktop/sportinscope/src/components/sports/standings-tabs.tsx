"use client";

import type { Standing } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { LeagueTable } from "./league-table";

interface LeagueStandings {
  slug: string;
  name: string;
  standings: Standing[];
}

export function StandingsTabs({ leagues }: { leagues: LeagueStandings[] }) {
  return (
    <Tabs
      items={leagues.map((league) => ({
        key: league.slug,
        label: league.name,
        content: <LeagueTable standings={league.standings} />,
      }))}
    />
  );
}
