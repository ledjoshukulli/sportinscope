"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchOverlay, SearchTriggerHint } from "./search-overlay";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Search className="h-[18px] w-[18px]" />
        <SearchTriggerHint />
      </button>
      <SearchOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
