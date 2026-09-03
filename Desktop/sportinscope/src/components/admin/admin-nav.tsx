"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Newspaper, ArrowRightLeft, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/transfers", label: "Transfers", icon: ArrowRightLeft },
];

export function AdminNav({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="font-display text-lg font-extrabold tracking-tight">SportInScope</span>
          <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            CMS
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            target="_blank"
            className="mt-2 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            View site
          </Link>
        </nav>
      </div>

      <div className="border-t border-border px-2 pt-4">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="mb-3 truncate text-xs text-muted-foreground">{user.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}
