import { NextResponse, type NextRequest } from "next/server";
import { getTrendingArticles } from "@/lib/content/articles";

/** GET /api/trending?limit= — trending stories by view velocity. */
export async function GET(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 6;

  const articles = await getTrendingArticles(limit);

  return NextResponse.json(
    { articles },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } },
  );
}
