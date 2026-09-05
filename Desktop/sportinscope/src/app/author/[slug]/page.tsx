import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getAuthorBySlug } from "@/lib/content/taxonomy";
import { getPublishedArticles } from "@/lib/content/articles";
import { buildMetadata, authorJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArticleCard } from "@/components/articles/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SidebarAd } from "@/components/ads/sidebar-ad";

export const revalidate = 60;

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) {
    return buildMetadata({
      title: "Author not found",
      description: "This author profile could not be found.",
      path: `/author/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${author.name} — Sports Journalist at SportInScope`,
    description: author.bio ?? `Articles, analysis, and sports coverage by ${author.name} on SportInScope.`,
    path: `/author/${author.slug}`,
    image: author.avatarUrl,
  });
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const { items: articles, hasNextPage } = await getPublishedArticles({
    authorSlug: author.slug,
    page: currentPage,
    limit: 12,
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: author.name },
  ];

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <JsonLd data={authorJsonLd(author)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: author.name, href: `/author/${author.slug}` },
        ])}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <header className="flex flex-wrap items-center gap-6 rounded-md border border-border bg-surface p-6">
        {author.avatarUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={author.avatarUrl}
              alt={author.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {author.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{author.name}</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {author.title ?? "Sports Journalist"}
          </p>
          {author.bio ? <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p> : null}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section aria-label={`Articles by ${author.name}`}>
            <SectionHeading title={`Articles by ${author.name}`} />
            {articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No published stories by {author.name} yet.</p>
            )}

            {(currentPage > 1 || hasNextPage) && (
              <div className="mt-8 flex items-center justify-between">
                {currentPage > 1 ? (
                  <a href={`/author/${author.slug}?page=${currentPage - 1}`} className="text-sm font-semibold text-primary hover:underline">
                    Previous
                  </a>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground/50">Previous</span>
                )}
                {hasNextPage ? (
                  <a href={`/author/${author.slug}?page=${currentPage + 1}`} className="text-sm font-semibold text-primary hover:underline">
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
