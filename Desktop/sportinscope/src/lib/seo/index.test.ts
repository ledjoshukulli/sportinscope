import { describe, expect, it } from "vitest";
import { breadcrumbJsonLd, buildMetadata, organizationJsonLd } from "./index";
import { siteConfig } from "@/config/site";

describe("buildMetadata", () => {
  it("builds a canonical URL from the given path", () => {
    const meta = buildMetadata({ title: "Test Title", description: "Test description", path: "/about" });
    expect(meta.alternates?.canonical).toBe(`${siteConfig.url}/about`);
  });

  it("allows indexing by default", () => {
    const meta = buildMetadata({ title: "Test", description: "Desc", path: "/" });
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("disables indexing when noIndex is set", () => {
    const meta = buildMetadata({ title: "Test", description: "Desc", path: "/admin/login", noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("falls back to the site's default OG image when none is provided", () => {
    const meta = buildMetadata({ title: "Test", description: "Desc", path: "/" });
    const images = meta.openGraph?.images as { url: string }[] | undefined;
    expect(images?.[0]?.url).toBe(`${siteConfig.url}${siteConfig.ogImage}`);
  });
});

describe("breadcrumbJsonLd", () => {
  it("produces a schema.org BreadcrumbList with 1-based positions", () => {
    const jsonLd = breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Football", href: "/football" },
    ]);
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(2);
    expect(jsonLd.itemListElement[0]).toMatchObject({ position: 1, name: "Home" });
    expect(jsonLd.itemListElement[1]).toMatchObject({ position: 2, name: "Football" });
  });
});

describe("organizationJsonLd", () => {
  it("includes the site name and url", () => {
    const jsonLd = organizationJsonLd();
    expect(jsonLd.name).toBe(siteConfig.name);
    expect(jsonLd.url).toBe(siteConfig.url);
  });
});
