import { describe, expect, test } from "bun:test";
import { nodeOf, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { button, togglePill } from "./controls";

const INTERACTIVE = ["cursor_pointer", "hover", "on_click"];
const interactive = (element: unknown) =>
  nodeOf(element).calls.filter((call) => INTERACTIVE.includes(call));

describe("button", () => {
  test("draws Herdr's panel button and runs its handler", () => {
    let pressed = 0;
    const node = nodeOf(
      button(t, { id: "follow", label: "Follow", icon: "i.svg", onClick: () => pressed++ }),
    );
    expect(node.styles).toMatchObject({
      id: "follow",
      h: 26,
      px: 8,
      gap: 5,
      rounded: 6,
      text_size: 12,
      bg: t.chrome,
      text_color: t.muted,
    });
    expect(node.hoverStyles).toEqual({ bg: t.hover });
    expect(texts(node)).toEqual(["Follow"]);
    expect(node.children).toContain("Follow");
    expect(node.calls).toContain("flex_none");
    node.click!(undefined, undefined);
    expect(pressed).toBe(1);
  });
  test("an icon-only button tooltips its label; an inert one dims", () => {
    const node = nodeOf(button(t, { id: "pin", label: "Pin", icon: "p.svg", labelled: false }));
    expect(node.styles).toMatchObject({ tooltip: "Pin", text_color: t.dim });
    expect(node.click).toBeUndefined();
    expect(texts(node)).toEqual([]);
  });
  test("an active button draws its icon in the accent", () => {
    const node = nodeOf(
      button(t, { id: "pin", label: "Pinned", icon: "p.svg", active: true, onClick: () => {} }),
    );
    const glyph = walk(node).find((n) => n.kind === "svg")!;
    expect(glyph.styles.text_color).toBe(t.accent);
    expect(glyph.styles.spin).toBeUndefined();
  });
  test("a button can spin its icon and opt into a shrinking ellipsized label", () => {
    const node = nodeOf(
      button(t, {
        id: "refresh",
        label: "A very long refresh label",
        icon: "refresh.svg",
        spin: 1000,
        truncateLabel: true,
      }),
    );
    const glyph = walk(node).find((n) => n.kind === "svg")!;
    const label = walk(node).find((n) => n.kind === "div")!;
    expect(glyph.styles.spin).toBe(1000);
    expect(node.calls).toContain("min_w_0");
    expect(node.calls).not.toContain("flex_none");
    expect(label.calls).toEqual(expect.arrayContaining(["flex_1", "min_w_0", "truncate"]));
    expect(texts(label)).toEqual(["A very long refresh label"]);
  });
});

describe("toggle pill", () => {
  test("draws the panel button's metrics and lights while shown", () => {
    let pressed = 0;
    const unlit = togglePill(t, {
      id: "p",
      label: "CI",
      icon: "i.svg",
      lit: false,
      tooltip: "CI passing",
      onClick: () => pressed++,
    });
    expect(nodeOf(unlit).styles).toMatchObject({
      id: "p",
      h: 26,
      px: 8,
      gap: 5,
      rounded: 6,
      text_size: 12,
      bg: t.chrome,
      text_color: t.muted,
      tooltip: "CI passing",
    });
    expect(nodeOf(unlit).hoverStyles).toEqual({ bg: t.hover });
    expect(walk(unlit).find((node) => node.kind === "svg")!.styles).toMatchObject({
      asset: "i.svg",
      size: 14,
    });
    expect(texts(unlit)).toEqual(["CI"]);
    nodeOf(unlit).click!(undefined, undefined);
    expect(pressed).toBe(1);
    const lit = nodeOf(togglePill(t, { id: "p", label: "CI", lit: true, onClick: () => {} }));
    expect(lit.styles).toMatchObject({ bg: t.selected, text_color: t.foreground });
  });
  test("an inert pill dims, with no pointer or hover", () => {
    const pill = togglePill(t, { id: "p", label: "CI", lit: true });
    expect(nodeOf(pill).styles).toMatchObject({ bg: t.selected, text_color: t.dim });
    expect(interactive(pill)).toEqual([]);
  });
});
