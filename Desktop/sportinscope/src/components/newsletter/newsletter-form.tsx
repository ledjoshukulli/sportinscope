"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { newsletterSubscribeSchema, type NewsletterSubscribeInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useNewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterSubscribeInput) {
    setStatus("idle");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return { form, onSubmit, status, message };
}

export function NewsletterInline() {
  const { form, onSubmit, status, message } = useNewsletterForm();

  if (status === "success") {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-success">
        <CheckCircle2 className="h-4 w-4" /> You&apos;re subscribed.
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="footer-newsletter-email"
          type="email"
          placeholder="you@email.com"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register("email")}
        />
        <Button type="submit" size="md" disabled={form.formState.isSubmitting}>
          Subscribe
        </Button>
      </div>
      {form.formState.errors.email ? (
        <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
      ) : message ? (
        <p className="text-xs text-red-500">{message}</p>
      ) : null}
    </form>
  );
}

export function NewsletterBlock({ className }: { className?: string }) {
  const { form, onSubmit, status, message } = useNewsletterForm();

  return (
    <section
      className={cn(
        "rounded-md border border-border bg-surface-raised px-6 py-10 text-center sm:px-10",
        className,
      )}
      aria-labelledby="newsletter-heading"
    >
      <Mail className="mx-auto mb-3 h-8 w-8 text-primary" aria-hidden />
      <h2 id="newsletter-heading" className="font-display text-2xl font-bold tracking-tight">
        Get the biggest stories in your inbox.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        One email a day. Football, NBA, and nothing else. Unsubscribe anytime.
      </p>

      {status === "success" ? (
        <p className="mt-6 flex items-center justify-center gap-2 font-semibold text-success">
          <CheckCircle2 className="h-5 w-5" /> You&apos;re subscribed — welcome to SportInScope.
        </p>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Email address"
            className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...form.register("email")}
          />
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="shrink-0">
            Subscribe
          </Button>
        </form>
      )}
      {form.formState.errors.email ? (
        <p className="mt-2 text-xs text-red-500">{form.formState.errors.email.message}</p>
      ) : message ? (
        <p className="mt-2 text-xs text-red-500">{message}</p>
      ) : null}
    </section>
  );
}
