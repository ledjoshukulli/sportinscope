"use client";

import type { Match } from "@/types";
import { Tabs } from "@/components/ui/tabs";
import { MatchCard } from "./match-card";

interface ScoresViewProps {
  live: Match[];
  upcoming: Match[];
  recent: Match[];
}

function MatchGroup({ matches, emptyLabel }: { matches: Match[]; emptyLabel: string }) {
  if (matches.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

/** Client-side tab switcher for the /scores page — data is fetched server-side and handed in as props. */
export function ScoresView({ live, upcoming, recent }: ScoresViewProps) {
  return (
    <Tabs
      defaultKey={live.length > 0 ? "live" : "upcoming"}
      items={[
        {
          key: "live",
          label: `Live${live.length > 0 ? ` (${live.length})` : ""}`,
          content: <MatchGroup matches={live} emptyLabel="No matches are live right now." />,
        },
        {
          key: "upcoming",
          label: "Upcoming",
          content: <MatchGroup matches={upcoming} emptyLabel="No upcoming matches scheduled." />,
        },
        {
          key: "recent",
          label: "Recent Results",
          content: <MatchGroup matches={recent} emptyLabel="No recent results yet." />,
        },
      ]}
    />
  );
}
