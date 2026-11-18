import { expect, test } from "bun:test";
import { TITLE, TONES, toneMap } from "./tokens";

test("the title's line box is gpui's default line height", () => {
  expect(TITLE.lineHeight).toBe(24);
});

test("toneMap maps a domain's states to theme roles", () => {
  const ci = toneMap({ queued: "neutral", running: "active", passed: "success", failed: "danger" });
  expect(ci("running")).toBe(TONES.active);
  expect(ci("failed")).toBe("ansi1");
});
