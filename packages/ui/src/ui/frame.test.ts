import { describe, expect, test } from "bun:test";
import { byId, nodeOf, texts, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { button } from "./controls";
import { crumb, crumbBand, crumbPicker, titleRow } from "./crumbs";
import { brand, panelBody, panelFrame, toolRow, topBar } from "./frame";
import { stopPress } from "./theme";

const visibleTree = (element: unknown) =>
  walk(element).map(({ kind, children, styles, calls, hoverStyles }) => ({
    kind,
    children: children.map((child) => (typeof child === "string" ? child : child.kind)),
    styles,
    calls,
    hoverStyles,
  }));

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
