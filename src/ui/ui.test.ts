import { describe, expect, test } from "bun:test";
import { byId, nodeOf, texts, walk } from "../test/renderer";
import { THEME as t } from "../test/theme";
import { button } from "./controls";
import { crumb, crumbBand, crumbPicker, titleRow } from "./crumbs";
import { card, groupBlock, listRow, progressBar } from "./cards";
import { countChip, labelChip } from "./chips";
import { tabBar } from "./tabs";
import { panelFrame, toolRow, topBar } from "./frame";
import { stateBlock } from "./states";
import { documentCard } from "./document";
import { menuPanel } from "./menu";
import { paneScrollRegion } from "./scroll";
import { stopPress } from "./theme";

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
      bg: "#chrome",
      text_color: "#muted",
    });
    expect(node.hoverStyles).toEqual({ bg: "#hover" });
    expect(texts(node)).toEqual(["Follow"]);
    node.click!(undefined, undefined);
    expect(pressed).toBe(1);
  });
  test("an icon-only button tooltips its label; an inert one dims", () => {
    const node = nodeOf(button(t, { id: "pin", label: "Pin", icon: "p.svg", labelled: false }));
    expect(node.styles).toMatchObject({ tooltip: "Pin", text_color: "#dim" });
    expect(node.click).toBeUndefined();
    expect(texts(node)).toEqual([]);
  });
  test("an active button draws its icon in the accent", () => {
    const node = nodeOf(
      button(t, { id: "pin", label: "Pinned", icon: "p.svg", active: true, onClick: () => {} }),
    );
    expect(walk(node).find((n) => n.kind === "svg")!.styles.text_color).toBe("#accent");
  });
});

describe("chrome", () => {
  test("a pane frame fills its block; a float takes its width", () => {
    expect(nodeOf(panelFrame(t, "root", undefined)).styles).toMatchObject({
      size_full: true,
      bg: "#surface",
      rounded_t: 9,
    });
    expect(nodeOf(panelFrame(t, "root", 360)).styles).toMatchObject({ w: 360 });
  });
  test("a floating top bar reaches over Herdr's frame strip", () => {
    const bar = nodeOf(
      topBar(t, { floating: true, content: toolRow({ fixed: true, leading: [], trailing: [] }) }),
    );
    expect(bar.styles.pt).toBe(0);
    expect(walk(bar).some((n) => n.styles.top === -5 && n.styles.bg === "#chrome")).toBe(true);
  });
  test("the crumb band separates its crumbs", () => {
    const band = crumbBand(t, [
      crumb(t, { id: "a", label: "Repo" }),
      crumb(t, { id: "b", label: "PRs", current: true }),
    ]);
    expect(texts(band)).toEqual(["Repo", "›", "PRs"]);
    expect(nodeOf(band).styles).toMatchObject({ h: 36, px: 12, border_t: 1, border_b: 1 });
    expect(byId(band, "b")!.styles.text_color).toBe("#foreground");
  });
  test("a clickable crumb is held in an overlay", () => {
    const node = nodeOf(crumb(t, { id: "x", label: "X", onClick: () => {}, hold: stopPress }));
    expect(node.calls).toContain("on_mouse_down");
  });
  test("the crumb picker lists any and every choice, checking the chosen", () => {
    const picker = crumbPicker(t, {
      id: "project",
      any: "All projects",
      choices: [
        { name: "Alpha", icon: "a.svg", color: "#ff0000" },
        { name: "Beta", icon: undefined, color: undefined },
      ],
      chosen: "Alpha",
      open: true,
      current: false,
      browse: () => {},
      pick: () => {},
      setOpen: () => {},
    });
    expect(byId(picker, "project-all")).toBeDefined();
    expect(
      walk(byId(picker, "project-Alpha")).some(
        (n) => n.styles.asset === "mods/workspace-chrome/check.svg",
      ),
    ).toBe(true);
    expect(byId(picker, "project-list")!.styles).toMatchObject({ w: 260, max_h: 7 * 26 });
  });
  test("the title row puts the identifier before the title", () => {
    expect(texts(titleRow(t, { title: "Fix it", identifier: "T-1" }))).toEqual(["T-1", "Fix it"]);
  });
});

describe("listing", () => {
  test("a card is a bordered canvas", () => {
    expect(nodeOf(card(t, "c")).styles).toMatchObject({
      bg: "#canvas",
      border: 1,
      border_color: "#input",
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
      bg: "#popover",
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
    expect(walk(bar).some((n) => n.styles.w === 14 && n.styles.bg === "#ansi2")).toBe(true);
    expect(texts(progressBar(t, { done: 0, total: 0, empty: "No Tasks" }))).toEqual(["No Tasks"]);
  });
});

describe("chips, tabs, states, menus, scroll", () => {
  test("a count chip tints its background", () => {
    expect(
      nodeOf(countChip({ id: "b", count: 2, icon: "x.svg", color: "#ff0000", tooltip: "2" })).styles
        .bg,
    ).toBe("#ff00001f");
    expect(
      nodeOf(labelChip(t, { id: "l", label: "bug", icon: "tag.svg", color: undefined })).styles,
    ).toMatchObject({ h: 18, bg: "#raised", tooltip: "bug" });
  });
  test("the selected tab takes the selected fill; a locked bar is inert", () => {
    const bar = tabBar(t, {
      id: "tabs",
      tabs: [
        { id: "a", label: "A", selected: true },
        { id: "b", label: "B", selected: false },
      ],
      locked: true,
      onTab: () => {},
    });
    expect(byId(bar, "tabs-a")!.styles.bg).toBe("#selected");
    expect(byId(bar, "tabs-b")!.click).toBeUndefined();
    expect(byId(bar, "tabs-b")!.styles.text_color).toBe("#dim");
  });
  test("a state block says its title, detail and action", () => {
    const block = stateBlock(t, {
      title: "Nothing",
      detail: "Pick one",
      action: button(t, { id: "go", label: "Go", onClick: () => {} }),
    });
    expect(texts(block)).toEqual(["Nothing", "Pick one", "Go"]);
  });
  test("a collapsed document is a faded, capped preview", () => {
    const doc = documentCard(t, {
      id: "spec-1",
      text: "# Hi",
      open: false,
      previewHeight: 120,
      surface: "#000000",
      toggle: () => {},
    });
    expect(byId(doc, "document-preview-spec-1")!.styles.max_h).toBe(120);
    expect(byId(doc, "document-fade-spec-1")!.children).toHaveLength(16);
    expect(
      texts(
        documentCard(t, {
          id: "e",
          text: " ",
          open: false,
          previewHeight: 1,
          surface: "#000000",
          toggle: () => {},
        }),
      ),
    ).toContain("No document");
  });
  test("a menu panel stops presses; a pane scroll region pairs its scrollbar", () => {
    expect(nodeOf(menuPanel(t, 220)).calls.filter((c) => c === "on_mouse_down")).toHaveLength(2);
    const region = paneScrollRegion("s", card(t, "c"), 12);
    expect(walk(region).find((n) => n.kind === "Scrollbar")!.styles).toMatchObject({
      ctor: "s",
      right: -12,
    });
  });
});
