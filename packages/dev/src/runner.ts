import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { lstatSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir, hostname, loadavg } from "node:os";
import { dirname, join } from "node:path";

/** Checker outcome classes distinguish validation failures from infrastructure deadlines. */
export type CheckOutcome = "PASS" | "FAIL" | "CONNECT_DEADLINE" | "WATCHDOG";

type Owner = { pid: number; hostname: string; startedAt: number; token: string };
const defaultLock = join(homedir(), ".cache/herdr-check/lock");

/**
 * Acquire the shared host lock, execute the action, and release it on completion.
 * Dead same-host owners are reclaimed; inaccessible or foreign owners fail closed.
 * @param action Work performed under the exclusive lock.
 * @param lockPath Override for isolated tests.
 * @param waitMs Maximum lock wait in milliseconds.
 * @returns The action result.
 */
export async function withCheckLock<T>(
  action: (onInterrupt: (cleanup: () => Promise<void>) => void) => Promise<T>,
  lockPath = defaultLock,
  waitMs = 900_000,
): Promise<T> {
  await mkdir(dirname(lockPath), { recursive: true });
  const token = crypto.randomUUID();
  const pending = `${lockPath}.pending-${process.pid}-${token}`;
  await mkdir(pending);
  const owner: Owner = { pid: process.pid, hostname: hostname(), startedAt: Date.now(), token };
  await writeFile(join(pending, "owner.json"), JSON.stringify(owner));
  const deadline = Date.now() + waitMs;
  let held = false;
  let handlingSignal = false;
  const cleanups: (() => Promise<void>)[] = [];
  const releaseSync = () => {
    if (!held) return;
    try {
      const before = lstatSync(lockPath, { bigint: true });
      const current = JSON.parse(readFileSync(join(lockPath, "owner.json"), "utf8")) as Owner;
      if (current.token !== token) return;
      writeFileSync(join(lockPath, ".fence"), `release:${token}`, { flag: "wx" });
      const after = lstatSync(lockPath, { bigint: true });
      const fence = readFileSync(join(lockPath, ".fence"), "utf8");
      if (before.dev !== after.dev || before.ino !== after.ino || fence !== `release:${token}`)
        return;
      const tombstone = `${lockPath}.released-${token}`;
      renameSync(lockPath, tombstone);
      rmSync(tombstone, { recursive: true, force: true });
    } catch {}
    held = false;
  };
  const interrupted = async (signal: NodeJS.Signals) => {
    if (handlingSignal) return;
    handlingSignal = true;
    for (const cleanup of cleanups.reverse()) {
      try {
        await cleanup();
      } catch (error) {
        console.warn("Checker interrupt cleanup failed", error);
      }
    }
    releaseSync();
    try {
      rmSync(pending, { recursive: true, force: true });
    } catch {}
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  const onInt = () => void interrupted("SIGINT");
  const onTerm = () => void interrupted("SIGTERM");
  const onExit = () => releaseSync();
  process.on("SIGINT", onInt);
  process.on("SIGTERM", onTerm);
  process.on("exit", onExit);
  const deadlineForOwner = (path: string): boolean => {
    try {
      const before = lstatSync(path, { bigint: true });
      let current: Owner;
      try {
        current = JSON.parse(readFileSync(join(path, "owner.json"), "utf8")) as Owner;
      } catch {
        return false;
      }
      if (current.hostname !== hostname()) return false;
      try {
        process.kill(current.pid, 0);
        return false;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") return false;
      }
      // A shared exclusive fence arbitrates with other reclaimers and release.
      try {
        writeFileSync(join(path, ".fence"), `reclaim:${current.token}`, { flag: "wx" });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
        throw error;
      }
      const after = lstatSync(path, { bigint: true });
      const fence = readFileSync(join(path, ".fence"), "utf8");
      if (
        before.dev !== after.dev ||
        before.ino !== after.ino ||
        fence !== `reclaim:${current.token}`
      )
        return false;
      const tombstone = `${lockPath}.stale-${current.token}`;
      try {
        renameSync(path, tombstone);
        return true;
      } catch (error) {
        if (["ENOENT", "EEXIST", "ENOTEMPTY"].includes((error as NodeJS.ErrnoException).code ?? ""))
          return false;
        throw error;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
      throw error;
    }
  };
  try {
    while (!held) {
      try {
        await rename(pending, lockPath);
        held = true;
      } catch (error) {
        if (!["EEXIST", "ENOTEMPTY"].includes((error as NodeJS.ErrnoException).code ?? ""))
          throw error;
        if (deadlineForOwner(lockPath)) continue;
        if (Date.now() >= deadline)
          throw new Error(`Timed out waiting for shared Herdr checker lock: ${lockPath}`);
        await Bun.sleep(250);
      }
    }
    return await action((cleanup) => cleanups.push(cleanup));
  } finally {
    process.off("SIGINT", onInt);
    process.off("SIGTERM", onTerm);
    process.off("exit", onExit);
    releaseSync();
    try {
      await rm(pending, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Hash all regular files under a directory in stable relative-path order.
 * @param directory Staged mod folder.
 * @returns A SHA-256 digest of names and bytes.
 */
export async function hashTree(directory: string): Promise<string> {
  const files: string[] = [];
  const visit = async (dir: string) => {
    for (const entry of await (
      await import("node:fs/promises")
    ).readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  await visit(directory);
  files.sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash
      .update(file.slice(directory.length))
      .update("\0")
      .update(await readFile(file))
      .update("\0");
  }
  return hash.digest("hex");
}

/**
 * Classify checker output, treating connection deadlines as retryable infrastructure errors.
 * @param output Combined checker output.
 * @param exitCode Process exit status.
 * @param timedOut Whether the watchdog expired.
 * @returns The categorized outcome.
 */
export function classifyCheck(output: string, exitCode: number, timedOut = false): CheckOutcome {
  if (timedOut) return "WATCHDOG";
  if (/did not connect before its deadline|checker.*connect.*deadline/i.test(output))
    return "CONNECT_DEADLINE";
  return exitCode === 0 ? "PASS" : "FAIL";
}

/**
 * Parse matching launchd rows without treating a live PID as a stale job.
 * @param output Output from `launchctl list`.
 * @returns Matching labels, active PIDs, and owner PIDs encoded in labels.
 */
export function launchdRows(
  output: string,
): { label: string; pid: number | undefined; ownerPid: number | undefined }[] {
  return output.split("\n").flatMap((line) => {
    const columns = line.trim().split(/\s+/);
    const label = columns.at(-1);
    if (!label?.startsWith("dev.herdr.check.")) return [];
    const parsed = Number(columns[0]);
    const owner = /^dev\.herdr\.check\.(\d+)(?:\.|$)/.exec(label)?.[1];
    return [
      {
        label,
        pid: Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined,
        ownerPid: owner === undefined ? undefined : Number(owner),
      },
    ];
  });
}

/**
 * Check whether a listed launchd PID is alive, treating permission denial as live.
 * @param pid PID reported by launchd, or undefined for an inactive row.
 * @param probe Injectable process probe for deterministic tests.
 * @returns Whether cleanup must preserve the job.
 */
export function isLaunchdJobLive(
  pid: number | undefined,
  probe: (pid: number, signal?: NodeJS.Signals | number) => unknown = process.kill.bind(process),
): boolean {
  if (pid === undefined) return false;
  try {
    probe(pid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return false;
    if ((error as NodeJS.ErrnoException).code === "EPERM") return true;
    throw error;
  }
}

async function staleLaunchdJobs(): Promise<void> {
  if (process.platform !== "darwin") return;
  const result = Bun.spawnSync(["launchctl", "list"]);
  if (result.exitCode !== 0) throw new Error("Unable to inspect launchd checker jobs");
  for (const { label, pid, ownerPid } of launchdRows(result.stdout.toString())) {
    // Keep both a live checker PID and its live launcher PID registered with launchd.
    if (isLaunchdJobLive(pid) || isLaunchdJobLive(ownerPid)) continue;
    Bun.spawnSync(["launchctl", "remove", label]);
  }
}

async function stopAndReap(child: ReturnType<typeof Bun.spawn>): Promise<void> {
  child.kill("SIGTERM");
  const grace = new Promise<"grace">((resolve) => setTimeout(() => resolve("grace"), 2_000));
  const exited = child.exited.then(() => "exited" as const);
  if ((await Promise.race([exited, grace])) === "grace") {
    child.kill("SIGKILL");
    await child.exited;
  }
}

async function appVersion(): Promise<string> {
  const result = Bun.spawnSync(["herdr-app", "--version"]);
  return result.exitCode === 0 ? result.stdout.toString().trim() : "unknown";
}

/**
 * Validate staged mod folders serially, skipping unchanged successful checks.
 * @param stageHome Isolated Herdr app home containing `mods/`.
 * @param names Mod folder names to validate.
 * @returns Per-mod cached or executed outcomes.
 */
export async function checkMods(
  stageHome: string,
  names: string[],
): Promise<{ name: string; outcome: CheckOutcome; cached: boolean }[]> {
  const cacheDir = join(homedir(), ".cache/herdr-check/results");
  await mkdir(cacheDir, { recursive: true });
  const app = await appVersion();
  const results = [];
  for (const name of names) {
    const directory = join(stageHome, "mods", name);
    const key = createHash("sha256")
      .update(`${await hashTree(directory)}\0${app}`)
      .digest("hex");
    const cachePath = join(cacheDir, `${key}.json`);
    if (process.env.HERDR_CHECK_CACHE !== "0" && (await Bun.file(cachePath).exists())) {
      results.push({ name, outcome: "PASS" as const, cached: true });
      console.log(`${name}: PASS (cached)`);
      continue;
    }
    const outcome = await withCheckLock(
      async (onInterrupt) => {
        for (let attempt = 0; ; attempt++) {
          await staleLaunchdJobs();
          const timeout = Number(
            process.env.HERDR_CHECK_TIMEOUT_MS ?? Math.max(180_000, loadavg()[0] * 30_000),
          );
          const child = Bun.spawn(["herdr-app", "check", directory], {
            env: { ...process.env, HERDR_APP_HOME: stageHome },
            stdout: "pipe",
            stderr: "pipe",
          });
          let timedOut = false;
          const reap = () => stopAndReap(child);
          onInterrupt(reap);
          const timer = setTimeout(() => {
            timedOut = true;
            void reap();
          }, timeout);
          const [code, stdout, stderr] = await Promise.all([
            child.exited,
            new Response(child.stdout).text(),
            new Response(child.stderr).text(),
          ]);
          clearTimeout(timer);
          const output = stdout + stderr;
          const classification = classifyCheck(output, code, timedOut);
          if (classification !== "CONNECT_DEADLINE") {
            if (classification === "PASS" && process.env.HERDR_CHECK_CACHE !== "0")
              await writeFile(cachePath, JSON.stringify({ key, outcome: "PASS" }));
            console.log(`${name}: ${classification} (${timeout}ms budget)`);
            return classification;
          }
          console.warn(
            `${name}: connect deadline; retry ${attempt + 1} after infrastructure backoff`,
          );
          await Bun.sleep(Math.min(60_000, 1_000 * 2 ** Math.min(attempt, 6)));
        }
      },
      defaultLock,
      Number(process.env.HERDR_CHECK_LOCK_WAIT_MS ?? 900_000),
    );
    results.push({ name, outcome, cached: false });
    if (outcome !== "PASS") throw new Error(`herdr-app check ${outcome.toLowerCase()} for ${name}`);
  }
  return results;
}
