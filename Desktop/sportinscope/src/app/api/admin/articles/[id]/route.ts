import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getArticleById, updateArticle, setArticleStatus, deleteArticle } from "@/lib/content/articles";
import { articleInputSchema, articleStatusSchema } from "@/lib/validations";

/** GET /api/admin/articles/[id] — fetch a single article (any status, full content) for the editor. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ article });
}

/** PATCH /api/admin/articles/[id] — full update, or a lightweight `{ status }` transition. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body && typeof body === "object" && Object.keys(body).length === 1 && "status" in body) {
    const statusParsed = articleStatusSchema.safeParse((body as { status: unknown }).status);
    if (!statusParsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    await setArticleStatus(id, statusParsed.data);
    return NextResponse.json({ ok: true });
  }

  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid article data." }, { status: 400 });
  }

  const article = await updateArticle(id, parsed.data);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ article });
}

/** DELETE /api/admin/articles/[id] */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteArticle(id);
  return NextResponse.json({ ok: true });
}
