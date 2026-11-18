# herdr-ui

`@wyattjoh/herdr-ui`: the Tasks Herdr panel's visual system as a public npm package of TypeScript sources. User-facing usage is in README.md; this file is the contributor and agent contract.

## Commands

- `bun install`, then `node_modules/.bin/lefthook install` if `.git/hooks/pre-commit` is missing. Lefthook checks staged files with oxfmt and oxlint (`lefthook.yml`, `min_version: 2.2.2` for parallel worktrees).
- `bun run format` formats. `bun run check` is the single gate and runs, in order:
  - `format:check` (oxfmt) and `lint` (`oxlint --deny-warnings`);
  - `typecheck` (`scripts/typecheck.ts`): the Bun pass (`tsconfig.json`: pure modules, scripts, tests), then the native pass, which writes `.scratch/tsconfig.native.json` and checks every source module and `examples/` against `gpui-kit.d.ts`/`herdr.d.ts` in `$HERDR_APP_HOME` (default `~/.config/herdr-app`);
  - `test` (`bun test`, preloading `src/test/renderer.ts` through `bunfig.toml`);
  - `pack:check` (`scripts/pack-check.ts`): asserts `npm pack --dry-run` ships only `src/**/*.ts` without tests or `src/test/`, `assets/icons/*.svg`, `licenses/*.txt`, README, LICENSE, NOTICE and package.json, and writes `.scratch/pack-listing.txt`;
  - `mod:check` (`scripts/gallery.ts`): packs the tarball, installs it into `.scratch/gallery/consumer`, bundles `examples/gallery/main.ts` with the consumers' flags (`--target bun`, `gpui-kit`/`gpui-base`/`herdr` external), fails if the build-side helper leaked into the bundle, copies icons with the installed `./assets` helper and runs `herdr-app check` with `.scratch/gallery/stage` as `HERDR_APP_HOME`. It never touches the live Herdr home.
- GitHub CI (`.github/workflows/ci.yml`) runs what works without Herdr: `format:check`, `lint`, `typecheck:bun`, `test`, `pack:check`. The native typecheck and `mod:check` need an installed Herdr home, so they are local only. A change is done when `bun run check` passes locally.

## Layout

- `src/*.ts` are pure: no `gpui-kit`, `gpui-base` or `herdr` import, not even type-only. `src/pure.ts` re-exports them for `@wyattjoh/herdr-ui/pure`.
- `src/ui/*.ts` are element functions; `src/index.ts` re-exports pure and ui modules for `.`. A new ui module goes in `src/ui/` (excluded from the Bun-side `tsconfig.json`) and in `src/index.ts`.
- `src/assets.ts` is build-side only (`node:fs`), exported as `./assets`, and excluded from the native pass.
- `assets/icons/` holds the bundled SVGs; `BUNDLED_ICONS` in `src/icons.ts` must name exactly those files (a test checks both directions). Add an icon only with known provenance and a permissive license, recorded in NOTICE.md; never Remix Icon glyphs or the Tasks Status/Priority artwork.
- Tests sit beside their module (`*.test.ts`); `src/test/renderer.ts` mocks `gpui-kit`/`gpui-base` with recording elements and `src/test/theme.ts` gives a theme whose colors name their roles.

## Conventions

- Look parity with the Tasks panel is the contract: element chains are copied from `tasks/herdr/src/view.ts` in the same call order, and their numbers live in `src/tokens.ts` or `src/toolbar.ts`. Don't normalise a value without changing it in Tasks too. Pieces Tasks doesn't have (`staticRow`, `cardItem`, `toggleChip`, `CHIP.dotSize`) come from the CI panel in herdr-git-forge (`src/mods/panel/`); `togglePill` follows both toggles.
- Pieces stay domain-neutral: ids, labels, icons, tones and heights are parameters. Domain status maps belong to consumers (`toneMap` turns their states into tones).
- Write for strict TypeScript with extensionless relative imports: consumers compile the shipped sources (Tasks without `strictNullChecks`, the CI panel strict).
- Data types use `| undefined` over `?`; option bags for element functions use `?` for optional styling so call sites stay short.
- Every export has a multi-line JSDoc comment.
- Conventional Commits. release-please (`release-please-config.json`) owns versions and CHANGELOG.md; `.github/workflows/release.yml` publishes the tag to npm with trusted publishing.
