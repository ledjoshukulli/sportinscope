import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description: `About ${siteConfig.name} — ${siteConfig.description}`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "About" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">About {siteConfig.name}</h1>

      <div className="prose prose-neutral max-w-2xl dark:prose-invert">
        <p>
          {siteConfig.name} — {siteConfig.tagline} — is a digital sports publication covering football and the NBA
          with the depth of a beat reporter and the speed of a wire service. We cover breaking transfer news,
          live scores, league standings, and long-form tactical analysis across the sports our readers care about
          most.
        </p>
        <p>
          Our newsroom is built around a simple idea: readers deserve context, not just headlines. Every article
          is written or edited by a dedicated sports journalist, and every score and standing is sourced from
          the same data pipeline that powers our live coverage — so what you read matches what&apos;s actually
          happening on the pitch or the court.
        </p>
        <p>
          {siteConfig.name} currently focuses on football and the NBA, with NFL, MLB, Formula 1, tennis, and NHL
          coverage planned as the publication grows.
        </p>
        <p>
          Have a tip, correction, or partnership inquiry?{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
