import { describe, expect, test } from "bun:test";
import { byId, nodeOf, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { div } from "gpui-kit";
import { HERDR_ICONS } from "../icons";
import { MENU } from "../menu-metrics";
import { MENU_ROW_STYLE } from "../tokens";
import { menuPanel, menuRow } from "./menu";

describe("menuPanel", () => {
  test("a menu panel stops presses", () => {
    expect(nodeOf(menuPanel(t, 220)).calls.filter((call) => call === "on_mouse_down")).toHaveLength(
      2,
    );
  });
});

describe("menuRow", () => {
  test("matches the compact menu row and draws its optional affordances", () => {
    let pressed = 0;
    let stopped = 0;
    const row = menuRow(t, {
      id: "task-menu-status",
      label: "Status",
      leading: div().id("leading-icon").child("icon"),
      flyout: true,
      checked: true,
      selected: true,
      onClick: () => pressed++,
    });
    const node = nodeOf(row);
    expect(node.styles).toMatchObject({
      id: "task-menu-status",
      h: MENU.row,
      px: MENU_ROW_STYLE.paddingX,
      gap: MENU_ROW_STYLE.gap,
      rounded: MENU_ROW_STYLE.radius,
      text_size: MENU_ROW_STYLE.textSize,
      text_color: t.foreground,
      bg: t.selected,
      selected: true,
      disabled: false,
    });
    expect(node.hoverStyles).toEqual({ bg: t.hover });
    expect(byId(row, "leading-icon")).toBeDefined();
    expect(
      walk(row)
        .filter((child) => child.kind === "svg")
        .map((child) => child.styles.asset),
    ).toEqual([HERDR_ICONS.chevronRight, HERDR_ICONS.check]);
    node.click!(undefined, { stop_propagation: () => stopped++ } as never);
    expect(pressed).toBe(1);
    expect(stopped).toBe(1);
  });

  test("a disabled row stays inert and dimmed", () => {
    const row = nodeOf(
      menuRow(t, {
        id: "task-menu-locked",
        label: "Unavailable",
        disabled: true,
        onClick: () => {},
      }),
    );
    expect(row.styles).toMatchObject({ text_color: t.dim, disabled: true });
    expect(row.calls).not.toContain("cursor_pointer");
    expect(row.hoverStyles).toEqual({});
    expect(row.click).toBeUndefined();
  });

  test("a row without a handler is inert", () => {
    const row = nodeOf(menuRow(t, { id: "menu-note", label: "Note" }));
    expect(row.styles).toMatchObject({ text_color: t.dim, disabled: true });
    expect(row.click).toBeUndefined();
  });
});
