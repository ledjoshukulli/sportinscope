/**
 * Minimal OpenAI chat-completions client used to draft data-driven articles.
 * Intentionally separate from content-assistant.ts (which is for in-editor
 * suggestions on human-written drafts) — this one generates full drafts
 * from structured sports data with no human text as input.
 */
export interface GeneratedArticleContent {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  tags: string[];
}

const BASE_URL = process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1";
const MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";

export async function generateArticleFromPrompt(systemPrompt: string, userPrompt: string): Promise<GeneratedArticleContent> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is not set.");
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(raw) as Partial<GeneratedArticleContent>;
  if (!parsed.title || !parsed.excerpt || !parsed.content) {
    throw new Error("OpenAI response was missing title/excerpt/content.");
  }

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    seoTitle: parsed.seoTitle || parsed.title,
    metaDescription: parsed.metaDescription || parsed.excerpt,
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0) : [],
  };
}
