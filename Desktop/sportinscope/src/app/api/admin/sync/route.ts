import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { syncLiveData } from "@/lib/api/sync-live-data";
import type { Sport } from "@/types";

const SPORT_VALUES: Sport[] = ["FOOTBALL", "NBA", "NFL", "MLB", "F1", "TENNIS", "NHL"];

function parseSports(params: URLSearchParams): Sport[] | null {
  const raw = params.get("sports");
  if (!raw) return null;
  const values = raw
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  const valid = values.filter((value): value is Sport => SPORT_VALUES.includes(value as Sport));
  return valid.length > 0 ? valid : null;
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

/** POST /api/admin/sync — sync teams, players, matches, and standings into Supabase. */
export async function POST(request: NextRequest) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sports = parseSports(request.nextUrl.searchParams);
  const includePlayers = request.nextUrl.searchParams.get("includePlayers") !== "false";

  try {
    const result = await syncLiveData({ sports: sports ?? undefined, includePlayers });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}