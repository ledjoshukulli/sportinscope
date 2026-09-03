"use client";

import { useEffect, useId, useRef } from "react";
import { adsEnabled, adsenseClientId } from "@/lib/ads";
import { cn } from "@/lib/utils";

export type AdSlotSize = "leaderboard" | "in-article" | "rectangle" | "mobile-banner";

const SLOT_DIMENSIONS: Record<AdSlotSize, { minHeight: number; label: string }> = {
  leaderboard: { minHeight: 90, label: "728×90" },
  "in-article": { minHeight: 250, label: "In-article" },
  rectangle: { minHeight: 250, label: "300×250" },
  "mobile-banner": { minHeight: 50, label: "320×50" },
};

interface AdBannerProps {
  size: AdSlotSize;
  slotId?: string;
  className?: string;
}

/**
 * Generic ad placement. Always reserves the slot's minimum height — even
 * when disabled or rendering a placeholder — so ads never introduce
 * cumulative layout shift once they're switched on in production.
 *
 * When `NEXT_PUBLIC_ADS_ENABLED` is false (the default, including local
 * dev), this renders an inert, clearly-labelled placeholder instead of
 * calling out to AdSense.
 */
export function AdBanner({ size, slotId, className }: AdBannerProps) {
  const { minHeight, label } = SLOT_DIMENSIONS[size];
  const insRef = useRef<HTMLModElement>(null);
  const reactId = useId();
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!adsEnabled || !adsenseClientId) return;
    if (pushedRef.current) return;
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ?? [];
      adsbygoogle.push({});
      (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle = adsbygoogle;
      pushedRef.current = true;
    } catch {
      // AdSense script not loaded yet or blocked — fail silently, never break the page.
    }
  }, []);

  if (!adsEnabled || !adsenseClientId) {
    return (
      <div
        role="complementary"
        aria-label="Advertisement placeholder"
        style={{ minHeight }}
        className={cn(
          "flex w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
          className,
        )}
      >
        Advertisement · {label}
      </div>
    );
  }

  return (
    <div style={{ minHeight }} className={cn("w-full overflow-hidden", className)}>
      <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Advertisement
      </span>
      <ins
        ref={insRef}
        id={slotId ?? `ad-${reactId}`}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
