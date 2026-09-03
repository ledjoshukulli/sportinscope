import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
  path: "/privacy",
});

const LAST_UPDATED = "September 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-neutral max-w-2xl dark:prose-invert">
        <p>
          This Privacy Policy explains how {siteConfig.legalEntityName} (&ldquo;{siteConfig.name}&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and shares information when you visit{" "}
          {siteConfig.url}.
        </p>

        <h2>Information we collect</h2>
        <p>We aim to collect the minimum data necessary to operate the site and understand what readers find useful.</p>
        <ul>
          <li>
            <strong>Newsletter sign-up:</strong> if you subscribe, we store your email address to send you our
            newsletter and to manage unsubscribes.
          </li>
          <li>
            <strong>Anonymous usage signals:</strong> to power our &ldquo;Trending&rdquo; ranking, we record a
            one-way, non-reversible hash derived from your browser&apos;s user-agent and the current date —
            never your IP address or any other personally identifying information — so we can dampen rapid
            duplicate views without identifying individual readers.
          </li>
          <li>
            <strong>Analytics:</strong> if enabled, we use aggregated, privacy-respecting analytics to understand
            traffic patterns (e.g. which articles and sections are most read).
          </li>
          <li>
            <strong>Cookies:</strong> we use a small number of cookies for essential site functionality (such as
            remembering your theme preference) and, where enabled, analytics. See our{" "}
            <a href="/cookies">Cookie Policy</a> for details.
          </li>
        </ul>

        <h2>How we use information</h2>
        <p>
          We use the information above to operate and improve the site, send newsletters to subscribers who
          opted in, rank trending content, and — where advertising is enabled — support the display of
          contextual advertising that keeps {siteConfig.name} free to read.
        </p>

        <h2>Sharing of information</h2>
        <p>
          We do not sell your personal information. We may share limited data with service providers who help
          us operate the site (for example, email delivery for the newsletter, or analytics infrastructure),
          bound by confidentiality and data-protection obligations.
        </p>

        <h2>Your choices</h2>
        <p>
          You can unsubscribe from the newsletter at any time using the link in any email we send. You can
          control cookies through your browser settings; see our <a href="/cookies">Cookie Policy</a> for more
          detail on what a cookie-free experience looks like on this site.
        </p>

        <h2>Data retention</h2>
        <p>
          We retain newsletter subscriber records for as long as your subscription is active, and anonymized
          usage signals only long enough to power trending rankings before they age out.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>{siteConfig.name} is not directed at children under 13, and we do not knowingly collect personal information from them.</p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by updating
          the &ldquo;Last updated&rdquo; date above.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy? Email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
