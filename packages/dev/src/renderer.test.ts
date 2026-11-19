import { afterEach, expect, test } from "bun:test";
import { byId, nodeOf, texts, type FakeInput, useRenderer } from "./renderer";

const gpuiKit = (await import("gpui-kit" as string)) as {
  div: () => unknown;
  svg: (path: string) => unknown;
};
const gpuiBase = (await import("gpui-base" as string)) as {
  InputState: {
    new: (options?: { placeholder?: string; value?: string }) => FakeInput;
  };
  ScrollHandle: { new: () => { scroll_to_item(index: number): void; release(): boolean } };
  TextView: { markdown: (id: string, markdown: string) => unknown };
};
const herdr = (await import("herdr" as string)) as {
  agents: () => unknown[];
  placement: () => unknown;
  readTextFile: (path: string) => Promise<string | null>;
  theme: () => Record<string, string>;
};

afterEach(() => useRenderer({}));

test("records TextView identity and markdown separately from constructor arguments", () => {
  const view = gpuiBase.TextView.markdown("readme", "**Hello**");
  expect(nodeOf(view).styles).toMatchObject({
    ctor: ["readme", "**Hello**"],
    id: "readme",
    markdown: "**Hello**",
  });
  expect(byId(view, "readme")).toBe(nodeOf(view));
});

test("validates each color-taking GPUI builder against concrete hex colors", () => {
  const methods = ["bg", "border_color", "text_bg", "text_color"] as const;
  const colors = ["#abc", "#aabbcc", "#aabbccdd"];
  const builder = gpuiKit.div() as Record<string, (...args: unknown[]) => unknown>;
  for (const method of methods) {
    for (const color of colors) expect(() => builder[method]!(color)).not.toThrow();
    for (const color of ["green", "#12", "#gggggg", "#aabbccddeeff"]) {
      expect(() => builder[method]!(color)).toThrow(`Invalid color passed to ${method}`);
    }
    expect(() => builder[method]!()).toThrow(`Invalid color passed to ${method}`);
  }
});

test("theme values are concrete colors and fixture-backed Herdr functions are forwarded", async () => {
  const path = "/fixture/readme.md";
  useRenderer({
    herdr: {
      agents: () => ["agent"],
      readTextFile: async (requestedPath) => `fixture:${requestedPath}`,
    },
  });
  expect(herdr.agents()).toEqual(["agent"]);
  await expect(herdr.readTextFile(path)).resolves.toBe(`fixture:${path}`);
  expect(herdr.theme().dim).toMatch(/^#[\da-f]{3}(?:[\da-f]{3}|[\da-f]{5})?$/i);
  expect(herdr.theme().unconfigured).toBeUndefined();
});

test("accepts per-suite GPUI factory and native Herdr overrides", () => {
  const customDiv = {};
  const customPlacement = { pane: "pane-1" };
  useRenderer({
    kit: { div: () => customDiv },
    native: { placement: () => customPlacement },
  });
  expect(gpuiKit.div()).toBe(customDiv);
  expect(herdr.placement()).toBe(customPlacement);
});

test("InputState supports content, retained values, events, and fixture initial text", () => {
  useRenderer({ inputText: "initial" });
  const input = gpuiBase.InputState.new({ placeholder: "Filter" });
  const changed: string[] = [];
  expect(input.placeholder).toBe("Filter");
  expect(input.content()).toEqual({ text: "initial" });
  expect(input.value()).toBe("initial");
  expect(input.on("change", () => changed.push(input.value()))).toBe(true);
  input.set_value("next");
  input.handlers.get("change")!({}, {});
  expect(changed).toEqual(["next"]);
});

test("ScrollHandle and coordinate-compatible node aliases are available", () => {
  const handle = gpuiBase.ScrollHandle.new();
  expect(handle.release()).toBe(true);
  expect(() => handle.scroll_to_item(2)).not.toThrow();
  const root = gpuiKit.div() as { child: (value: unknown) => unknown };
  const child = gpuiKit.svg("icons/check.svg") as { id: (value: string) => unknown };
  const identified = child.id("check");
  root.child(identified);
  root.child("label");
  expect(nodeOf(root).nodes).toBe(nodeOf(root).children);
  expect(nodeOf(identified).elementId).toBe("check");
  expect(texts(root)).toEqual(["label"]);
});
