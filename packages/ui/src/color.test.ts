import { describe, expect, test } from "bun:test";
import { hexColor, opaqueOver, tint } from "./color";

describe("hexColor", () => {
  test("parses every hex length", () => {
    expect(hexColor("#fff")).toEqual([255, 255, 255, 1]);
    expect(hexColor("#11223344")).toEqual([0x11, 0x22, 0x33, 0x44 / 255]);
  });
  test("rejects non-hex", () => {
    expect(hexColor("red")).toBeUndefined();
    expect(hexColor("#12345")).toBeUndefined();
  });
});

describe("opaqueOver", () => {
  test("composites a translucent canvas over the surface", () => {
    expect(opaqueOver("#ffffff80", "#000000")).toBe("#808080");
  });
  test("keeps the surface under a fully transparent canvas", () => {
    expect(opaqueOver("#ffffff00", "var")).toBe("var");
  });
  test("keeps a non-hex canvas", () => {
    expect(opaqueOver("canvas", "#000000")).toBe("canvas");
  });
});

describe("tint", () => {
  test("replaces alpha on short and long colors", () => {
    expect(tint("#abc", "1f")).toBe("#aabbcc1f");
    expect(tint("#a1b2c3ff", "1f")).toBe("#a1b2c31f");
  });
});
