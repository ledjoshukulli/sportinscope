import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publishArticleToFacebook } from "@/lib/social/facebook";

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.SYNC_SECRET;
  if (secret && request.headers.get("authorization") === `Bearer ${secret}`) return true;
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/** POST /api/admin/publish-facebook — publish one unshared web article to the Facebook Page. */
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.FACEBOOK_PAGE_ID || !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    return NextResponse.json({ ok: false, error: "Facebook publishing credentials are not configured." }, { status: 503 });
  }

  const article = await prisma.article.findFirst({
    where: { status: "PUBLISHED", facebookPostId: null },
    orderBy: { publishedAt: "asc" },
    select: { id: true, title: true, excerpt: true, slug: true },
  });

  if (!article) return NextResponse.json({ ok: true, posted: false, message: "No unpublished Facebook articles." });

  try {
    const postId = await publishArticleToFacebook(article);
    await prisma.article.update({
      where: { id: article.id },
      data: { facebookPostId: postId, facebookPostedAt: new Date(), facebookPostError: null },
    });
    return NextResponse.json({ ok: true, posted: true, articleId: article.id, postId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Facebook publishing error";
    await prisma.article.update({ where: { id: article.id }, data: { facebookPostError: message.slice(0, 500) } });
    return NextResponse.json({ ok: false, posted: false, articleId: article.id, error: message }, { status: 502 });
  }
}
