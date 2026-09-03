"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  src?: string | null;
  alt: string;
  color?: string | null;
  size?: number;
  className?: string;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Team/league crest with a graceful fallback. Sports data (mock or live)
 * often references a logo URL that may not resolve to a real asset — rather
 * than let that break the layout with a broken-image icon, this renders a
 * colored initials badge instead, so the UI degrades gracefully no matter
 * what the underlying provider or seed data supplies.
 */
export function TeamLogo({ src, alt, color, size = 28, className }: TeamLogoProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <span
        style={{ width: size, height: size, backgroundColor: color ?? "#6b7280" }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
          className,
        )}
        aria-hidden
      >
        {initialsFor(alt)}
      </span>
    );
  }

  return (
    // Plain <img>, not next/image: crest assets are small, frequently
    // external/user-provided, and need a runtime onError fallback.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={cn("shrink-0 rounded-full bg-white object-contain p-0.5", className)}
      style={{ width: size, height: size }}
    />
  );
}
