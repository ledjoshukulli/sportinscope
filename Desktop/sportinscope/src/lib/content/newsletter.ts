import { isDatabaseConfigured, prisma } from "@/lib/db";

const memorySubscribers = new Set<string>();

export interface SubscribeResult {
  ok: boolean;
  reason?: "invalid" | "duplicate" | "error";
}

/**
 * Stores the subscriber locally (DB or in-memory fallback) and, if
 * NEWSLETTER_PROVIDER is configured, forwards the subscription to the
 * external provider. The site works fully without any provider configured
 * — subscribers are simply captured for later export/integration.
 */
export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const normalized = email.trim().toLowerCase();

  if (isDatabaseConfigured()) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
    if (existing) return { ok: false, reason: "duplicate" };
    await prisma.newsletterSubscriber.create({ data: { email: normalized, status: "PENDING" } });
  } else {
    if (memorySubscribers.has(normalized)) return { ok: false, reason: "duplicate" };
    memorySubscribers.add(normalized);
  }

  await forwardToProvider(normalized);
  return { ok: true };
}

async function forwardToProvider(email: string): Promise<void> {
  const provider = process.env.NEWSLETTER_PROVIDER ?? "none";
  if (provider === "none") return;

  if (provider === "brevo") {
    const apiKey = process.env.NEWSLETTER_API_KEY;
    const listId = process.env.NEWSLETTER_LIST_ID;
    if (!apiKey || !listId) return;
    try {
      await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, listIds: [Number(listId)] }),
      });
    } catch (error) {
      // Newsletter provider outages should never break the subscribe UX —
      // the subscriber is already saved locally above.
      console.error("Newsletter provider forward failed", error);
    }
  }
}
