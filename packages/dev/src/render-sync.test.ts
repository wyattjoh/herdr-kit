import { expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findFastTimers } from "./render-sync";

test("flags only direct numeric cx.timer.every intervals below five seconds", async () => {
  const dir = await mkdtemp(join(tmpdir(), "herdr-render-sync-"));
  await writeFile(
    join(dir, "mod.ts"),
    "cx.timer.every(4999); cx.timer.every(5_000); cx.timer.every(delay);",
  );
  expect(await findFastTimers(dir)).toHaveLength(1);
});

test("allows a fast timer only with an inline allow comment and reason", async () => {
  const dir = await mkdtemp(join(tmpdir(), "herdr-render-sync-"));
  await writeFile(
    join(dir, "mod.ts"),
    [
      "// herdr-render-sync-allow: watch host while hidden",
      "cx.timer.every(1000);",
      "// herdr-render-sync-allow:",
      "cx.timer.every(2000);",
      "// herdr-render-sync-allow: reason must be directly above",
      "const unrelated = true;",
      "cx.timer.every(3000);",
    ].join("\n"),
  );
  const violations = await findFastTimers(dir);
  expect(violations).toHaveLength(2);
  expect(violations[0]).toContain("every(2000)");
  expect(violations[1]).toContain("every(3000)");
});
