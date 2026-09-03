import { ArticleCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
