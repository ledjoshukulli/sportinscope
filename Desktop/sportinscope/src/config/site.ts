export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "SportInScope",
  tagline: "The Game. In Focus.",
  description:
    "SportInScope is a modern sports publication covering Football and NBA — breaking news, live scores, standings, transfers, and in-depth analysis.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ogImage: "/og-default.png",
  social: {
    twitter: "https://twitter.com/sportinscope",
    facebook: "https://facebook.com/sportinscope",
    instagram: "https://instagram.com/sportinscope",
  },
  legalEntityName: "SportInScope Media",
  contactEmail: "hello@sportinscope.com",
} as const;

export type SiteConfig = typeof siteConfig;
