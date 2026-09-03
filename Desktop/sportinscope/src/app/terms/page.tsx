import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: `The terms governing your use of ${siteConfig.name}.`,
  path: "/terms",
});

const LAST_UPDATED = "September 1, 2026";

export default function TermsPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-neutral max-w-2xl dark:prose-invert">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of {siteConfig.url}, operated
          by {siteConfig.legalEntityName}. By using the site, you agree to these Terms.
        </p>

        <h2>Use of the site</h2>
        <p>
          You may access and read {siteConfig.name} for personal, non-commercial use. You agree not to scrape,
          republish, or redistribute our content at scale, attempt to disrupt the site, or use it for any
          unlawful purpose.
        </p>

        <h2>Content &amp; accuracy</h2>
        <p>
          We strive for accuracy in scores, standings, transfer reporting, and news coverage, but sports
          information changes quickly and occasionally sources conflict. Content is provided &ldquo;as is&rdquo;
          without warranty of completeness or real-time accuracy, and should not be relied upon for wagering or
          other decisions with financial consequences.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Unless otherwise noted, articles, graphics, and the {siteConfig.name} name and logo are the property of{" "}
          {siteConfig.legalEntityName}. Team names, league names, and player likenesses referenced on this site
          belong to their respective owners; {siteConfig.name} is not affiliated with, endorsed by, or
          sponsored by any league, team, or federation mentioned on the site.
        </p>

        <h2>Third-party links</h2>
        <p>
          Our site may link to third-party websites (including source articles and social platforms). We are
          not responsible for the content or practices of third-party sites.
        </p>

        <h2>Advertising</h2>
        <p>
          Where enabled, {siteConfig.name} displays advertising to support free access to our journalism.
          Advertisements are clearly distinguished from editorial content, and advertisers have no influence
          over our editorial coverage.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.legalEntityName} shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the site.
        </p>

        <h2>Changes to these Terms</h2>
        <p>We may revise these Terms from time to time. Continued use of the site after changes take effect constitutes acceptance of the revised Terms.</p>

        <h2>Contact us</h2>
        <p>
          Questions about these Terms? Email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
