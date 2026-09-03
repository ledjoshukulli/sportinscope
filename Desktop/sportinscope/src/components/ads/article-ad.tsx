import { AdBanner } from "./ad-banner";
import { cn } from "@/lib/utils";

/** In-article ad unit — meant to be dropped between paragraphs of long-form content. */
export function ArticleAd({ className }: { className?: string }) {
  return <AdBanner size="in-article" className={cn("my-8", className)} />;
}
