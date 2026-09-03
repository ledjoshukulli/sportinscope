import { AdBanner } from "./ad-banner";
import { cn } from "@/lib/utils";

/** Sticky sidebar rectangle ad — used on article and section pages with a right rail. */
export function SidebarAd({ className }: { className?: string }) {
  return (
    // Only sticky at lg: and up, where this actually sits beside a long scrolling
    // column. On mobile the layout collapses to a single column, so a sticky ad
    // here would pin itself mid-screen and appear to "jump" between list items
    // as the rest of the page scrolls past it.
    <div className={cn("lg:sticky lg:top-20", className)}>
      <AdBanner size="rectangle" />
    </div>
  );
}
