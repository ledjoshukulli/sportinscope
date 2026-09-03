"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sis:my-teams";

/**
 * Lightweight "My Teams" personalization. Stored in localStorage only — no
 * account required. The shape (an array of team slugs) is intentionally
 * simple so it can be migrated to a per-user database column later without
 * a breaking change: the same array would just be synced server-side too.
 */
export function useMyTeams() {
  const [teamSlugs, setTeamSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTeamSlugs(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setTeamSlugs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage may be unavailable (private browsing, quota) — fail silently
    }
  }, []);

  const toggleTeam = useCallback(
    (slug: string) => {
      persist(teamSlugs.includes(slug) ? teamSlugs.filter((s) => s !== slug) : [...teamSlugs, slug]);
    },
    [teamSlugs, persist],
  );

  const isFollowing = useCallback((slug: string) => teamSlugs.includes(slug), [teamSlugs]);

  return { teamSlugs, toggleTeam, isFollowing, hydrated };
}
