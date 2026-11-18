import { expect, test } from "bun:test";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyIcons } from "./assets";
import { BUNDLED_ICONS } from "./icons";

test("copyIcons writes every icon, or the ones named, into a mod folder", async () => {
  const root = await mkdtemp(join(tmpdir(), "herdr-ui-"));
  try {
    const all = join(root, "all");
    await copyIcons(all);
    expect((await readdir(all)).sort()).toEqual(Object.values(BUNDLED_ICONS).sort());
    const some = join(root, "some");
    expect(await copyIcons(some, ["globe"])).toEqual([join(some, "globe.svg")]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
