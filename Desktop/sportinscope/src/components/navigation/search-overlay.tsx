"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Clock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useDebounce } from "@/hooks/use-debounce";
import type { SearchResult } from "@/types";

const RECENT_KEY = "sis:recent-searches";
const MAX_RECENT = 6;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pushRecentSearch(query: string) {
  const current = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
  const next = [query, ...current].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data: SearchResult) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function goToFullResults(q: string) {
    if (!q.trim()) return;
    pushRecentSearch(q.trim());
    onClose();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const hasResults =
    result && (result.articles.length > 0 || result.teams.length > 0 || result.players.length > 0 || result.leagues.length > 0);

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Search SportInScope">
      <div className="px-4 pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToFullResults(query);
          }}
          className="flex items-center gap-2 border-b border-border pb-3"
        >
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search articles, teams, players…"
            aria-label="Search"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </form>

        <div className="max-h-[60vh] overflow-y-auto pt-3">
          {!query && recent.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Recent searches</p>
              <ul className="flex flex-col">
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => goToFullResults(r)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {query && !loading && !hasResults ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;. Try a team, player, or league name.
            </p>
          ) : null}

          {result?.articles.length ? (
            <ResultGroup title="Articles">
              {result.articles.map((a) => (
                <ResultItem key={a.id} href={`/article/${a.slug}`} onSelect={onClose} label={a.title} meta={a.category.name} />
              ))}
            </ResultGroup>
          ) : null}

          {result?.teams.length ? (
            <ResultGroup title="Teams">
              {result.teams.map((t) => (
                <ResultItem key={t.id} href={`/team/${t.slug}`} onSelect={onClose} label={t.name} meta={t.sport} />
              ))}
            </ResultGroup>
          ) : null}

          {result?.players.length ? (
            <ResultGroup title="Players">
              {result.players.map((p) => (
                <ResultItem key={p.id} href={`/player/${p.slug}`} onSelect={onClose} label={p.name} meta={p.position ?? ""} />
              ))}
            </ResultGroup>
          ) : null}

          {result?.leagues.length ? (
            <ResultGroup title="Leagues">
              {result.leagues.map((l) => (
                <ResultItem key={l.id} href={`/league/${l.slug}`} onSelect={onClose} label={l.name} meta={l.country ?? ""} />
              ))}
            </ResultGroup>
          ) : null}

          {query && hasResults ? (
            <button
              type="button"
              onClick={() => goToFullResults(query)}
              className="mt-2 w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-primary hover:bg-muted"
            >
              See all results for &ldquo;{query}&rdquo;
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1 px-2 text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      <ul>{children}</ul>
    </div>
  );
}

function ResultItem({ href, label, meta, onSelect }: { href: string; label: string; meta: string; onSelect: () => void }) {
  return (
    <li>
      <a
        href={href}
        onClick={onSelect}
        className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
      >
        <span className="line-clamp-2">{label}</span>
        {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
      </a>
    </li>
  );
}

export function SearchTriggerHint() {
  return (
    <kbd className="hidden items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-flex">
      /
    </kbd>
  );
}
