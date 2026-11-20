import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyIcons, copyNotices } from "./assets";

test("copyIcons writes the named icons into a mod folder", async () => {
  const root = await mkdtemp(join(tmpdir(), "herdr-ui-"));
  try {
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
    const files = ["LICENSE", "NOTICE.md", join("licenses", "lucide.txt")];
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
