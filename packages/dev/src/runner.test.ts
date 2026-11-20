import { describe, expect, spyOn, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import {
  classifyCheck,
  reportCheckResult,
  hashTree,
  isLaunchdJobLive,
  launchdRows,
  withCheckLock,
} from "./runner";

describe("shared check runner pure logic", () => {
  test("classifies deadlines as retryable infrastructure outcomes", () => {
    expect(classifyCheck("checker job did not connect before its deadline", 1)).toBe(
      "CONNECT_DEADLINE",
    );
    expect(classifyCheck("checker job did not connect before its deadline", 1, true)).toBe(
      "WATCHDOG",
    );
    expect(classifyCheck("invalid manifest", 1)).toBe("FAIL");
    expect(classifyCheck("", 0)).toBe("PASS");
    expect(classifyCheck("", 1, true)).toBe("WATCHDOG");
  });

  test("prints checker diagnostics for real failures only", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const error = spyOn(console, "error").mockImplementation(() => {});
    reportCheckResult("coordinate-toggle", "FAIL", 180_000, "view failed: invalid color");
    reportCheckResult("coordinate-toggle", "WATCHDOG", 180_000, "partial output");
    expect(log).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith("view failed: invalid color");
    log.mockRestore();
    error.mockRestore();
  });

  test("changes when file content changes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "herdr-dev-hash-"));
    try {
      await mkdir(join(dir, "nested"));
      await writeFile(join(dir, "b"), "two");
      await writeFile(join(dir, "nested/a"), "one");
      const first = await hashTree(dir);
      await writeFile(join(dir, "nested/a"), "changed");
      expect(await hashTree(dir)).not.toBe(first);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("does not classify a live launchd job as stale", () => {
    expect(
      launchdRows(
        "PID\tStatus\tLabel\n4321\t0\tdev.herdr.check.live\n-\t0\tdev.herdr.check.9876.nonce\n-\t0\tdev.herdr.check.dead",
      ),
    ).toEqual([
      { label: "dev.herdr.check.live", pid: 4321, ownerPid: undefined },
      { label: "dev.herdr.check.9876.nonce", pid: undefined, ownerPid: 9876 },
      { label: "dev.herdr.check.dead", pid: undefined, ownerPid: undefined },
    ]);
    expect(isLaunchdJobLive(4321, () => undefined)).toBe(true);
    expect(
      isLaunchdJobLive(4321, () => {
        throw Object.assign(new Error(), { code: "ESRCH" });
      }),
    ).toBe(false);
    expect(
      isLaunchdJobLive(4321, () => {
        throw Object.assign(new Error(), { code: "EPERM" });
      }),
    ).toBe(true);
  });

  test("reclaims a dead same-host lock owner", async () => {
    const dir = await mkdtemp(join(tmpdir(), "herdr-dev-stale-lock-"));
    try {
      const path = join(dir, "lock");
      await mkdir(path);
      await writeFile(
        join(path, "owner.json"),
        JSON.stringify({
          pid: 2_147_483_647,
          hostname: hostname(),
          startedAt: Date.now(),
          token: "stale-owner",
        }),
      );
      const result = await withCheckLock(async () => "reclaimed", path, 1000);
      expect(result).toBe("reclaimed");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("releases the lock when an action fails", async () => {
    const dir = await mkdtemp(join(tmpdir(), "herdr-dev-failed-lock-"));
    const path = join(dir, "lock");
    await expect(
      withCheckLock(
        async () => {
          throw new Error("expected failure");
        },
        path,
        1000,
      ),
    ).rejects.toThrow("expected failure");
    await expect(withCheckLock(async () => "released", path, 1000)).resolves.toBe("released");
    await rm(dir, { recursive: true, force: true });
  });

  test("serializes actions through an isolated lock", async () => {
    const dir = await mkdtemp(join(tmpdir(), "herdr-dev-lock-"));
    const path = join(dir, "lock");
    await withCheckLock(async () => "done", path, 1000);
    let active = 0;
    let peak = 0;
    await Promise.all(
      [1, 2, 3].map(() =>
        withCheckLock(
          async () => {
            active++;
            peak = Math.max(peak, active);
            await Bun.sleep(10);
            active--;
          },
          path,
          1000,
        ),
      ),
    );
    expect(peak).toBe(1);
  });
});
