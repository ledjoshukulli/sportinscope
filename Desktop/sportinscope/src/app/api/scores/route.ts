import { NextResponse, type NextRequest } from "next/server";
import { getSportsProvider } from "@/lib/api";
import { sportSchema } from "@/lib/validations";
import type { Sport } from "@/types";
import { activeSports } from "@/config/sports";

/** GET /api/scores?sport=FOOTBALL&type=live|upcoming|recent — live scores bar / scores page data. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sportParsed = sportSchema.safeParse(params.get("sport"));
  const type = params.get("type") ?? "live";
  const sports: Sport[] = sportParsed.success ? [sportParsed.data] : activeSports.map((s) => s.key);

  const results = await Promise.all(
    sports.map(async (sport) => {
      const provider = getSportsProvider(sport);
      if (type === "upcoming") return provider.getUpcomingMatches();
      if (type === "recent") return provider.getRecentMatches();
      return provider.getLiveMatches();
    }),
  );

  const matches = results.flat().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return NextResponse.json(
    { matches },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } },
  );
}
