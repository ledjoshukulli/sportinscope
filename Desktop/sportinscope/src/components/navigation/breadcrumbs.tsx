import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Accessible breadcrumb trail. The last item is rendered as plain text
 * (the current page) rather than a link. Pair with `breadcrumbJsonLd` from
 * `@/lib/seo` on pages that render this, so the visual trail and the
 * structured data stay in sync.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex items-center gap-1.5 text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link href="/" aria-label="Home" className="inline-flex items-center hover:text-primary">
            <Home className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-foreground">
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight className="h-3.5 w-3.5" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
