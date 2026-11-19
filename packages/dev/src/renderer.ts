// Shared recording renderer mocks for Bun tests of Herdr mods.
import { mock } from "bun:test";

/**
 * A node recorded from a mocked GPUI element chain.
 */
export type Node = {
  kind: string;
  children: (Node | string)[];
  /** Optional alias for `children` used by the coordinate consumer. */
  nodes?: (Node | string)[];
  /** Optional alias for the most recently recorded element id. */
  elementId?: string | undefined;
  styles: Record<string, unknown>;
  calls: string[];
  click: ((event: unknown, cx: unknown) => void) | undefined;
  hoverStyles: Record<string, unknown>;
};

const NODE = Symbol("herdr-dev-node");
type RendererFactory = (...args: never[]) => unknown;

/**
 * The fixture-backed Herdr functions used by consumers that need host responses.
 */
export type HerdrFixture = {
  agents: () => unknown[];
  appHome: () => string;
  exec: (...args: never[]) => unknown;
  focused: () => unknown;
  layout: () => unknown;
  layouts: () => string[];
  nextCommand: () => Promise<string>;
  panes: () => unknown[];
  props: () => unknown;
  readTextFile: (path: string) => Promise<string | null>;
  run: (command: string, args: unknown) => unknown;
  setShared: (key: string, value: unknown) => unknown;
  shared: (key: string) => unknown;
  spaces: () => unknown[];
  terminals: () => unknown[];
  theme: () => Record<string, string>;
  watchFolder: (...args: never[]) => unknown;
};

/**
 * The complete fixture shape used by herdr-git-forge-style tests.
 */
export type RendererFixture = {
  herdr: HerdrFixture;
  inputText: string;
};

/**
 * Mock GPUI factories that a suite may override while sharing the renderer modules.
 */
export type RendererKit = {
  div: RendererFactory;
  svg: RendererFactory;
};

/**
 * Mock gpui-base factories supported by the shared test renderer.
 */
export type RendererBase = {
  h_flex: RendererFactory;
  v_flex: RendererFactory;
  TextView: { markdown: RendererFactory; new: RendererFactory };
  Popover: { new: RendererFactory };
  Input: { new: RendererFactory };
  InputState: { new: RendererFactory };
  Scrollbar: { vertical: RendererFactory };
  ScrollHandle: { new: RendererFactory };
};

type ExtraHerdrFixture = {
  checking: () => boolean;
  home: () => string;
  notify: (...args: never[]) => unknown;
  placement: () => unknown;
};

/**
 * Optional suite-local replacements for any renderer or host delegate.
 */
export type RendererOverrides = {
  kit?: Partial<RendererKit>;
  base?: Partial<RendererBase>;
  herdr?: Partial<HerdrFixture & ExtraHerdrFixture>;
  native?: Partial<HerdrFixture & ExtraHerdrFixture>;
  inputText?: string;
};

/**
 * Mutable state recorded for a retained input mock.
 */
export type FakeInput = {
  placeholder: string | undefined;
  current: string;
  handlers: Map<string, (event: unknown, cx: unknown) => void>;
  value: () => string;
  set_value: (next: string | { text: string }) => void;
  on: (event: string, handler: (event: unknown, cx: unknown) => void) => boolean;
  content: () => { text: string };
  focus: () => void;
};

/**
 * A pending fake folder watch settled by a test.
 */
export type Watch = {
  path: string;
  cancelled: boolean;
  fire: (paths: string[]) => void;
  fail: (error: unknown) => void;
};

/**
 * A repeating timer registered on the fake view context.
 */
export type Timer = {
  ms: number;
  handler: (cx: unknown) => void;
  cancelled: boolean;
};

/**
 * The mutable host state backing the shared Herdr test doubles.
 */
