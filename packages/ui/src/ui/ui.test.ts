import { describe, expect, test } from "bun:test";
import { byId, nodeOf, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { button, togglePill } from "./controls";
import { crumb, crumbBand, crumbPicker, titleRow } from "./crumbs";
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
import { countChip, labelChip, toggleChip } from "./chips";
import { tabBar } from "./tabs";
import { brand, panelBody, panelFrame, toolRow, topBar } from "./frame";
import { errorState, stateBlock } from "./states";
import { documentCard } from "./document";
import { menuPanel } from "./menu";
import { paneScrollRegion } from "./scroll";
import { stopPress } from "./theme";

const visibleTree = (element: unknown) =>
  walk(element).map(({ kind, children, styles, calls, hoverStyles }) => ({
    kind,
    children: children.map((child) => (typeof child === "string" ? child : child.kind)),
    styles,
    calls,
    hoverStyles,
  }));

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

describe("chrome", () => {
  test("brand keeps its icon and gap before the name when given an icon", () => {
    const node = nodeOf(brand(t, { icon: "git.svg", name: "Git" }));
    const mark = walk(node).find((child) => child.kind === "svg")!;
    expect(node.styles).toMatchObject({ id: "brand", h: 26, gap: 6 });
    expect(node.calls).toEqual(["id", "h", "flex_none", "gap", "items_center"]);
    expect(mark.styles).toMatchObject({ asset: "git.svg", size: 20, flex_none: true });
    expect(mark.styles.text_color).toBe(t.accent);
    expect(node.children.map((child) => (typeof child === "string" ? child : child.kind))).toEqual([
      "svg",
      "div",
    ]);
    expect(texts(node)).toEqual(["Git"]);
  });
  test("brand without an icon is name-only and has no icon gap", () => {
    const node = nodeOf(brand(t, { name: "Git" }));
    const name = walk(node).find((child) => child.kind === "div")!;
    expect(node.styles.id).toBe("brand");
    expect(node.styles.h).toBe(26);
    expect(node.calls).toEqual(["id", "h", "flex_none", "items_center"]);
    expect(node.children.map((child) => (typeof child === "string" ? child : child.kind))).toEqual([
      "div",
    ]);
    expect(name.styles.text_size).toBe(15);
    expect(name.styles.font_semibold).toBe(true);
    expect(name.styles.text_color).toBe(t.foreground);
    expect(texts(node)).toEqual(["Git"]);
  });
  test("a pane frame fills its block; a float takes its width", () => {
    const omitted = panelFrame(t, "root");
    const explicitUndefined = panelFrame(t, "root", undefined);
    expect(visibleTree(omitted)).toEqual(visibleTree(explicitUndefined));
    expect(nodeOf(omitted).styles).toMatchObject({
      size_full: true,
      bg: t.surface,
      rounded_t: 9,
    });
    expect(nodeOf(panelFrame(t, "root", 360)).styles).toMatchObject({ w: 360 });
  });
  test("a floating top bar reaches over Herdr's frame strip", () => {
    const bar = nodeOf(
      topBar(t, { floating: true, content: toolRow({ fixed: true, leading: [], trailing: [] }) }),
    );
    expect(bar.styles.pt).toBe(0);
    expect(walk(bar).some((n) => n.styles.top === -5 && n.styles.bg === t.chrome)).toBe(true);
  });
  test("omitted top-bar and tool-row options keep their docked, wrapping defaults", () => {
    const content = toolRow({ leading: [], trailing: [] });
    expect(visibleTree(topBar(t, { content }))).toEqual(
      visibleTree(topBar(t, { floating: undefined, content })),
    );
    expect(visibleTree(toolRow({ leading: [], trailing: [] }))).toEqual(
      visibleTree(toolRow({ fixed: undefined, leading: [], trailing: [] })),
    );
    expect(visibleTree(toolRow({ leading: [], trailing: [] }))).toEqual(
      visibleTree(toolRow({ fixed: false, leading: [], trailing: [] })),
    );
  });
  test("the crumb band separates its crumbs", () => {
    const band = crumbBand(t, [
      crumb(t, { id: "a", label: "Repo" }),
      crumb(t, { id: "b", label: "PRs", current: true }),
    ]);
    expect(texts(band)).toEqual(["Repo", "›", "PRs"]);
    expect(nodeOf(band).styles).toMatchObject({ h: 36, px: 12, border_t: 1, border_b: 1 });
    expect(byId(band, "b")!.styles.text_color).toBe(t.foreground);
  });
  test("a clickable crumb is held in an overlay", () => {
    const node = nodeOf(crumb(t, { id: "x", label: "X", onClick: () => {}, hold: stopPress }));
    expect(node.calls).toContain("on_mouse_down");
  });
  test("omitted crumb picker fields match their explicit undefined forms", () => {
    const required = {
      id: "repo",
      any: "All repos",
      open: false,
      current: false,
      browse: () => {},
      pick: () => {},
      setOpen: () => {},
    };
    const omitted = crumbPicker(t, { ...required, choices: [{ name: "herdr-ui" }] });
    const explicitUndefined = crumbPicker(t, {
      ...required,
      choices: [{ name: "herdr-ui", icon: undefined, color: undefined }],
      chosen: undefined,
    });
    expect(texts(omitted)).toEqual(texts(explicitUndefined));
    expect(walk(omitted).map((node) => node.styles.id)).toEqual(
      walk(explicitUndefined).map((node) => node.styles.id),
    );
    expect(
      walk(omitted)
        .filter((node) => node.kind === "svg")
        .map((node) => node.styles),
    ).toEqual(
      walk(explicitUndefined)
        .filter((node) => node.kind === "svg")
        .map((node) => node.styles),
    );
  });
  test("the crumb picker lists any and every choice, checking the chosen", () => {
    const picked: (string | undefined)[] = [];
    const picker = crumbPicker(t, {
      id: "project",
      any: "All projects",
      choices: [
        { name: "Alpha", key: "alpha-uuid", icon: "a.svg", color: "#ff0000" },
        { name: "Beta", icon: undefined, color: undefined },
      ],
      chosen: "alpha-uuid",
      open: true,
      current: false,
      browse: () => {},
      pick: (key) => picked.push(key),
      setOpen: () => {},
    });
    expect(byId(picker, "project-all")).toBeDefined();
    expect(byId(picker, "project-alpha-uuid")).toBeDefined();
    expect(byId(picker, "project-Beta")).toBeDefined();
    expect(
      walk(byId(picker, "project-alpha-uuid")).some(
        (n) => n.styles.asset === "mods/workspace-chrome/check.svg",
      ),
    ).toBe(true);
    byId(picker, "project-alpha-uuid")!.click!(undefined, undefined);
    byId(picker, "project-Beta")!.click!(undefined, undefined);
    byId(picker, "project-all")!.click!(undefined, undefined);
    expect(picked).toEqual(["alpha-uuid", "Beta", undefined]);
    expect(byId(picker, "project-list")!.styles).toMatchObject({ w: 260, max_h: 7 * 26 });
  });
  test("the title row puts the identifier before the title", () => {
    expect(texts(titleRow(t, { title: "Fix it", identifier: "T-1" }))).toEqual(["T-1", "Fix it"]);
  });
  test("the title row lets callers preserve a custom trailing-slot id", () => {
    const trailing = button(t, { id: "copy-id", label: "ID" });
    const custom = titleRow(t, {
      title: "Fix it",
      trailing,
      trailingId: "page-title-copy",
    });
    const defaulted = titleRow(t, { id: "details-title", title: "Details", trailing });
    expect(byId(custom, "page-title-copy")).toBeDefined();
    expect(byId(custom, "page-title-trailing")).toBeUndefined();
    expect(byId(defaulted, "details-title-trailing")).toBeDefined();
  });
  test("panelBody lets callers set the content id and measures the outer body", () => {
    const sizes: { width: number; height: number }[] = [];
    const body = panelBody({
      id: "panel-body",
      contentId: "panel-content",
      scrollCap: undefined,
      hold: (element) => element,
      content: button(t, { id: "body-content", label: "Body" }),
      measure: (size) => sizes.push(size),
    });
    const outer = nodeOf(body);
    const onSizeChange = outer.styles.on_size_change as (size: {
      width: number;
      height: number;
    }) => void;
    expect(byId(body, "panel-body")).toBeDefined();
    expect(byId(body, "panel-content")).toBeDefined();
    expect(outer.calls).toContain("on_size_change");
    onSizeChange({ width: 640, height: 480 });
    expect(sizes).toEqual([{ width: 640, height: 480 }]);
  });
  test("panelBody keeps the derived content id by default", () => {
    const content = button(t, { id: "body-content", label: "Body" });
    const body = panelBody({ hold: (element) => element, content });
    const explicitUndefined = panelBody({
      scrollCap: undefined,
      hold: (element) => element,
      content,
    });
    expect(visibleTree(body)).toEqual(visibleTree(explicitUndefined));
    expect(byId(body, "panel-body-content")).toBeDefined();
  });
});

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

describe("chips, tabs, states, menus, scroll", () => {
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
    expect(byId(bar, "tabs-a")!.styles.bg).toBe(t.selected);
    expect(byId(bar, "tabs-b")!.click).toBeUndefined();
    expect(byId(bar, "tabs-b")!.styles.text_color).toBe(t.dim);
  });
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

const INTERACTIVE = ["cursor_pointer", "hover", "on_click"];
const interactive = (element: unknown) =>
  nodeOf(element).calls.filter((call) => INTERACTIVE.includes(call));

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
    expect(walk(unlit).find((n) => n.kind === "svg")!.styles).toMatchObject({
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
