import { NextResponse, type NextRequest } from "next/server";
import { getPublishedArticles } from "@/lib/content/articles";
import { paginationSchema, sportSchema } from "@/lib/validations";

/** GET /api/articles?sport=&category=&page=&limit= — paginated published article listing. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const pagination = paginationSchema.safeParse({
    page: params.get("page") ?? undefined,
    limit: params.get("limit") ?? undefined,
  });
  const sportParsed = sportSchema.safeParse(params.get("sport"));

  const result = await getPublishedArticles({
    page: pagination.success ? pagination.data.page : 1,
    limit: pagination.success ? pagination.data.limit : 12,
    sport: sportParsed.success ? sportParsed.data : undefined,
    categorySlug: params.get("category") ?? undefined,
    teamSlug: params.get("team") ?? undefined,
    tagSlug: params.get("tag") ?? undefined,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
  });
}