export type RendererHost = {
  files: Map<string, string>;
  terminals: Record<string, unknown>[];
  focused: Record<string, unknown> | null;
  watches: Watch[];
  reads: string[];
  unreadable: Set<string>;
  execs: { command: string; args: string[] }[];
  execRejects: unknown;
  execExit: { code: number; stderr: string } | undefined;
  checking: boolean;
  layout: unknown;
  shared: Map<string, unknown>;
  runs: { command: string; args: Record<string, unknown> | undefined }[];
  commandReaders: ((command: string) => void)[];
  inputs: FakeInput[];
};

type RendererState = {
  kit: Partial<RendererKit>;
  base: Partial<RendererBase>;
  herdr: Partial<HerdrFixture & ExtraHerdrFixture>;
  inputText: string | undefined;
};

let current: RendererState = {
  kit: {},
  base: {},
  herdr: {},
  inputText: undefined,
};

/**
 * Install suite-local GPUI and Herdr overrides for subsequent mocked module calls.
 *
 * Accepts either the full `{ herdr, inputText }` fixture or partial `{ kit, base, native }`
 * overrides so consumers can migrate without duplicating Bun's registered module surface.
 * @param next Fixture or partial delegate overrides for this suite.
 */
export function useRenderer(next: RendererFixture | RendererOverrides): void {
  if ("inputText" in next && "herdr" in next && next.herdr) {
    current = {
      kit: {},
      base: {},
      herdr: next.herdr,
      inputText: next.inputText,
    };
    return;
  }
  const overrides = next as RendererOverrides;
  current = {
    kit: overrides.kit ?? {},
    base: overrides.base ?? {},
    herdr: { ...overrides.herdr, ...overrides.native },
    inputText: overrides.inputText,
  };
}

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
  if (start && typeof start === "object" && Array.isArray(start.children)) visit(start);
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

/**
 * Find the first element with an id, depth-first.
 * @param root Rendered tree or a string child.
 * @param id Element id to locate.
 * @returns The matching node, or undefined.
 */
export const find = (root: Node | string, id: string): Node | undefined => {
  if (typeof root === "string") return undefined;
  return byId(root, id);
};

/**
 * Find an element by id, throwing when it is absent.
 * @param root Rendered tree or a string child.
 * @param id Element id to locate.
 * @returns The matching node.
 */
export const get = (root: Node | string, id: string): Node => {
  const found = find(root, id);
  if (!found) throw new Error(`no element with id ${id}`);
  return found;
};

/**
 * Return every recorded id beginning with a prefix, in render order.
 * @param root Rendered tree or a string child.
 * @param prefix Identifier prefix.
 * @returns Matching ids.
 */
export const ids = (root: Node | string, prefix: string): string[] =>
  typeof root === "string"
    ? []
    : walk(root)
        .map((node) => node.styles.id)
        .filter((id): id is string => typeof id === "string" && id.startsWith(prefix));

/**
 * Collect text descendants joined by single spaces.
 * @param root Element or string child.
 * @returns Descendant text.
 */
export const text = (root: Node | string): string =>
  typeof root === "string" ? root : texts(root).join(" ");

/**
 * The fake host fixture backing file, command, terminal and view state.
 */
export const host: RendererHost = {
  files: new Map(),
  terminals: [],
  focused: null,
  watches: [],
  reads: [],
  unreadable: new Set(),
  execs: [],
  execRejects: undefined,
  execExit: undefined,
  checking: false,
  layout: null,
  shared: new Map(),
  runs: [],
  commandReaders: [],
  inputs: [],
};

