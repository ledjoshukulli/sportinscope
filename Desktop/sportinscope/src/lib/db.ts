/**
 * Whether a real database connection is configured. When it isn't (e.g.
 * fresh clone, no .env yet, or a preview deploy without a DB attached), the
 * content layer in src/lib/content/* transparently serves the bundled mock
 * data instead — so the whole site renders correctly with zero setup.
 *
 * This check intentionally also treats the literal placeholder value from
 * .env.example as "not configured" so a copy/paste without editing it
 * doesn't attempt (and fail) a real connection.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes("user:password@host")) return false;
  return true;
}

export { prisma } from "./prisma";
import { prisma } from "./prisma";

/**
 * Retries once after reconnecting on "server closed the connection" (P1017).
 * Long-running jobs (e.g. the live-data sync) can sit idle for a while
 * waiting on rate-limited external APIs between DB calls, which is long
 * enough for a pooled Postgres connection (e.g. Supabase's pgbouncer) to get
 * dropped server-side — without this, the whole job crashes outright.
 */
export async function withDbReconnectRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    if (code !== "P1017") throw error;
    await prisma.$connect();
    return fn();
  }
}
