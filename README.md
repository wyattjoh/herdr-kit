# herdr-kit

A Bun workspace for shared tools used by Herdr mod projects.

## Packages

- [`@wyattjoh/herdr-ui`](packages/ui/README.md) — domain-neutral visual components, theme tokens, icon assets, and pure helpers for Herdr mods. Its package name, version line, exports, published files, and runtime behavior remain unchanged.
- [`@wyattjoh/herdr-dev`](packages/dev/README.md) — development-only tooling: the serialized, load-aware `herdr-app check` runner, its content-hash cache, and shared renderer test doubles. It is not a mod runtime dependency.
- `packages/runtime` is planned, but does not exist yet.

## Development

Requires Bun. Install dependencies once from the repository root:

```sh
bun install
bun run check:fast
bun run check:native
```

`bun run check:fast` runs formatting, lint, TypeScript, tests, and package checks. `bun run check:native` runs Herdr-dependent checks; it needs an installed Herdr home (by default `~/.config/herdr-app`). Native checks run through `@wyattjoh/herdr-dev` so repos and worktrees on this machine share serialization and caching. `bun run check` runs both gates.

Package-specific commands are available with `bun run --filter @wyattjoh/herdr-ui <script>` and `bun run --filter @wyattjoh/herdr-dev <script>`.

## Releases

Release-please manages each package independently in manifest mode. The package directories, changelogs, and component tags (`ui-vX.Y.Z`, `dev-vX.Y.Z`) are separate; see [release-please-config.json](release-please-config.json).
