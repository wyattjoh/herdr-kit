# herdr-kit

`herdr-kit` is a Bun workspace monorepo for Herdr mod libraries and development tooling. The package READMEs are the consumer guides; this file records contributor conventions.

## Commands

- Install once at the root with `bun install`. Install Lefthook with `node_modules/.bin/lefthook install` if `.git/hooks/pre-commit` is missing. Root Lefthook checks staged files with oxfmt and oxlint.
- `bun run format` formats the workspace. `bun run check:fast` runs formatting, lint, and every package's fast gate. `bun run check:native` runs Herdr-dependent checks; `bun run check` runs both.
- Native checks require an installed Herdr home (`HERDR_APP_HOME`, default `~/.config/herdr-app`). They use the `@wyattjoh/herdr-dev` runner, which serializes checks machine-wide, cleans up stale `dev.herdr.check.*` launchd jobs, retries connect deadlines, and caches unchanged staged mods.
- Use the package scripts with `bun run --filter @wyattjoh/herdr-ui <script>` or `bun run --filter @wyattjoh/herdr-dev <script>` for focused work.

## Layout

- `packages/ui` is the public `@wyattjoh/herdr-ui` package. Keep its package name, exports, published file allowlist, and mod runtime behavior stable. `src/*.ts` contains pure modules; `src/ui/*.ts` contains GPUI element functions; `src/assets.ts` is build-side only. `examples/gallery` proves the published package shape.
- `packages/dev` is `@wyattjoh/herdr-dev`, a development-only dependency. It owns shared check execution and cache logic plus renderer test doubles. Mod runtime code must not import it.
- `packages/runtime` is planned; do not create or assume it exists as part of package work unless the task asks for it.
- Root `package.json` and `bun.lock` own the workspace and common toolchain. Release-please owns package versions and changelogs.

## UI conventions

- Preserve parity with the Tasks panel: element chains follow `tasks/herdr/src/view.ts` call order, and shared measurements live in `packages/ui/src/tokens.ts` or `toolbar.ts`. Do not normalize a value without changing Tasks too. Pieces without a Tasks counterpart follow the CI panel in herdr-git-forge; `togglePill` follows both toggles.
- Keep components domain-neutral. Pass ids, labels, icons, tones, and heights in; consumers map domain states to tones with `toneMap`.
- Write strict TypeScript with extensionless relative imports. Data types use `| undefined` instead of `?`; element-function option bags may use `?` for optional styling.
- Every export has a multi-line JSDoc comment. Tests live beside modules and use the shared `@wyattjoh/herdr-dev/test/renderer` harness; package-specific theme fixtures stay with their tests.
- Icons in `packages/ui/assets/icons/` need known provenance and a permissive license recorded in `packages/ui/NOTICE.md`. Do not add Remix Icon glyphs or Tasks Status/Priority artwork.

## Releases and commits

- Use Conventional Commits. Use `ui` and `dev` scopes where applicable; use `feat(dev):` for development-tooling features. A move or workspace restructuring is `refactor:` or `build:`. Avoid `feat(ui)` / `fix(ui)` unless the UI package itself changes.
- Release-please manifest entries live in `.release-please-manifest.json`; packages release independently with `ui-vX.Y.Z` and `dev-vX.Y.Z` tags. Do not publish manually or edit versions/changelogs outside release-please.
