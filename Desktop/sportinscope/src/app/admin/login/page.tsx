import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/admin/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the SportInScope content management system.",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-raised px-4 py-12">
      <div className="w-full max-w-sm rounded-md border border-border bg-background p-8 shadow-lg">
        <Link href="/" className="mb-6 block font-display text-xl font-extrabold tracking-tight">
          {siteConfig.name}
          <span className="ml-1.5 rounded-sm bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
            CMS
          </span>
        </Link>
        <h1 className="mb-1 text-lg font-bold">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">Manage articles, transfers, and site content.</p>
        <LoginForm />
      </div>
    </div>
  );
}
