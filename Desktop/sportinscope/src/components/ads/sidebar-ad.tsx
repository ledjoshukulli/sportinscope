import { AdBanner } from "./ad-banner";
import { cn } from "@/lib/utils";

/** Sticky sidebar rectangle ad — used on article and section pages with a right rail. */
export function SidebarAd({ className }: { className?: string }) {
  return (
    <div className={cn("sticky top-20", className)}>
      <AdBanner size="rectangle" />
    </div>
  );
}
