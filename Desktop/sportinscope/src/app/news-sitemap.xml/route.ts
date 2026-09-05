import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/content/articles";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export async function GET() {
  const { items: articles } = await getPublishedArticles({ limit: 100 });

  // Google News sitemaps include articles from the past 48 hours (or fallback to recent)
  const now = Date.now();
  const twoDaysMs = 48 * 60 * 60 * 1000;
  let newsArticles = articles.filter((a) => {
    const pubTime = new Date(a.publishedAt ?? a.createdAt).getTime();
    return now - pubTime <= twoDaysMs;
  });

  if (newsArticles.length === 0) {
    newsArticles = articles.slice(0, 10);
  }

  const urlEntries = newsArticles
    .map((article) => {
      const pubDate = new Date(article.publishedAt ?? article.createdAt).toISOString();
      const link = `${siteConfig.url}/article/${article.slug}`;

      return `  <url>
    <loc>${link}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteConfig.name}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(newsSitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
