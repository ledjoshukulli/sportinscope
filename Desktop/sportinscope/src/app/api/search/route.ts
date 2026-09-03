import { NextResponse, type NextRequest } from "next/server";
import { searchArticles } from "@/lib/content/articles";
import { getAllTeams } from "@/lib/content/teams";
import { getAllPlayers } from "@/lib/content/players";
import { getAllLeagues } from "@/lib/content/leagues";
import { searchQuerySchema } from "@/lib/validations";
import type { SearchResult } from "@/types";

export const dynamic = "force-dynamic";

/** GET /api/search?q=... — cross-entity search used by the header search overlay and /search page. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const parsed = searchQuerySchema.safeParse({ q });
  if (!parsed.success) {
    return NextResponse.json<SearchResult>({ articles: [], teams: [], players: [], leagues: [] });
  }

  const query = parsed.data.q.toLowerCase();
  const [articles, teams, players, leagues] = await Promise.all([
    searchArticles(query, 6),
    getAllTeams(),
    getAllPlayers(),
    getAllLeagues(),
  ]);

  const result: SearchResult = {
    articles,
    teams: teams.filter((t) => t.name.toLowerCase().includes(query)).slice(0, 6),
    players: players.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 6),
    leagues: leagues.filter((l) => l.name.toLowerCase().includes(query)).slice(0, 6),
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
