import { syncLiveData } from "../src/lib/api/sync-live-data";
import type { Sport } from "../src/types";

const SPORT_VALUES: Sport[] = ["FOOTBALL", "NBA", "NFL", "MLB", "F1", "TENNIS", "NHL"];

function parseSportsArg(): Sport[] | undefined {
  const raw = process.argv.find((arg) => arg.startsWith("--sports="));
  if (!raw) return undefined;

  const value = raw.slice("--sports=".length);
  const sports = value
    .split(",")
    .map((sport) => sport.trim().toUpperCase())
    .filter((sport): sport is Sport => SPORT_VALUES.includes(sport as Sport));

  return sports.length > 0 ? sports : undefined;
}

function parseIncludePlayersArg(): boolean {
  return !process.argv.includes("--no-players");
}

async function main() {
  const result = await syncLiveData({
    sports: parseSportsArg(),
    includePlayers: parseIncludePlayersArg(),
  });

  console.log("Live sync completed:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});