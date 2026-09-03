import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeading({ title, href, linkLabel = "View all", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-4 flex items-center justify-between border-b border-border pb-3", className)}>
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
