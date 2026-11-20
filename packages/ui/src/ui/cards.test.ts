import { describe, expect, test } from "bun:test";
import { byId, nodeOf, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import {
  card,
  cardItem,
  cardRow,
  groupBlock,
  listRow,
  progressBar,
  staticRow,
  statusMark,
} from "./cards";

const INTERACTIVE = ["cursor_pointer", "hover", "on_click"];
const interactive = (element: unknown) =>
  nodeOf(element).calls.filter((call) => INTERACTIVE.includes(call));

describe("listing", () => {
  test("a card is a bordered canvas", () => {
    expect(nodeOf(card(t, "c")).styles).toMatchObject({
      bg: t.canvas,
      border: 1,
      border_color: t.input,
      rounded: 8,
    });
  });
  test("a group folds its body to its rows' height", () => {
    const rows = [
      listRow(t, { id: "r1", title: "One", onClick: () => {} }),
      listRow(t, { id: "r2", title: "Two", onClick: () => {} }),
    ];
    const open = groupBlock(t, "s", {
      id: "g",
      label: "Open",
      tone: "ansi2",
      count: 2,
      rows,
      rowHeight: 34,
      open: true,
      first: true,
      last: true,
      toggle: () => {},
    });
    expect(byId(open, "s-g-body")!.styles).toMatchObject({
      h: 68,
      transition: ["height", { duration: 200, easing: "ease-out" }],
    });
    expect(byId(open, "g-toggle")!.styles).toMatchObject({
      h: 28,
      bg: t.popover,
      border_t: 0,
      rounded_t: 7,
    });
    expect(byId(open, "r2")!.styles.rounded_b).toBe(7);
    const closed = groupBlock(t, "s", {
      id: "g",
      label: "Open",
      tone: "ansi2",
      count: 0,
      rows: [],
      rowHeight: 34,
      open: false,
      first: false,
      last: true,
      toggle: () => {},
    });
    expect(byId(closed, "s-g-body")!.styles.h).toBe(0);
    expect(byId(closed, "g-toggle")!.styles.rounded_b).toBe(7);
  });
  test("a list row shows its key muted and its title", () => {
    const row = listRow(t, { id: "r", label: "#4", title: "Spec", onClick: () => {} });
    expect(texts(row)).toEqual(["#4", "Spec"]);
    expect(nodeOf(row).styles).toMatchObject({ h: 34, px: 10, gap: 7, border_t: 1 });
  });
  test("a progress bar fills done over total", () => {
    const bar = progressBar(t, { done: 1, total: 4 });
    expect(walk(bar).some((n) => n.styles.w === 14 && n.styles.bg === t.ansi2)).toBe(true);
    expect(texts(progressBar(t, { done: 0, total: 0, empty: "No Tasks" }))).toEqual(["No Tasks"]);
  });
});

describe("static rows and first rows", () => {
  test("a card row keeps its pointer, hover and top rule by default", () => {
    const row = nodeOf(cardRow(t, "r"));
    expect(row.calls).toEqual(expect.arrayContaining(["cursor_pointer", "hover", "border_t"]));
    expect(row.styles).toMatchObject({ border_t: 1, border_color: t.border });
    expect(row.styles.rounded_t).toBeUndefined();
    const list = nodeOf(listRow(t, { id: "l", title: "T", onClick: () => {} }));
    expect(list.calls).toEqual(expect.arrayContaining(["cursor_pointer", "hover", "on_click"]));
    expect(list.styles.border_t).toBe(1);
  });
  test("a first row drops its top rule and rounds its hover into the card's corners", () => {
    const row = nodeOf(cardRow(t, "r", t.hover, true));
    expect(row.styles.border_t).toBeUndefined();
    expect(row.styles.rounded_t).toBe(7);
    expect(row.hoverStyles).toEqual({ bg: t.hover });
    const list = nodeOf(listRow(t, { id: "l", title: "T", first: true, onClick: () => {} }));
    expect(list.styles.border_t).toBeUndefined();
  });
  test("a static row and a list row without a handler are inert", () => {
    const row = staticRow(t, "s");
    expect(interactive(row)).toEqual([]);
    expect(nodeOf(row).styles).toMatchObject({ px: 10, gap: 7, border_t: 1 });
    expect(nodeOf(staticRow(t, "s", true)).styles.border_t).toBeUndefined();
    const list = listRow(t, { id: "l", label: "#1", title: "T", tooltip: "tip" });
    expect(interactive(list)).toEqual([]);
    expect(nodeOf(list).click).toBeUndefined();
    expect(nodeOf(list).styles).toMatchObject({ h: 34, tooltip: "tip", border_t: 1 });
    expect(texts(list)).toEqual(["#1", "T"]);
  });
  test("a card item pads its lines and rules off unless first", () => {
    const item = nodeOf(cardItem(t, "c"));
    expect(item.kind).toBe("v_flex");
    expect(item.styles).toMatchObject({ px: 10, py: 8, gap: 4, border_t: 1 });
    expect(interactive(cardItem(t, "c"))).toEqual([]);
    expect(nodeOf(cardItem(t, "c", true)).styles.border_t).toBeUndefined();
  });
  test("a status mark takes an optional tooltip on a wrapper, since an svg can't carry one", () => {
    const bare = nodeOf(statusMark(t, "x.svg", "ansi2"));
    expect(bare.kind).toBe("svg");
    expect(bare.styles).toMatchObject({ asset: "x.svg", size: 14, text_color: t.ansi2 });
    expect(bare.styles.tooltip).toBeUndefined();
    const tipped = nodeOf(statusMark(t, "x.svg", "ansi2", "running · unavailable"));
    expect(tipped.kind).toBe("h_flex");
    expect(tipped.styles).toMatchObject({ flex_none: true, tooltip: "running · unavailable" });
    const glyph = walk(tipped).find((n) => n.kind === "svg")!;
    expect(glyph.styles).toMatchObject({ asset: "x.svg", size: 14, text_color: t.ansi2 });
    expect(glyph.styles.tooltip).toBeUndefined();
  });
});
