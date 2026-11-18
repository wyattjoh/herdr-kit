// Preloaded by `bun test` (bunfig.toml): mocks gpui-kit and gpui-base with chainable
// recording elements, so element functions are testable without Herdr.
import { mock } from "bun:test";

/**
 * A recorded element: `child`/`children` append, `when` applies conditionally, `on_click`
 * keeps the handler, `hover` records the style it applies, and every other builder call records
 * its arguments under its name (the first argument alone when there is one).
 */
export type Node = {
  kind: string;
  children: (Node | string)[];
  styles: Record<string, unknown>;
  calls: string[];
  click: ((event: unknown, cx: unknown) => void) | undefined;
  hoverStyles: Record<string, unknown>;
};

const NODE = Symbol("node");

/**
 * The recorded node behind a mocked element.
 * @param element What an element function returned.
 * @returns Its record.
 */
export const nodeOf = (element: unknown): Node => (element as { [NODE]: Node })[NODE];

/**
 * Every node in a tree, depth first.
 * @param root The root element or node.
 * @returns The nodes.
 */
export function walk(root: unknown): Node[] {
  const start = (root as { [NODE]?: Node })[NODE] ?? (root as Node);
  const out: Node[] = [];
  const visit = (node: Node) => {
    out.push(node);
    for (const child of node.children) if (typeof child !== "string") visit(child);
  };
  visit(start);
  return out;
}

/**
 * The node with an id.
 * @param root The tree.
 * @param id The id.
 * @returns The node, or undefined.
 */
export const byId = (root: unknown, id: string): Node | undefined =>
  walk(root).find((node) => node.styles.id === id);

/**
 * Every string in a tree, in order.
 * @param root The tree.
 * @returns The text.
 */
export const texts = (root: unknown): string[] =>
  walk(root).flatMap((node) => node.children.filter((c): c is string => typeof c === "string"));

function element(kind: string): unknown {
  const node: Node = {
    kind,
    children: [],
    styles: {},
    calls: [],
    click: undefined,
    hoverStyles: {},
  };
  const unwrap = (child: unknown): Node | string =>
    typeof child === "string" ? child : ((child as { [NODE]: Node })[NODE] ?? String(child));
  const builder: unknown = new Proxy(node, {
    get(target, key) {
      if (key === NODE) return target;
      if (key === "then") return undefined;
      if (key === "child" || key === "trigger" || key === "content")
        return (child: unknown) => {
          target.children.push(unwrap(child));
          return builder;
        };
      if (key === "children")
        return (children: unknown[]) => {
          target.children.push(...children.map(unwrap));
          return builder;
        };
      if (key === "when")
        return (condition: boolean, apply: (value: unknown) => unknown) =>
          condition ? apply(builder) : builder;
      if (key === "on_click")
        return (click: Node["click"]) => {
          target.click = click;
          target.calls.push("on_click");
          return builder;
        };
      if (key === "hover")
        return (apply: (style: unknown) => unknown) => {
          const style = nodeOf(apply(element("style")));
          Object.assign(target.hoverStyles, style.styles);
          target.calls.push("hover");
          return builder;
        };
      if (typeof key === "string")
        return (...values: unknown[]) => {
          target.calls.push(key);
          target.styles[key] =
            values.length === 0 ? true : values.length === 1 ? values[0] : values;
          return builder;
        };
      return undefined;
    },
  });
  return builder;
}

const factory = (kind: string) => (id?: unknown, extra?: unknown) => {
  const el = element(kind);
  if (id !== undefined) nodeOf(el).styles.ctor = extra === undefined ? id : [id, extra];
  return el;
};

mock.module("gpui-kit", () => ({
  View: class {},
  div: () => element("div"),
  svg: (path: string) => {
    const el = element("svg");
    nodeOf(el).styles.asset = path;
    return el;
  },
}));
mock.module("gpui-base", () => ({
  h_flex: () => element("h_flex"),
  v_flex: () => element("v_flex"),
  Input: { new: factory("Input") },
  Popover: { new: factory("Popover") },
  Scrollbar: { vertical: factory("Scrollbar") },
  TextView: { markdown: factory("TextView") },
}));
