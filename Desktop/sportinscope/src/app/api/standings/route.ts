import { NextResponse, type NextRequest } from "next/server";
import { getSportsProvider } from "@/lib/api";
import { getLeagueBySlug } from "@/lib/content/leagues";

/** GET /api/standings?league=premier-league — standings table for a league. */
export async function GET(request: NextRequest) {
  const leagueSlug = request.nextUrl.searchParams.get("league");
  if (!leagueSlug) {
    return NextResponse.json({ error: "league is required" }, { status: 400 });
  }

  const league = await getLeagueBySlug(leagueSlug);
  if (!league) {
    return NextResponse.json({ error: "Unknown league" }, { status: 404 });
  }

  const provider = getSportsProvider(league.sport);
  const standings = await provider.getStandings(leagueSlug);

  return NextResponse.json(
    { league, standings },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=120, stale-while-revalidate=600" } },
  );
}
