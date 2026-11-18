import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { BUNDLED_ICONS, bundledIconPaths, HERDR_ICONS, modFolderName, panelIcons } from "./icons";
import { ICONS_DIR } from "./assets";

describe("icons", () => {
  test("the name map and assets/icons agree both ways", async () => {
    const files = (await readdir(ICONS_DIR)).filter((name) => name.endsWith(".svg")).sort();
    expect<string[]>(Object.values(BUNDLED_ICONS).sort()).toEqual(files);
  });
  test("bundled paths resolve inside the consumer's mod folder", () => {
    expect(bundledIconPaths("herdr-git-forge-panel").globe).toBe(
      "mods/herdr-git-forge-panel/globe.svg",
    );
    expect(panelIcons("tasks-panel").pinned).toBe("mods/tasks-panel/pin-filled.svg");
    expect(panelIcons("tasks-panel").back).toBe(HERDR_ICONS.back);
  });
  test("refuse a folder name that isn't one directory", () => {
    for (const bad of ["", "a/b", "../x", ".hidden", "a b"])
      expect(() => modFolderName(bad)).toThrow();
  });
  test("Herdr's icons stay references to its shipped mods", () => {
    for (const path of Object.values(HERDR_ICONS))
      expect(path).toMatch(/^mods\/(workspace-chrome|files)\/[a-z-]+\.svg$/);
  });
});
