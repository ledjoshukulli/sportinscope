/**
 * Real sports news headlines via NewsAPI.org, used to seed "viral news"
 * article drafts. Optional — when NEWS_API_KEY isn't set, callers get an
 * empty list and that generation step is silently skipped (same pattern as
 * the football/NBA score providers).
 */
export interface ViralHeadline {
  title: string;
  description: string | null;
  url: string;
  sourceName: string;
  publishedAt: string;
}

const BASE_URL = process.env.NEWS_API_BASE_URL ?? "https://newsapi.org/v2";

export async function getViralSportsHeadlines(limit = 5): Promise<ViralHeadline[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const query = encodeURIComponent("football OR soccer OR NBA OR basketball transfer OR match");
  const res = await fetch(
    `${BASE_URL}/everything?q=${query}&sortBy=popularity&language=en&pageSize=${limit}`,
    { headers: { "X-Api-Key": apiKey } },
  );
  if (!res.ok) {
    throw new Error(`NewsAPI request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    articles?: { title: string; description: string | null; url: string; source?: { name?: string }; publishedAt: string }[];
  };

  return (data.articles ?? []).map((a) => ({
    title: a.title,
    description: a.description ?? null,
    url: a.url,
    sourceName: a.source?.name ?? "Unknown source",
    publishedAt: a.publishedAt,
  }));
}