function element(kind: string): unknown {
  const node = {
    kind,
    children: [],
    styles: {},
    calls: [],
    click: undefined,
    hoverStyles: {},
  } as unknown as Node;
  Object.defineProperties(node, {
    nodes: { get: () => node.children },
    elementId: {
      get: () => (typeof node.styles.id === "string" ? (node.styles.id as string) : undefined),
    },
  });
  const unwrap = (child: unknown): Node | string =>
    typeof child === "string" ? child : ((child as { [NODE]?: Node })[NODE] ?? String(child));
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
          if (COLOR_METHODS.has(key)) validateColor(key, values[0]);
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

const COLOR_METHODS = new Set(["bg", "border_color", "text_bg", "text_color"]);
const COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;

function validateColor(method: string, value: unknown): asserts value is string {
  if (typeof value === "string" && COLOR_PATTERN.test(value)) return;
  throw new TypeError(
    `Invalid color passed to ${method}: ${typeof value === "string" ? value : String(value)}`,
  );
}

const factory =
  (kind: string) =>
  (...args: unknown[]) => {
    const value = element(kind);
    if (args.length > 0) nodeOf(value).styles.ctor = args.length === 1 ? args[0] : args;
    return value;
  };

const inputState = (options: { placeholder?: string; value?: string } = {}): FakeInput => {
  let currentValue = options.value ?? current.inputText ?? "";
  const handlers = new Map<string, (event: unknown, cx: unknown) => void>();
  const input: FakeInput = {
    placeholder: options.placeholder,
    get current() {
      return currentValue;
    },
    set current(next) {
      currentValue = next;
    },
    handlers,
    value: () => currentValue,
    set_value: (next) => {
      currentValue = typeof next === "string" ? next : next.text;
    },
    on: (event, handler) => {
      handlers.set(event, handler);
      return true;
    },
    content: () => ({ text: currentValue }),
    focus: () => {},
  };
  host.inputs.push(input);
  return input;
};

const textViewMarkdown = (id: string, markdown: string): unknown => {
  const value = factory("TextView")(id, markdown);
  const node = nodeOf(value);
  node.styles.id = id;
  node.styles.markdown = markdown;
  return value;
};

function callFactory(
  custom: RendererFactory | undefined,
  fallback: (...args: unknown[]) => unknown,
  args: unknown[],
): unknown {
  return custom ? (custom as (...values: unknown[]) => unknown)(...args) : fallback(...args);
}

const defaultTheme: Record<string, string> = {
  background: "#0a0a0a",
  foreground: "#f5f5f5",
  surface: "#171717",
  surface_foreground: "#f5f5f5",
  canvas: "#111111",
  popover: "#292929",
  primary: "#2563eb",
  primary_foreground: "#ffffff",
  secondary: "#404040",
  secondary_foreground: "#f5f5f5",
  muted: "#a3a3a3",
  muted_foreground: "#737373",
  accent: "#3b82f6",
  accent_foreground: "#ffffff",
  destructive: "#ef4444",
  destructive_foreground: "#ffffff",
  border: "#525252",
  input: "#404040",
  ring: "#60a5fa",
  selection: "#2563eb",
  solid: "#ffffff",
  solid_foreground: "#0a0a0a",
  chrome: "#171717",
  selected: "#2563eb",
  hover: "#404040",
  dim: "#737373",
  raised: "#404040",
  blocked: "#ef4444",
  working: "#3b82f6",
  idle: "#737373",
  gone: "#737373",
  done: "#22c55e",
  ansi1: "#ef4444",
  ansi2: "#22c55e",
  ansi3: "#eab308",
  ansi4: "#a855f7",
  ansi5: "#f97316",
  ansi6: "#06b6d4",
  ansi7: "#e5e5e5",
  ansi8: "#737373",
};
const defaultThemeValue = (): Record<string, string> =>
  new Proxy(defaultTheme, {
    get: (target, key) => (typeof key === "string" ? target[key] : undefined),
  });

function listFolder(folder: string): string {
  return [...host.files.keys()]
    .filter((path) => path.startsWith(`${folder}/`) && path.endsWith(".json"))
    .map((path) => path.slice(folder.length + 1, -".json".length))
    .filter((name) => !name.includes("/"))
    .map((name) => `${name}\0`)
    .join("");
}

function defaultExec(command: string, args: string[] = []): unknown {
  host.execs.push({ command, args });
  if (host.execRejects !== undefined) throw host.execRejects;
  if (host.execExit !== undefined) return { stdout: "", ...host.execExit };
  return { code: 0, stdout: listFolder(args.at(-1) ?? ""), stderr: "" };
}

function defaultWatchFolder(path: string): unknown {
  let resolve!: (paths: string[]) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<string[]>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const watch: Watch = {
    path,
    cancelled: false,
    fire: resolve,
    fail: reject,
  };
  host.watches.push(watch);
  return Object.assign(promise, {
    cancel: () => {
      watch.cancelled = true;
      resolve([]);
    },
  });
}

function delegate<K extends keyof (HerdrFixture & ExtraHerdrFixture)>(
  name: K,
  fallback: RendererFactory,
  args: unknown[],
): unknown {
  const configured = current.herdr[name] as ((...values: unknown[]) => unknown) | undefined;
  return configured
    ? configured(...args)
    : (fallback as (...values: unknown[]) => unknown)(...args);
}

const defaultInput = (state: unknown): unknown => {
  const value = factory("Input")(state);
  nodeOf(value).styles.state = state;
  return value;
};
const defaultSetShared = (key: string, value: unknown): null => {
  host.shared.set(key, value);
  return null;
};
const defaultRun = (command: string, args: unknown): null => {
  host.runs.push({
    command,
    args: typeof args === "object" && args !== null ? (args as Record<string, unknown>) : undefined,
  });
  return null;
};
const defaultReadTextFile = async (path: string): Promise<string | null> => {
  host.reads.push(path);
  if (host.unreadable.has(path)) throw new Error(`permission denied: ${path}`);
  return host.files.get(path) ?? null;
};

mock.module("gpui-kit", () => ({
  View: class {},
  div: (...args: unknown[]) => callFactory(current.kit.div, () => element("div"), args),
  svg: (path: string) =>
    callFactory(
      current.kit.svg,
      () => {
        const value = element("svg");
        nodeOf(value).styles.asset = path;
        return value;
      },
      [path],
    ),
}));

mock.module("gpui-base", () => ({
  h_flex: (...args: unknown[]) => callFactory(current.base.h_flex, () => element("h_flex"), args),
  v_flex: (...args: unknown[]) => callFactory(current.base.v_flex, () => element("v_flex"), args),
  Input: {
    new: (...args: unknown[]) => callFactory(current.base.Input?.new, defaultInput, args),
  },
  InputState: {
    new: (...args: unknown[]) =>
      callFactory(
        current.base.InputState?.new,
        (values) => inputState(values as { placeholder?: string; value?: string }),
        args,
      ),
  },
  Popover: {
    new: (...args: unknown[]) => callFactory(current.base.Popover?.new, factory("Popover"), args),
  },
  Scrollbar: {
    vertical: (...args: unknown[]) =>
      callFactory(current.base.Scrollbar?.vertical, factory("Scrollbar"), args),
  },
  ScrollHandle: {
    new: (...args: unknown[]) =>
      callFactory(
        current.base.ScrollHandle?.new,
        () => ({ scroll_to_item: (_index: number) => {}, release: () => true }),
        args,
      ),
  },
  TextView: {
    markdown: (...args: unknown[]) =>
      callFactory(
        current.base.TextView?.markdown,
        (id, markdown) => textViewMarkdown(String(id), String(markdown)),
        args,
      ),
    new: (...args: unknown[]) => callFactory(current.base.TextView?.new, factory("TextView"), args),
  },
}));

mock.module("herdr", () => ({
  agents: (...args: unknown[]) => delegate("agents", () => [], args),
  appHome: (...args: unknown[]) => delegate("appHome", () => "/Users/test", args),
  checking: (...args: unknown[]) => delegate("checking", () => host.checking, args),
  exec: (...args: unknown[]) => delegate("exec", defaultExec, args),
  focused: (...args: unknown[]) => delegate("focused", () => host.focused, args),
  home: (...args: unknown[]) => delegate("home", () => "/Users/test", args),
  layout: (...args: unknown[]) => delegate("layout", () => host.layout, args),
  layouts: (...args: unknown[]) => delegate("layouts", () => [], args),
  nextCommand: (...args: unknown[]) =>
    delegate(
      "nextCommand",
      () => new Promise<string>((resolve) => host.commandReaders.push(resolve)),
      args,
    ),
  notify: (...args: unknown[]) => delegate("notify", () => undefined, args),
  panes: (...args: unknown[]) => delegate("panes", () => [], args),
  placement: (...args: unknown[]) => delegate("placement", () => null, args),
  props: (...args: unknown[]) => delegate("props", () => ({}), args),
  readTextFile: (...args: unknown[]) => delegate("readTextFile", defaultReadTextFile, args),
  run: (...args: unknown[]) => delegate("run", defaultRun, args),
  setShared: (...args: unknown[]) => delegate("setShared", defaultSetShared, args),
  shared: (...args: unknown[]) => delegate("shared", (key) => host.shared.get(String(key)), args),
  spaces: (...args: unknown[]) => delegate("spaces", () => [], args),
  terminals: (...args: unknown[]) => delegate("terminals", () => host.terminals, args),
  theme: (...args: unknown[]) => delegate("theme", defaultThemeValue, args),
  watchFolder: (...args: unknown[]) => delegate("watchFolder", defaultWatchFolder, args),
}));

/**
 * Deliver a command to the oldest pending fake `nextCommand` call.
 * @param command Command text to resolve.
 */
export const sendCommand = (command: string): void => {
  const reader = host.commandReaders.shift();
  if (!reader) throw new Error("no nextCommand is waiting");
  reader(command);
};

/**
 * Type into a fake retained input and invoke its registered change handler.
 * @param input The fake input state.
 * @param value The replacement text.
 * @param cx Context passed to the change handler.
 */
export const typeInto = (input: FakeInput, value: string, cx: unknown): void => {
  input.current = value;
  input.handlers.get("change")?.({}, cx);
};

/**
 * Create a fake context whose spawned bodies run immediately and whose timers wait for tests.
 * @returns The context, registered timers, notification count, and a timer tick helper.
 */
export const context = () => {
  const timers: Timer[] = [];
  let notified = 0;
  const cx = {
    notify: () => {
      notified += 1;
    },
    stop_propagation: () => {},
    spawn: (body: (cx: unknown) => unknown) => {
      void Promise.resolve(body(cx));
      return { cancel: () => {} };
    },
    timer: {
      every: (ms: number, handler: (cx: unknown) => void) => {
        const timer: Timer = { ms, handler, cancelled: false };
        timers.push(timer);
        return {
          cancel: () => {
            timer.cancelled = true;
          },
        };
      },
    },
  };
  return {
    cx,
    timers,
    get notified() {
      return notified;
    },
    /**
     * Fire each active timer registered with the given period.
     * @param ms Timer period to fire.
     */
    tick: (ms: number) => {
      for (const timer of timers) if (timer.ms === ms && !timer.cancelled) timer.handler(cx);
    },
  };
};

/**
 * Let pending fake host reads and spawned work progress through their next await.
 */
export const settle = async (): Promise<void> => {
  for (let i = 0; i < 10; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Reset host records, files and pending operations to their initial empty state.
 */
export const resetHost = (): void => {
  host.files = new Map();
  host.terminals = [];
  host.focused = null;
  host.watches = [];
  host.reads = [];
  host.unreadable = new Set();
  host.execs = [];
  host.execRejects = undefined;
  host.execExit = undefined;
  host.checking = false;
  host.layout = null;
  host.shared = new Map();
  host.runs = [];
  host.commandReaders = [];
  host.inputs = [];
};
