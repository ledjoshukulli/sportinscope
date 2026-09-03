import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden />
      <h1 className="font-display text-4xl font-extrabold tracking-tight">404</h1>
      <p className="max-w-md text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have moved, or the link might be broken.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
        >
          Back to homepage
        </Link>
        <Link
          href="/search"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted"
        >
          Search the site
        </Link>
      </div>
    </div>
  );
}
