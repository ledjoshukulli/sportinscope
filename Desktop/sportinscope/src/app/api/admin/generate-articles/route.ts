import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { autoGenerateArticles } from "@/lib/ai/auto-generate-articles";
import { prisma } from "@/lib/db";
import type { Sport } from "@/types";

const SPORT_VALUES: Sport[] = ["FOOTBALL", "NBA", "NFL", "MLB", "F1", "TENNIS", "NHL"];

function parseSports(params: URLSearchParams): Sport[] | undefined {
  const raw = params.get("sports");
  if (!raw) return undefined;
  const sports = raw
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value): value is Sport => SPORT_VALUES.includes(value as Sport));
  return sports.length > 0 ? sports : undefined;
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.SYNC_SECRET;
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader === `Bearer ${secret}`) return true;

  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/** POST /api/admin/generate-articles — publish selected recent match articles. */
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sports = parseSports(request.nextUrl.searchParams);
  // Cron runs every few minutes; a short window prevents replaying a large
  // historical backlog and keeps Football within the scheduler timeout.
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000);

  try {
    const matches = await prisma.match.findMany({
      where: {
        status: "FINISHED",
        startTime: { gte: since },
        ...(sports ? { league: { sport: { in: sports } } } : {}),
      },
      select: { id: true },
    });

    let articlesGenerated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process one candidate at a time; at most one Groq request runs per cron call.
    for (const match of matches) {
      const result = await autoGenerateArticles({
        finishedMatchIds: [match.id],
        leagueIds: [],
        mode: "matches",
      });
      articlesGenerated += result.articlesGenerated;
      skipped += result.skipped;
      errors.push(...result.errors);
      if (result.articlesGenerated > 0) break;
    }

    return NextResponse.json({
      ok: true,
      result: { articlesGenerated, skipped, errors },
      matchesConsidered: matches.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown article generation error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
