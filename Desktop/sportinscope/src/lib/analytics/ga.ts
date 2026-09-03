/**
 * Minimal, privacy-conscious GA4 helper. Does nothing (and loads nothing)
 * unless NEXT_PUBLIC_GA_ID is set, so local development never pings
 * Google Analytics.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const analyticsEnabled = Boolean(GA_ID);

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!analyticsEnabled) return;
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", name, params);
}
