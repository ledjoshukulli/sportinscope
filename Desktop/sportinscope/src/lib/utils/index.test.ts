import { describe, expect, it } from "vitest";
import {
  clamp,
  estimateReadingTime,
  formatRelativeTime,
  hashSessionSignal,
  isValidEmail,
  slugify,
  truncate,
} from "./index";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Arsenal FC!")).toBe("arsenal-fc");
  });

  it("strips accents", () => {
    expect(slugify("Kylian Mbappé")).toBe("kylian-mbappe");
  });

  it("collapses whitespace and duplicate hyphens", () => {
    expect(slugify("  Hello   World  ")).toBe("hello-world");
    expect(slugify("a---b")).toBe("a-b");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("-leading and trailing-")).toBe("leading-and-trailing");
  });
});

describe("estimateReadingTime", () => {
  it("returns at least 1 minute for short content", () => {
    expect(estimateReadingTime("just a few words here")).toBe(1);
  });

  it("scales with word count (220 wpm)", () => {
    const words = Array.from({ length: 440 }, () => "word").join(" ");
    expect(estimateReadingTime(words)).toBe(2);
  });
});

describe("formatRelativeTime", () => {
  it('returns "just now" for the current instant', () => {
    expect(formatRelativeTime(new Date())).toBe("just now");
  });

  it("returns minutes for sub-hour offsets", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000);
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours for sub-day offsets", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000);
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days for sub-week offsets", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000);
    expect(formatRelativeTime(twoDaysAgo)).toBe("2d ago");
  });
});

describe("truncate", () => {
  it("leaves short text untouched", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and appends an ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello\u2026");
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("reader@sportinscope.com")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@nouser.com")).toBe(false);
  });
});

describe("hashSessionSignal", () => {
  it("is deterministic for the same input", () => {
    expect(hashSessionSignal("abc:2026-09-02")).toBe(hashSessionSignal("abc:2026-09-02"));
  });

  it("differs for different input", () => {
    expect(hashSessionSignal("abc:2026-09-02")).not.toBe(hashSessionSignal("xyz:2026-09-02"));
  });

  it("never returns a negative-looking value", () => {
    expect(hashSessionSignal("some-user-agent:day-bucket")).not.toMatch(/^-/);
  });
});

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to the minimum", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to the maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
