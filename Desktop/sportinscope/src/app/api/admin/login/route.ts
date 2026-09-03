import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/validations";
import { verifyCredentials, createSession } from "@/lib/auth";

/** POST /api/admin/login — verifies credentials and issues the signed session cookie. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid credentials." }, { status: 400 });
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    // Deliberately generic — never confirm whether the email exists.
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ user });
}
