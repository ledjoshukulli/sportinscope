"use client";

import { useEffect } from "react";

/**
 * Fires a single fire-and-forget POST to record a view once the article
 * detail page mounts on the client. Rendered with no visible output — it
 * exists purely as a side-effect trigger, kept separate from the (server)
 * article page so the page itself can stay a server component.
 */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/articles/${slug}/view`, { method: "POST" }).catch(() => {
      // Best-effort only — a failed view ping should never affect the reader.
    });
  }, [slug]);

  return null;
}
