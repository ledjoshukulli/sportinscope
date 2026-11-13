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
          through automated match summaries, standings updates, and attributed news reports. Our coverage
          depends on the data available from our sports-data integrations.
        </p>
        <p>
          Articles credited to SportInScope AI Desk are generated with AI and published automatically,
          without human review before publication. These summaries are not eyewitness reporting.
          Automated text and third-party data can contain errors, and a final score alone cannot explain
          tactics, player performance, or why a team won.
        </p>
        <p>
          New automated articles include reporting notes identifying the available data or underlying
          report. Historical results shown for context may be an incomplete sample. Stock images are
          illustrative and should not be taken as photographs of the reported match.
        </p>
        <p>
          Have a tip, correction, or partnership inquiry?{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
      <div className="prose prose-neutral max-w-2xl dark:prose-invert">
        <h2>Sources and limitations</h2>
        <p>
          Football results and tables use football-data.org; NBA results use balldontlie.
          NBA conference standings use ESPN&apos;s publicly accessible, unofficial standings feed.
          We do not substitute demo
          tables for unavailable live data in production. News summaries attribute the underlying
          publisher and do not imply that we independently verified its full report.
        </p>
        <h2>Corrections</h2>
        <p>
          To report an error, email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
          with the article URL, the disputed statement, and supporting sources. Do not rely on automated
          summaries as the sole source for consequential decisions.
        </p>
      </div>
    </div>
  );
}
