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
