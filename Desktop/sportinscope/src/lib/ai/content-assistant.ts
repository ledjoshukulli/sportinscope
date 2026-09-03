/**
 * Forward-looking abstraction for an AI writing assistant inside the admin
 * editor (draft generation, title suggestions, SEO suggestions, summaries,
 * social posts). Intentionally unimplemented for now — the application
 * never requires AI_API_KEY to function. Wire a real implementation here
 * once you choose a provider, without changing any editor UI code.
 */
export interface ContentAssistant {
  suggestTitles(draftText: string): Promise<string[]>;
  suggestSeoDescription(draftText: string): Promise<string>;
  summarize(draftText: string): Promise<string>;
  suggestSocialPost(title: string, excerpt: string): Promise<string>;
}

export function getContentAssistant(): ContentAssistant | null {
  if (!process.env.AI_API_KEY) return null;
  throw new Error(
    "AI_API_KEY is set, but no ContentAssistant implementation is wired up yet. " +
      "Implement the ContentAssistant interface for your chosen provider in this file.",
  );
}
