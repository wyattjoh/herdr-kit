import { describe, expect, test } from "bun:test";
import { choicesHeight, flyoutTop, MENU, menuMetrics } from "./menu-metrics";

describe("menu metrics", () => {
  test("default to the Tasks panel's Task menu", () => {
    expect(MENU).toEqual({
      width: 220,
      flyoutWidth: 240,
      row: 31,
      padding: 5,
      height: 258,
      inputHeight: 32,
      gap: 2,
      icon: 14,
      visibleRows: 6,
    });
  });
  test("derive the Spec menu's seven-row footprint", () => {
    const spec = menuMetrics({ rows: 7, visibleRows: 4 });
    expect(spec.height).toBe(227);
    expect(choicesHeight(spec, 10)).toBe(4 * 31);
    expect(choicesHeight(spec, 10, 5)).toBe(5 * 31);
  });
  test("keep at least one row, and lift a long flyout inside the parent", () => {
    expect(choicesHeight(MENU, 0)).toBe(31);
    expect(flyoutTop(MENU, 1, 1, false)).toBe(31);
    expect(flyoutTop(MENU, 7, 20, true)).toBe(258 - (10 + 6 * 31 + 32));
  });
});
