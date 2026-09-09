"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { GA_ID } from "@/lib/analytics/ga";

const STORAGE_KEY = "sis:cookie-consent";
const OPEN_EVENT = "sis:open-cookie-settings";
type ConsentChoice = "accepted" | "rejected";

export function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setChoice(window.localStorage.getItem(STORAGE_KEY) as ConsentChoice | null);
    const openSettings = () => setIsOpen(true);
    window.addEventListener(OPEN_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_EVENT, openSettings);
  }, []);

  function saveChoice(next: ConsentChoice) {
    window.localStorage.setItem(STORAGE_KEY, next);
    setChoice(next);
    setIsOpen(false);
  }

  const analyticsAllowed = choice === "accepted";

  return (
    <>
      {analyticsAllowed ? <OptionalAnalytics /> : null}
      {choice === null || isOpen ? (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          aria-describedby="cookie-consent-description"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-md border border-border bg-surface p-5 shadow-lg"
        >
          <h2 className="font-display text-lg font-bold">Cookie preferences</h2>
          <p id="cookie-consent-description" className="mt-2 text-sm text-muted-foreground">
            We use optional analytics to understand readership and improve SportInScope. Essential cookies keep the
            site working and remember your preferences.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveChoice("accepted")}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Accept optional cookies
            </button>
            <button
              type="button"
              onClick={() => saveChoice("rejected")}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold"
            >
              Reject optional cookies
            </button>
            {choice !== null ? (
              <button type="button" onClick={() => setIsOpen(false)} className="px-2 py-2 text-sm font-semibold">
                Close
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-40 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold shadow"
        >
          Cookie settings
        </button>
      )}
    </>
  );
}

function OptionalAnalytics() {
  return (
    <>
      <Analytics />
      {GA_ID ? <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" /> : null}
      {GA_ID ? (
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `}
        </Script>
      ) : null}
    </>
  );
}

export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="text-left hover:text-foreground"
    >
      Cookie settings
    </button>
  );
}
