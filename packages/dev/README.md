# @wyattjoh/herdr-dev

Shared development-only tooling for Herdr mods. This package is a devDependency; do not import it from runtime mod bundles.

## Split gates and timing budgets

- `bun run check:fast` runs the render-sync lint, TypeScript check, and pure tests. Warm target: **15 seconds or less** for this package; allow additional time on cold installs or loaded hosts.
- `bunx herdr-check <stage-home> <mod-name...>` runs native validation; a quiet-machine budget is **about 26 seconds per mod**, with load-dependent variance. It serializes through the shared lock and reports per-mod outcomes.

A caller's outer timeout is only a supervision limit: if it expires, the check result is unknown/incomplete, not a native validation failure. Use a sufficiently long bounded wait and inspect the runner's output. The runner's own watchdog is distinct and classifies an attempt as `WATCHDOG`; connect-deadline outcomes are retryable infrastructure events, not validation failures.

Run staged mods through the installed CLI:

```sh
bunx herdr-check <stage-home> <mod-name> [mod-name...]
```

Each folder is `<stage-home>/mods/<name>`. The runner serializes native checks across repos/worktrees using `~/.cache/herdr-check/lock` (15-minute wait by default), reclaims dead same-host owners, removes stale `dev.herdr.check.*` launchd jobs where available, and caches successful checks by staged-folder content hash and `herdr-app` version under `~/.cache/herdr-check/results/`. Set `HERDR_CHECK_CACHE=0` to bypass the cache, `HERDR_CHECK_TIMEOUT_MS` to set the attempt watchdog, and `HERDR_CHECK_LOCK_WAIT_MS` to set lock wait. Connect-deadline outcomes are retried indefinitely with exponential backoff (capped at 60 seconds) and never classified as validation failures.

## API

```ts
import { checkMods } from "@wyattjoh/herdr-dev";
const results = await checkMods(stageHome, ["tasks-panel", "tasks-status"]);
```

`checkMods(stageHome, names)` checks each `<stageHome>/mods/<name>` sequentially, setting `HERDR_APP_HOME` to `stageHome`. It returns `{ name, outcome, cached }[]`; any non-PASS result throws. Other exports are `withCheckLock(action, lockPath?, waitMs?)`, `hashTree(directory)`, and `classifyCheck(output, exitCode, timedOut?)`; `CheckOutcome` is the corresponding outcome union. Test suites should import `Node`, `nodeOf`, `walk`, `byId`, and `texts` from the stable test-only export `@wyattjoh/herdr-dev/test/renderer` (the `./renderer` export is retained as an alias). To preload it in Bun, set `preload: ["@wyattjoh/herdr-dev/test/renderer"]` in the consumer's `bunfig.toml`, or run `bun --preload @wyattjoh/herdr-dev/test/renderer test`.

The render-driven-sync lint enforces the concrete R5 rule: direct numeric literal arguments to `cx.timer.every(...)` must be at least 5000 ms. `check:fast` scans `packages/dev/src` and `packages/ui/src` (excluding `*.test.ts` and declarations). Consumers can run `bunx herdr-render-sync src [other/source/roots...]` to check their source trees. No allowlist comment syntax is supported; intervals below the threshold are violations, while computed values and other timer APIs are outside this narrow check.
