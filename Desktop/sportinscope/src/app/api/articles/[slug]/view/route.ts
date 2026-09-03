import { NextResponse, type NextRequest } from "next/server";
import { getArticleBySlug, recordArticleView } from "@/lib/content/articles";
import { hashSessionSignal } from "@/lib/utils";

/**
 * POST /api/articles/[slug]/view — records a privacy-conscious view signal
 * used to power the trending algorithm. No IP address or other PII is ever
 * stored: the "session hash" is a one-way, non-reversible digest derived
 * from the user-agent and a coarse daily bucket, just enough to dampen
 * rapid duplicate views without identifying anyone.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const dayBucket = new Date().toISOString().slice(0, 10);
  const sessionHash = hashSessionSignal(`${userAgent}:${dayBucket}`);

  await recordArticleView(article.id, {
    referrer: request.headers.get("referer") ?? undefined,
    sessionHash,
  });

  return NextResponse.json({ ok: true });
}
