import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTransfers, createTransfer } from "@/lib/content/transfers";
import { transferInputSchema } from "@/lib/validations";

/** GET /api/admin/transfers — full transfer list for the CMS transfers tab. */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transfers = await getTransfers();
  return NextResponse.json({ transfers });
}

/** POST /api/admin/transfers — log a new transfer rumor/report. */
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

  const parsed = transferInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid transfer data." }, { status: 400 });
  }

  const transfer = await createTransfer(parsed.data);
  return NextResponse.json({ transfer }, { status: 201 });
}
