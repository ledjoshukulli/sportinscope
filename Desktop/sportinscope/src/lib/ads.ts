/**
 * Central ad-monetization flag. Ads are OFF by default (including in local
 * dev) and only render once NEXT_PUBLIC_ADS_ENABLED="true" is set — which in
 * practice should only happen once a real ADSENSE_CLIENT_ID is configured
 * and the site is ready for production traffic.
 */
export const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
export const adsenseClientId = process.env.ADSENSE_CLIENT_ID ?? "";
