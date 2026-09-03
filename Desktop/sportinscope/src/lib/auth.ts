import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { AdminUser } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/db";

const SESSION_COOKIE = "sis_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is not set (or too short). Generate one with `openssl rand -base64 32` and add it to .env.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Verifies admin credentials. Uses the database when configured; otherwise
 * falls back to the single seed admin account defined by SEED_ADMIN_EMAIL /
 * SEED_ADMIN_PASSWORD so the CMS is usable without a database in local
 * development. The fallback path is intentionally disabled once a database
 * is configured, so production never relies on plaintext env comparison.
 */
export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  const normalized = email.trim().toLowerCase();

  if (isDatabaseConfigured()) {
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user || !user.isActive) return null;
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return null;
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  const seedEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedEmail || !seedPassword) return null;
  if (normalized !== seedEmail || password !== seedPassword) return null;
  return { id: "seed-admin", email: seedEmail, name: process.env.SEED_ADMIN_NAME ?? "Site Admin", role: "ADMIN" };
}

export async function createSession(user: AdminUser): Promise<void> {
  const token = await new SignJWT({ sub: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "ADMIN" ? "ADMIN" : "EDITOR",
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAdmin(): Promise<AdminUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
