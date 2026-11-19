# @wyattjoh/herdr-ui

The Tasks Herdr panel's visual system as reusable, domain-neutral pieces for [Herdr](https://herdr.dev) mods: theme tokens and tones, the panel button and toolbar fitting, the frame and top bar, breadcrumbs and the title row, listing cards with collapsible groups and static rows, label, toggle and count chips, the tab-row toggle pill, tabs, the menu surface, scroll regions, empty/error/loading blocks, and icons.

## Install

```sh
bun add @wyattjoh/herdr-ui
```

The package ships TypeScript sources and has no runtime dependencies. Its element functions import `gpui-kit`, `gpui-base` and `herdr`, which Herdr provides at runtime, so bundle the mod with Bun and keep all three external:

```sh
bun build src/main.ts --outfile <stage>/mods/<mod>/main.js --format esm --target bun \
  --external gpui-kit --external gpui-base --external herdr
```

Typecheck the mod against the declarations Herdr writes into its home (`~/.config/herdr-app/gpui-kit.d.ts` and `herdr.d.ts`), as the consumers already do.

## Entry points

| Import                      | Holds                                                                                                   | Imports gpui-kit or herdr                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `@wyattjoh/herdr-ui`        | everything below plus the element functions                                                             | yes, for mod bundles                           |
| `@wyattjoh/herdr-ui/pure`   | tokens, tones, color helpers, button style and label fitting, menu metrics, icon paths, `RecordScrolls` | no: safe in tests and a Bun-side `tsc`         |
| `@wyattjoh/herdr-ui/assets` | `copyIcons` and `copyNotices`, for build scripts                                                        | no, uses `node:fs`; never import it from a mod |

## Icons

Herdr resolves `svg()` paths against its home, so a bundled icon lives at `mods/<mod folder>/<file>`. Copy the icons into the staged folder from the build script, and build paths from the same folder name:

```ts
// scripts/build.ts
import { copyIcons, copyNotices } from "@wyattjoh/herdr-ui/assets";
const modDir = join(stage, "mods", "my-panel");
await copyIcons(modDir);
await copyNotices(modDir);

// src/main.ts
import { panelIcons } from "@wyattjoh/herdr-ui";
const ICONS = panelIcons("my-panel"); // ICONS.openInBrowser === "mods/my-panel/globe.svg"
```

`panelIcons` maps the Tasks panel's control roles; `bundledIconPaths("my-panel")` gives every bundled icon by name, including `tag` and `refresh`. `HERDR_ICONS` names icons Herdr ships with its own mods (`mods/workspace-chrome/…`, `mods/files/…`); those are referenced, never copied. `copyNotices` stages `LICENSE`, `NOTICE.md` and all `licenses/*.txt` files beside the mod while preserving the notice's relative links.

## Consumer options

`crumbPicker` uses each option's `key` for row ids, selection and `pick`; if omitted, it falls back to `name`. `titleRow` accepts `trailingId` to preserve an existing slot identity such as `page-title-copy`. `panelBody` accepts a separate `contentId` and an optional `measure({ width, height })` callback on the outer body. `button` accepts `spin` in milliseconds and an opt-in `truncateLabel` for a constrained, ellipsized label. `toneMap` includes the `accent` tone for the host theme's accent role. `stateBlock` accepts an optional root `id`; `errorState` accepts a tone and defaults to `danger`.

## Example

```ts
import { View } from "gpui-kit";
import { theme } from "herdr";
import {
  button,
  card,
  cardHeader,
  cardSection,
  groupBlock,
  listRow,
  panelFrame,
  panelIcons,
  toneMap,
  type Theme,
} from "@wyattjoh/herdr-ui";

const ICONS = panelIcons("my-panel");
const tone = toneMap({ running: "active", passed: "success", failed: "danger" });

export default class Panel extends View {
  render() {
    const t = theme() as Theme;
    return panelFrame(t, "my-panel", undefined).child(
      cardSection(
        cardHeader(t, "runs-header", "Runs"),
        card(t, "runs").child(
          groupBlock(t, "runs", {
            id: "runs-passed",
            label: "Passed",
            tone: tone("passed"),
            count: 1,
            rows: [listRow(t, { id: "run-1", label: "#1", title: "Build", onClick: () => {} })],
            rowHeight: 34,
            open: true,
            first: true,
            last: true,
            toggle: () => {},
          }),
        ),
      ),
    );
  }
}
```

[examples/gallery/main.ts](examples/gallery/main.ts) uses every piece once.

## Development

`bun run check` is the gate: `format:check`, `lint`, `typecheck` (Bun side, then native against an installed Herdr home), `test`, `pack:check` and `mod:check`. See [AGENTS.md](AGENTS.md).
