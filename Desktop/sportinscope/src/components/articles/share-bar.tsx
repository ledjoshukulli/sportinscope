"use client";

import { useState } from "react";
import { Facebook, Link2, Check, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface ShareBarProps {
  path: string;
  title: string;
  className?: string;
}

/** Social share row for article pages — X, Facebook, and copy-link. */
export function ShareBar({ path, title, className }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = `${siteConfig.url}${path}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently no-op.
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Share</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground/70 hover:border-primary hover:text-primary"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground/70 hover:border-primary hover:text-primary"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground/70 hover:border-primary hover:text-primary"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
