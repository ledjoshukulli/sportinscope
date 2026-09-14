import type { Sport } from "@/types";

const COMPETITION_IMAGES: Record<string, string[]> = {
  // Champions League
  "champions-league": [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1600&auto=format&fit=crop",
  ],
  // Premier League
  "premier-league": [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518604666864-7423958f766e?q=80&w=1600&auto=format&fit=crop",
  ],
  // La Liga
  "la-liga": [
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
  ],
  // Serie A
  "serie-a": [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1600&auto=format&fit=crop",
  ],
  // Bundesliga
  bundesliga: [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1600&auto=format&fit=crop",
  ],
  // Ligue 1
  "ligue-1": [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1600&auto=format&fit=crop",
  ],
  // NBA
  nba: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop",
  ],
  // Transfers
  transfers: [
    "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
  ],
  // General Fallbacks
  FOOTBALL: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop",
  ],
  OTHER: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
  ],
};

function getFallbackImage(sport: Sport, seed: string, leagueSlug?: string): string {
  let pool: string[] | undefined;
  if (leagueSlug) {
    const cleanSlug = leagueSlug.toLowerCase();
    for (const key of Object.keys(COMPETITION_IMAGES)) {
      if (cleanSlug.includes(key)) {
        pool = COMPETITION_IMAGES[key];
        break;
      }
    }
  }

  const finalPool = (pool && pool.length > 0 ? pool : (COMPETITION_IMAGES[sport] ?? COMPETITION_IMAGES.OTHER)) ?? COMPETITION_IMAGES.FOOTBALL!;
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return finalPool[hash % finalPool.length]!;
}

/**
 * Automatically finds a contextual high-resolution featured image for an article.
 * Uses Unsplash API if UNSPLASH_ACCESS_KEY is set in environment;
 * otherwise gracefully falls back to curated competition-specific HD imagery.
 */
export async function findArticleImage(params: {
  query: string;
  sport: Sport;
  seed: string;
  leagueSlug?: string;
}): Promise<string> {
  const { query, sport, seed, leagueSlug } = params;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  if (unsplashKey && query) {
    try {
      const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&orientation=landscape&per_page=1`;

      const res = await fetch(searchUrl, {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
          "Accept-Version": "v1",
        },
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{ urls?: { regular?: string; full?: string } }>;
        };
        const photoUrl = data.results?.[0]?.urls?.regular;
        if (photoUrl) {
          return photoUrl;
        }
      }
    } catch {
      // Graceful fallback to competition bank on timeout or rate limit
    }
  }

  return getFallbackImage(sport, seed, leagueSlug);
}
