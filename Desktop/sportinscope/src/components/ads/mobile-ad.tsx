import { AdBanner } from "./ad-banner";
import { cn } from "@/lib/utils";

/**
 * In-flow mobile banner ad, visible only below the `lg` breakpoint. Rendered
 * inline in the page content (not fixed) so it never competes with the
 * fixed bottom `MobileNav` for screen space.
 */
export function MobileAd({ className }: { className?: string }) {
  return (
    <div className={cn("lg:hidden", className)}>
      <AdBanner size="mobile-banner" />
    </div>
  );
}
