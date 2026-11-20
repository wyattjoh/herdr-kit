import { describe, expect, test } from "bun:test";
import { byId, nodeOf, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { STATE, TEXT } from "../tokens";
import { THEME as t } from "../test/theme";
import { button } from "./controls";
import { compactStateBlock, errorState, stateBlock, toneLine } from "./states";

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

describe("stateBlock and errorState", () => {
  test("a state block says its title, detail and action", () => {
    const block = stateBlock(t, {
      title: "Nothing",
      detail: "Pick one",
      action: button(t, { id: "go", label: "Go", onClick: () => {} }),
    });
    expect(texts(block)).toEqual(["Nothing", "Pick one", "Go"]);
    expect(nodeOf(block).styles.id).toBeUndefined();
    expect(walk(block).find((node) => node.children.includes("Nothing"))!.styles.text_color).toBe(
      t.foreground,
    );
  });
  test("a state block accepts an id and an error state defaults to danger tone", () => {
    const identified = stateBlock(t, { id: "missing-state", title: "Nothing" });
    const failure = errorState(t, { id: "error-state", title: "Failed" });
    const warning = errorState(t, { title: "Warning", tone: "warning" });
    expect(nodeOf(identified).styles.id).toBe("missing-state");
    expect(byId(failure, "error-state")).toBeDefined();
    expect(walk(failure).find((node) => node.children.includes("Failed"))!.styles.text_color).toBe(
      t.ansi1,
    );
    expect(walk(warning).find((node) => node.children.includes("Warning"))!.styles.text_color).toBe(
      t.ansi3,
    );
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
