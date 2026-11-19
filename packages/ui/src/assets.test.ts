import { expect, test } from "bun:test";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyIcons, copyNotices } from "./assets";
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

test("copyNotices stages LICENSE, NOTICE.md and all licence texts with their relative paths", async () => {
  const root = await mkdtemp(join(tmpdir(), "herdr-ui-notices-"));
  try {
    const destination = join(root, "mod");
    const source = join(import.meta.dir, "..");
    const licenses = (await readdir(join(source, "licenses")))
      .filter((name) => name.endsWith(".txt"))
      .sort();
    const files = ["LICENSE", "NOTICE.md", ...licenses.map((name) => join("licenses", name))];
    expect(await copyNotices(destination)).toEqual(files.map((file) => join(destination, file)));
    for (const file of files) {
      expect(await readFile(join(destination, file), "utf8")).toBe(
        await readFile(join(source, file), "utf8"),
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
