// Shared recording renderer mocks for Bun tests of Herdr mods.
import { mock } from "bun:test";

/** A node recorded from a mocked GPUI element chain. */
export type Node = {
  kind: string;
  children: (Node | string)[];
  styles: Record<string, unknown>;
  calls: string[];
  click: ((event: unknown, cx: unknown) => void) | undefined;
  hoverStyles: Record<string, unknown>;
};

const NODE = Symbol("herdr-dev-node");

/**
 * Retrieve the record for a mocked element.
 * @param element Element returned by a mod renderer.
 * @returns Recorded node.
 */
export const nodeOf = (element: unknown): Node => (element as { [NODE]: Node })[NODE];

/**
 * Walk a recorded tree depth-first.
 * @param root Root element or node.
 * @returns Nodes in visitation order.
 */
export function walk(root: unknown): Node[] {
  const start = (root as { [NODE]?: Node })[NODE] ?? (root as Node);
  const output: Node[] = [];
  const visit = (node: Node) => {
    output.push(node);
    for (const child of node.children) if (typeof child !== "string") visit(child);
  };
  visit(start);
  return output;
}

/**
 * Find a node by its recorded id.
 * @param root Root tree.
 * @param id Identifier to locate.
 * @returns Matching node, or undefined.
 */
export const byId = (root: unknown, id: string): Node | undefined =>
  walk(root).find((node) => node.styles.id === id);

/**
 * Collect direct text children from the tree in traversal order.
 * @param root Root tree.
 * @returns Text nodes.
 */
export const texts = (root: unknown): string[] =>
  walk(root).flatMap((node) =>
    node.children.filter((child): child is string => typeof child === "string"),
  );

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
          Object.assign(target.hoverStyles, nodeOf(apply(element("style"))).styles);
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
  const value = element(kind);
  if (id !== undefined) nodeOf(value).styles.ctor = extra === undefined ? id : [id, extra];
  return value;
};

mock.module("gpui-kit", () => ({
  View: class {},
  div: () => element("div"),
  svg: (path: string) => {
    const value = element("svg");
    nodeOf(value).styles.asset = path;
    return value;
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
mock.module("herdr", () => ({}));
