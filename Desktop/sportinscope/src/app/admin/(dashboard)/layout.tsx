import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Shell for every authenticated /admin page. `middleware.ts` already blocks
 * unauthenticated requests at the edge; calling `requireAdmin()` here too is
 * defense-in-depth (and gives us the current user to render in the nav)
 * rather than something the app depends on for security.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface-raised lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-border bg-background p-4 lg:block">
        <AdminNav user={user} />
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
