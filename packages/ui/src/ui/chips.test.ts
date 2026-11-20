import { describe, expect, test } from "bun:test";
import { nodeOf, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { countChip, labelChip, toggleChip } from "./chips";

const visibleTree = (element: unknown) =>
  walk(element).map(({ kind, children, styles, calls, hoverStyles }) => ({
    kind,
    children: children.map((child) => (typeof child === "string" ? child : child.kind)),
    styles,
    calls,
    hoverStyles,
  }));

describe("chips", () => {
  test("a count chip tints its background", () => {
    expect(
      nodeOf(countChip({ id: "b", count: 2, icon: "x.svg", color: "#ff0000", tooltip: "2" })).styles
        .bg,
    ).toBe("#ff00001f");
    const omittedColor = labelChip(t, { id: "l", label: "bug", icon: "tag.svg" });
    const explicitUndefined = labelChip(t, {
      id: "l",
      label: "bug",
      icon: "tag.svg",
      color: undefined,
    });
    expect(visibleTree(omittedColor)).toEqual(visibleTree(explicitUndefined));
    expect(nodeOf(omittedColor).styles).toMatchObject({ h: 18, bg: t.raised, tooltip: "bug" });
  });
});

const INTERACTIVE = ["cursor_pointer", "hover", "on_click"];
const interactive = (element: unknown) =>
  nodeOf(element).calls.filter((call) => INTERACTIVE.includes(call));

describe("toggle chip", () => {
  test("an omitted color matches an explicitly undefined color", () => {
    const omitted = toggleChip(t, { id: "c", label: "bug", applied: false });
    const explicitUndefined = toggleChip(t, {
      id: "c",
      label: "bug",
      applied: false,
      color: undefined,
    });
    expect(visibleTree(omitted)).toEqual(visibleTree(explicitUndefined));
  });
  test("an applied chip fills on raised and toggles", () => {
    let pressed = 0;
    const chip = toggleChip(t, {
      id: "c",
      label: "bug",
      applied: true,
      color: "#ff0000",
      caption: "Remove bug",
      onClick: () => pressed++,
    });
    const node = nodeOf(chip);
    expect(node.styles).toMatchObject({
      h: 18,
      px: 4,
      rounded: 3,
      bg: t.raised,
      text_color: t.foreground,
      tooltip: "Remove bug",
    });
    expect(node.styles.border).toBeUndefined();
    expect(node.hoverStyles).toEqual({ bg: t.hover });
    expect(walk(chip).some((n) => n.styles.size === 8 && n.styles.bg === "#ff0000")).toBe(true);
    node.click!(undefined, undefined);
    expect(pressed).toBe(1);
  });
  test("an unapplied chip is outlined and muted; dim when inert", () => {
    const enabled = nodeOf(
      toggleChip(t, { id: "c", label: "bug", applied: false, color: undefined, onClick: () => {} }),
    );
    expect(enabled.styles).toMatchObject({
      border: 1,
      border_color: t.border,
      text_color: t.muted,
      tooltip: "bug",
    });
    const inert = toggleChip(t, { id: "c", label: "bug", applied: false, color: undefined });
    expect(nodeOf(inert).styles.text_color).toBe(t.dim);
    expect(interactive(inert)).toEqual([]);
    expect(walk(inert).some((n) => n.styles.size === 8)).toBe(false);
  });
  test("a pending chip is inert and trails an ellipsis", () => {
    const chip = toggleChip(t, {
      id: "c",
      label: "bug",
      applied: true,
      pending: true,
      color: undefined,
      onClick: () => {},
    });
    expect(interactive(chip)).toEqual([]);
    expect(texts(chip)).toEqual(["bug …"]);
  });
});
