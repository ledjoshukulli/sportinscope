import type { Sport } from "@/types";

export interface SportMeta {
  key: Sport;
  label: string;
  slug: string;
  color: string;
  active: boolean;
  leagues?: { name: string; slug: string }[];
}

/**
 * Central registry of every sport the platform knows about. Adding a new
 * sport later (NFL, MLB, F1, Tennis, NHL) means adding one entry here plus a
 * provider in lib/api/providers — no UI restructuring required.
 */
export const sportsRegistry: Record<Sport, SportMeta> = {
  FOOTBALL: {
    key: "FOOTBALL",
    label: "Football",
    slug: "football",
    color: "#22c55e",
    active: true,
    leagues: [
      { name: "Premier League", slug: "premier-league" },
      { name: "Champions League", slug: "champions-league" },
      { name: "La Liga", slug: "la-liga" },
      { name: "Serie A", slug: "serie-a" },
      { name: "Bundesliga", slug: "bundesliga" },
    ],
  },
  NBA: {
    key: "NBA",
    label: "NBA",
    slug: "nba",
    color: "#f8501a",
    active: true,
    leagues: [{ name: "NBA", slug: "nba" }],
  },
  NFL: { key: "NFL", label: "NFL", slug: "nfl", color: "#6b7280", active: false },
  MLB: { key: "MLB", label: "MLB", slug: "mlb", color: "#6b7280", active: false },
  F1: { key: "F1", label: "F1", slug: "f1", color: "#6b7280", active: false },
  TENNIS: { key: "TENNIS", label: "Tennis", slug: "tennis", color: "#6b7280", active: false },
  NHL: { key: "NHL", label: "NHL", slug: "nhl", color: "#6b7280", active: false },
};

export const activeSports = Object.values(sportsRegistry).filter((s) => s.active);
