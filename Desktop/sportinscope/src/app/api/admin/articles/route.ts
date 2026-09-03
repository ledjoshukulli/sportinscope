import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminArticles, createArticle } from "@/lib/content/articles";
import { articleInputSchema, articleStatusSchema } from "@/lib/validations";

/** GET /api/admin/articles — paginated listing for the CMS table, including drafts/archived. Requires an admin session. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const statusParam = params.get("status");
  const statusParsed = statusParam ? articleStatusSchema.safeParse(statusParam) : null;
  const page = Number(params.get("page")) || 1;

  const result = await getAdminArticles({
    page,
    limit: 20,
    status: statusParsed?.success ? statusParsed.data : undefined,
    includeDrafts: true,
  });

  return NextResponse.json(result);
}

/** POST /api/admin/articles — create a new article (draft or published). Requires an admin session. */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid article data." }, { status: 400 });
  }

  const article = await createArticle(parsed.data);
  return NextResponse.json({ article }, { status: 201 });
}
