import { siteConfig } from "@/config/site";

interface FacebookPublishInput {
  title: string;
  excerpt: string;
  slug: string;
}

interface FacebookPublishResponse {
  id?: string;
  post_id?: string;
  error?: { message?: string };
}

export async function publishArticleToFacebook(input: FacebookPublishInput): Promise<string> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) throw new Error("Facebook publishing credentials are not configured.");

  const articleUrl = `${siteConfig.url.replace(/\/$/, "")}/article/${input.slug}`;
  const message = `${input.title}\n\n${input.excerpt}\n\nRead more: ${articleUrl}`;
  const response = await fetch(`https://graph.facebook.com/v22.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, link: articleUrl, access_token: accessToken }),
  });

  const data = (await response.json()) as FacebookPublishResponse;
  if (!response.ok || data.error || !(data.id || data.post_id)) {
    throw new Error(data.error?.message ?? `Facebook publish failed: ${response.status} ${response.statusText}`);
  }

  return data.id ?? data.post_id!;
}
