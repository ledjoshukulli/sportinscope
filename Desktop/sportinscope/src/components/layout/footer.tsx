import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Container } from "@/components/ui/container";
import { NewsletterInline } from "@/components/newsletter/newsletter-form";
import { siteConfig } from "@/config/site";
import { footerNav } from "@/config/navigation";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface pb-20 lg:pb-0">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-xl font-extrabold tracking-tight">
            Sport<span className="text-primary">InScope</span>
          </p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {siteConfig.tagline}
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{siteConfig.description}</p>
          <div className="mt-5 flex items-center gap-3">
            <SocialLink href={siteConfig.social.twitter} label="X (Twitter)">
              <Twitter className="h-4 w-4" />
            </SocialLink>
            <SocialLink href={siteConfig.social.facebook} label="Facebook">
              <Facebook className="h-4 w-4" />
            </SocialLink>
            <SocialLink href={siteConfig.social.instagram} label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>

        <FooterColumn title="Sports" items={footerNav.sports} />
        <FooterColumn title="Company" items={footerNav.company} />

        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Newsletter</p>
          <NewsletterInline />
        </div>
      </Container>

      <Container className="flex flex-col items-center justify-between gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.legalEntityName}. Not affiliated with any league, team, or
          federation named on this site.
        </p>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-foreground/80 hover:text-primary">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/70 hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
