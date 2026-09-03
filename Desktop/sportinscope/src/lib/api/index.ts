import type { Sport } from "@/types";
import type { SportsDataProvider } from "./providers/types";
import { MockSportsProvider } from "./providers/mock-provider";
import { FootballDataProvider } from "./providers/football-data-provider";
import { NBADataProvider } from "./providers/nba-data-provider";

const providerCache = new Map<Sport, SportsDataProvider>();

/**
 * Returns the active SportsDataProvider for a sport.
 *
 *   SportsDataProvider (interface)
 *       ↓
 *   MockSportsProvider          — default, zero-config, used in local dev
 *       ↓
 *   FootballDataProvider / NBADataProvider — used automatically once the
 *       matching *_API_KEY environment variable is set
 *
 * Nothing outside this file needs to know which implementation is active.
 */
export function getSportsProvider(sport: Sport): SportsDataProvider {
  const cached = providerCache.get(sport);
  if (cached) return cached;

  let provider: SportsDataProvider;
  switch (sport) {
    case "FOOTBALL":
      provider = process.env.FOOTBALL_API_KEY ? new FootballDataProvider() : new MockSportsProvider("FOOTBALL");
      break;
    case "NBA":
      provider = process.env.NBA_API_KEY ? new NBADataProvider() : new MockSportsProvider("NBA");
      break;
    default:
      // Future sports (NFL, MLB, F1, Tennis, NHL) default to an empty mock
      // provider until a real provider is implemented for them.
      provider = new MockSportsProvider(sport);
  }

  providerCache.set(sport, provider);
  return provider;
}

export type { SportsDataProvider };
