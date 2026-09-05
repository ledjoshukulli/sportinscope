import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTagBySlug } from "@/lib/content/taxonomy";
import { getPublishedArticles } from "@/lib/content/articles";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SidebarAd } from "@/components/ads/sidebar-ad";

export const revalidate = 60;

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) {
    return buildMetadata({
      title: "Tag not found",
      description: "This tag topic could not be found.",
      path: `/tag/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${tag.name} — Sports News & Coverage`,
    description: `Latest sports news, stories, and analysis tagged under ${tag.name} on SportInScope.`,
    path: `/tag/${tag.slug}`,
  });
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const { items: articles, hasNextPage } = await getPublishedArticles({
    tagSlug: tag.slug,
    page: currentPage,
    limit: 12,
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: `Tag: ${tag.name}` },
  ];

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: tag.name, href: `/tag/${tag.slug}` },
        ])}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tag: #{tag.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Articles and stories filed under #{tag.name}.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section aria-label="Tagged articles">
            <SectionHeading title="Latest Stories" />
            {articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No stories tagged with #{tag.name} yet.</p>
            )}

            {(currentPage > 1 || hasNextPage) && (
              <div className="mt-8 flex items-center justify-between">
                {currentPage > 1 ? (
                  <a href={`/tag/${tag.slug}?page=${currentPage - 1}`} className="text-sm font-semibold text-primary hover:underline">
                    Previous
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground/50">Previous</span>
                )}
                {hasNextPage ? (
                  <a href={`/tag/${tag.slug}?page=${currentPage + 1}`} className="text-sm font-semibold text-primary hover:underline">
                    Next
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground/50">Next</span>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <SidebarAd />
        </aside>
      </div>
    </div>
  );
}
