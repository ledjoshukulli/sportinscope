export interface NavItem {
  label: string;
  href: string;
}

/** Desktop primary navigation. */
export const mainNav: NavItem[] = [
  { label: "Football", href: "/football" },
  { label: "NBA", href: "/nba" },
  { label: "Transfers", href: "/transfers" },
  { label: "Scores", href: "/scores" },
  { label: "Standings", href: "/standings" },
  { label: "Analysis", href: "/analysis" },
];

/** Fixed bottom navigation shown only on mobile. */
export const mobileNav: (NavItem & { icon: "home" | "football" | "nba" | "trending" | "search" })[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Football", href: "/football", icon: "football" },
  { label: "NBA", href: "/nba", icon: "nba" },
  { label: "Trending", href: "/trending", icon: "trending" },
  { label: "Search", href: "/search", icon: "search" },
];

export const footerNav = {
  sports: [
    { label: "Football", href: "/football" },
    { label: "NBA", href: "/nba" },
    { label: "Scores", href: "/scores" },
    { label: "Standings", href: "/standings" },
    { label: "Transfers", href: "/transfers" },
    { label: "Analysis", href: "/analysis" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};
