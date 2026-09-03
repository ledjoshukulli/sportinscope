import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy",
  description: `How ${siteConfig.name} uses cookies and similar technologies.`,
  path: "/cookies",
});

const LAST_UPDATED = "September 1, 2026";

export default function CookiesPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Cookie Policy" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-neutral max-w-2xl dark:prose-invert">
        <p>
          This Cookie Policy explains what cookies are, how {siteConfig.name} uses them, and how you can
          control them.
        </p>

        <h2>What is a cookie?</h2>
        <p>
          A cookie is a small text file stored in your browser that lets a site remember information between
          visits, such as a preference or a login state.
        </p>

        <h2>Cookies we use</h2>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Theme preference</td>
              <td>Remembers whether you prefer light or dark mode.</td>
              <td>Persistent, until cleared</td>
            </tr>
            <tr>
              <td>sis_session</td>
              <td>Keeps administrators signed in to the content management system. Not set for regular readers.</td>
              <td>8 hours</td>
            </tr>
            <tr>
              <td>Analytics (optional)</td>
              <td>When analytics is enabled, aggregated, privacy-respecting metrics on traffic and readership.</td>
              <td>Varies by provider</td>
            </tr>
            <tr>
              <td>Advertising (optional)</td>
              <td>When advertising is enabled, cookies set by our ad partners to serve contextual ads.</td>
              <td>Varies by provider</td>
            </tr>
          </tbody>
        </table>

        <h2>Managing cookies</h2>
        <p>
          Most browsers let you block or delete cookies through their settings. Blocking essential cookies (like
          the theme preference) simply means that setting won&apos;t be remembered between visits — it won&apos;t
          prevent you from reading the site.
        </p>

        <h2>Changes to this policy</h2>
        <p>We may update this Cookie Policy as our use of cookies changes. Check back periodically for updates.</p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy? Email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
