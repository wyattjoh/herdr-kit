// Proves the published shape loads in Herdr: packs the package, installs the tarball into a
// scratch consumer, bundles examples/gallery there with the consumers' own flags, copies the
// icons with the installed package's build helper, and loads the folder once with
// `herdr-app check`, with a scratch stage as HERDR_APP_HOME so the live home is never touched.
import { $ } from "bun";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const WORK = join(ROOT, ".scratch/gallery");
const PACKED = join(WORK, "pack");
const CONSUMER = join(WORK, "consumer");
const STAGE = join(WORK, "stage");
const MOD = "herdr-ui-gallery";
const DIR = join(STAGE, "mods", MOD);
// Both consumers bundle this way: Herdr provides these modules at runtime.
const EXTERNAL = ["gpui-kit", "gpui-base", "herdr"];

await rm(WORK, { recursive: true, force: true });
await mkdir(PACKED, { recursive: true });
await mkdir(CONSUMER, { recursive: true });
await $`npm pack --pack-destination ${PACKED} --ignore-scripts --silent`.cwd(ROOT).quiet();
const [tarball] = (await readdir(PACKED)).filter((name) => name.endsWith(".tgz"));
if (tarball === undefined) throw new Error("npm pack wrote no tarball");

await Bun.write(
  join(CONSUMER, "package.json"),
  JSON.stringify({
    name: "herdr-ui-gallery-consumer",
    private: true,
    type: "module",
    dependencies: { "@wyattjoh/herdr-ui": `file:${join(PACKED, tarball)}` },
  }),
);
await $`bun install --no-save`.cwd(CONSUMER).quiet();
await cp(join(ROOT, "examples/gallery/main.ts"), join(CONSUMER, "main.ts"));

await mkdir(DIR, { recursive: true });
await cp(join(ROOT, "examples/gallery/mod.json"), join(DIR, "mod.json"));
const built = await Bun.build({
  entrypoints: [join(CONSUMER, "main.ts")],
  outdir: DIR,
  naming: "main.js",
  format: "esm",
  target: "bun",
  external: EXTERNAL,
});
if (!built.success) throw new Error(built.logs.join("\n"));
const bundle = await Bun.file(join(DIR, "main.js")).text();
for (const forbidden of ["node:fs", "copyIcons", "fileURLToPath"])
  if (bundle.includes(forbidden))
    throw new Error(`the bundle pulled in the build-side helper (${forbidden})`);

const assets = (await import(Bun.resolveSync("@wyattjoh/herdr-ui/assets", CONSUMER))) as {
  copyIcons: (dir: string) => Promise<string[]>;
  copyNotices: (dir: string) => Promise<string[]>;
};
const copied = await assets.copyIcons(DIR);
const notices = await assets.copyNotices(DIR);
console.log(
  `gallery: bundled ${bundle.length} bytes, copied ${copied.length} icons and ${notices.length} notice files into ${DIR}`,
);

const check = await $`herdr-app check ${DIR}`
  .env({ ...process.env, HERDR_APP_HOME: STAGE })
  .nothrow();
process.exit(check.exitCode);
