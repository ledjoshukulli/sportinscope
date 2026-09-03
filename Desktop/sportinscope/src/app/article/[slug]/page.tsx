import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/content/articles";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleHero } from "@/components/articles/article-hero";
import { RelatedArticles } from "@/components/articles/related-articles";
import { ArticleAd } from "@/components/ads/article-ad";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { MobileAd } from "@/components/ads/mobile-ad";
import { ViewTracker } from "@/components/articles/view-tracker";
import { NewsletterInline } from "@/components/newsletter/newsletter-form";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return buildMetadata({ title: "Article not found", description: "This article could not be found.", path: `/article/${slug}`, noIndex: true });
  }

  return buildMetadata({
    title: article.seoTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt,
    path: `/article/${article.slug}`,
    image: article.featuredImage,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  });
}

/** Split article body into paragraphs so an in-article ad can be dropped roughly halfway through. */
function splitContent(content: string): { first: string; second: string } {
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);
  const mid = Math.ceil(paragraphs.length / 2);
  return {
    first: paragraphs.slice(0, mid).join("\n\n"),
    second: paragraphs.slice(mid).join("\n\n"),
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const related = await getRelatedArticles(article, 4);
  const { first, second } = splitContent(article.content);

  const breadcrumbItems = [
    { label: article.sport === "FOOTBALL" ? "Football" : "NBA", href: article.sport === "FOOTBALL" ? "/football" : "/nba" },
    { label: article.category.name },
  ];

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <ViewTracker slug={article.slug} />
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems.map((i) => ({ name: i.label, href: i.href ?? `/article/${article.slug}` })))} />

      <Breadcrumbs items={[...breadcrumbItems, { label: article.title }]} />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <article className="flex flex-col gap-6">
          <ArticleHero article={article} />

          <div
            className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: paragraphsToHtml(first) }}
          />

          <ArticleAd />
          <MobileAd />

          {second ? (
            <div
              className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: paragraphsToHtml(second) }}
            />
          ) : null}

          <div className="rounded-md border border-border bg-surface-raised p-6">
            <NewsletterInline />
          </div>
        </article>

        <aside className="flex flex-col gap-6">
          <SidebarAd />
        </aside>
      </div>

      <RelatedArticles articles={related} />
    </div>
  );
}

/** Minimal, dependency-free paragraph-to-HTML conversion for mock/plain-text article bodies. */
function paragraphsToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
