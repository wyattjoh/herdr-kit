import { describe, expect, test } from "bun:test";
import { byId, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { STATE, TEXT } from "../tokens";
import { THEME as t } from "../test/theme";
import { button } from "./controls";
import { compactStateBlock, toneLine } from "./states";

describe("compactStateBlock", () => {
  test("renders a smaller title and detail with an optional action", () => {
    const block = compactStateBlock(t, {
      id: "card-loading",
      title: "Reading repository",
      detail: "This may take a moment.",
      action: button(t, { id: "retry-reading", label: "Retry", onClick: () => {} }),
    });
    expect(byId(block, "card-loading")).toBeDefined();
    expect(texts(block)).toEqual(["Reading repository", "This may take a moment.", "Retry"]);
    expect(
      walk(block).find((node) => node.children.includes("Reading repository"))!.styles,
    ).toMatchObject({
      text_size: TEXT.label,
      text_color: t.foreground,
    });
    expect(
      walk(block).find((node) => node.children.includes("This may take a moment."))!.styles,
    ).toMatchObject({
      text_size: TEXT.caption,
      text_color: t.muted,
    });
    expect(walk(block)[0]!.styles.gap).toBe(STATE.compactGap);
  });
});

describe("toneLine", () => {
  test("uses tone roles and adds a tooltip only for a shortened notice", () => {
    const warning = toneLine(t, "warning", "Cached results", "Showing the previous scan.");
    expect(walk(warning)[0]!.styles).toMatchObject({
      text_size: TEXT.label,
      text_color: t.ansi3,
      tooltip: "Showing the previous scan.",
    });
    expect(walk(warning)[0]!.calls).toContain("truncate");
    expect(texts(warning)).toEqual(["Cached results"]);

    const failure = toneLine(t, "danger", "Could not load");
    expect(walk(failure)[0]!.styles).toMatchObject({
      text_size: TEXT.label,
      text_color: t.ansi1,
    });
    expect(walk(failure)[0]!.calls).not.toContain("truncate");
  });
});
