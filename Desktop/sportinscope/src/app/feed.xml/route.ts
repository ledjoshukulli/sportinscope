import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/content/articles";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export async function GET() {
  const { items: articles } = await getPublishedArticles({ limit: 50 });

  const itemsXml = articles
    .map((article) => {
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : new Date(article.createdAt).toUTCString();
      const link = `${siteConfig.url}/article/${article.slug}`;

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${article.category.name}]]></category>
      <author><![CDATA[${article.author.name}]]></author>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} — ${siteConfig.tagline}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
