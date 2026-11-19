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

`checkMods(stageHome, names)` checks each `<stageHome>/mods/<name>` sequentially, setting `HERDR_APP_HOME` to `stageHome`. It returns `{ name, outcome, cached }[]`; any non-PASS result throws. Other exports are `withCheckLock(action, lockPath?, waitMs?)`, `hashTree(directory)`, and `classifyCheck(output, exitCode, timedOut?)`; `CheckOutcome` is the corresponding outcome union. Test suites should import the shared test renderer from `@wyattjoh/herdr-dev/test/renderer` (the `./renderer` export is retained as an alias). It mocks `gpui-kit`, `gpui-base`, and `herdr`, and exports `Node`, `nodeOf`, `walk`, `byId`, and `texts` for recorded element trees.

A fixture-backed suite can override Herdr responses and initial input text:

```ts
import { beforeEach } from "bun:test";
import { useRenderer, type HerdrFixture } from "@wyattjoh/herdr-dev/test/renderer";

const herdr: HerdrFixture = {
  agents: () => [],
  appHome: () => "/test",
  exec: () => null,
  focused: () => null,
  layout: () => ({}),
  layouts: () => [],
  nextCommand: async () => "",
  panes: () => [],
  props: () => ({}),
  readTextFile: async () => null,
  run: () => null,
  setShared: () => null,
  shared: () => undefined,
  spaces: () => [],
  terminals: () => [],
  theme: () => ({ foreground: "#ffffff" }),
  watchFolder: () => undefined,
};

beforeEach(() => useRenderer({ herdr, inputText: "" }));
```

Suites that need custom element factories can instead pass partial `useRenderer({ kit, base, native })` overrides; omitted factories and Herdr delegates use the shared defaults. `InputState` supports `content()`, `value()`, `set_value()`, and event registration; `ScrollHandle.new()` returns a scroll handle double. `TextView.markdown(id, markdown)` records both `styles.id` and `styles.markdown` while retaining `styles.ctor`.

The renderer checks `bg`, `border_color`, `text_bg`, and `text_color` arguments against the host's concrete `#rgb`, `#rrggbb`, or `#rrggbbaa` forms. Read semantic theme colors from `cx.theme().colors`; passing bare token names such as `"green"` throws in tests just as it does in the host. The renderer also exports the coordinate tests' host helpers (`host`, `resetHost`, `sendCommand`, `context`, `settle`, `get`, `find`, `ids`, `text`, and `typeInto`).

To preload the renderer in Bun, set `preload: ["@wyattjoh/herdr-dev/test/renderer"]` in the consumer's `bunfig.toml`, or run `bun --preload @wyattjoh/herdr-dev/test/renderer test`.

The render-driven-sync lint enforces the concrete R5 rule: direct numeric literal arguments to `cx.timer.every(...)` must be at least 5000 ms. `check:fast` scans `packages/dev/src` and `packages/ui/src` (excluding `*.test.ts` and declarations). Consumers can run `bunx herdr-render-sync src [other/source/roots...]` to check their source trees. A fast timer may be explicitly exempted by placing `// herdr-render-sync-allow: <reason>` on the immediately preceding line; the reason is required. Intervals below the threshold without this comment are violations, while computed values and other timer APIs are outside this narrow check.
