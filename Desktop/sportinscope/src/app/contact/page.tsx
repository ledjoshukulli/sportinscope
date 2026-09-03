import type { Metadata } from "next";
import { Mail, Twitter } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Contact Us</h1>
      <p className="max-w-2xl text-muted-foreground">
        Have a tip, a correction, or a partnership inquiry? Reach out — a real person reads every message.
      </p>

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="flex items-center gap-3 rounded-md border border-border bg-surface p-5 hover:border-primary/40"
        >
          <Mail className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">{siteConfig.contactEmail}</p>
          </div>
        </a>
        <a
          href={siteConfig.social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md border border-border bg-surface p-5 hover:border-primary/40"
        >
          <Twitter className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="font-semibold">X (Twitter)</p>
            <p className="text-sm text-muted-foreground">Send us a DM</p>
          </div>
        </a>
      </div>

      <div className="prose prose-neutral max-w-2xl dark:prose-invert">
        <h2>Editorial tips &amp; corrections</h2>
        <p>
          Spotted an error, or have a story lead? Email us with as much detail as you can — sources, links, and
          context all help our editors move quickly.
        </p>
        <h2>Advertising &amp; partnerships</h2>
        <p>
          For media kits, sponsorship, and advertising inquiries, reach out to{" "}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> with &ldquo;Partnerships&rdquo;
          in the subject line.
        </p>
      </div>
    </div>
  );
}
