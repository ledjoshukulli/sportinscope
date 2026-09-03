import { NextResponse, type NextRequest } from "next/server";
import { newsletterSubscribeSchema } from "@/lib/validations";
import { subscribeToNewsletter } from "@/lib/content/newsletter";

/** POST /api/newsletter — subscribe an email. Re-validates with Zod server-side regardless of client-side checks. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = newsletterSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email." }, { status: 400 });
  }

  const result = await subscribeToNewsletter(parsed.data.email);
  if (!result.ok) {
    if (result.reason === "duplicate") {
      return NextResponse.json({ error: "That email is already subscribed." }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
