// Asserts what `npm pack` would publish: the TypeScript sources (no tests or test harness), the
// bundled icons, their licenses and the package docs, and nothing else. Writes the listing to
// .scratch/pack-listing.txt.
import { mkdir } from "node:fs/promises";

type PackFile = { path: string; size: number };
const result = Bun.spawnSync(["npm", "pack", "--dry-run", "--json", "--ignore-scripts"], {
  stdout: "pipe",
  stderr: "pipe",
});
if (result.exitCode !== 0) {
  console.error(result.stderr.toString());
  process.exit(result.exitCode ?? 1);
}
const [pack] = JSON.parse(result.stdout.toString()) as [{ files: PackFile[]; size: number }];
const paths = pack.files.map((entry) => entry.path).sort();

const ALLOWED = [
  /^package\.json$/,
  /^README\.md$/,
  /^LICENSE$/,
  /^NOTICE\.md$/,
  /^licenses\/[a-z-]+\.txt$/,
  /^assets\/icons\/[a-z-]+\.svg$/,
  /^src\/(?!test\/)[a-z/-]+(?<!\.test)\.ts$/,
];
const REQUIRED = [
  "package.json",
  "README.md",
  "LICENSE",
  "NOTICE.md",
  "licenses/lucide.txt",
  "src/index.ts",
  "src/pure.ts",
  "src/assets.ts",
];

const unexpected = paths.filter((path) => !ALLOWED.some((pattern) => pattern.test(path)));
const missing = REQUIRED.filter((path) => !paths.includes(path));
const icons = (await Array.fromAsync(new Bun.Glob("assets/icons/*.svg").scan("."))).sort();
const missingIcons = icons.filter((path) => !paths.includes(path));

await mkdir(".scratch", { recursive: true });
await Bun.write(".scratch/pack-listing.txt", `${paths.join("\n")}\n`);
console.log(`pack: ${paths.length} files, ${pack.size} bytes (.scratch/pack-listing.txt)`);
for (const path of paths) console.log(`  ${path}`);
if (unexpected.length || missing.length || missingIcons.length) {
  if (unexpected.length) console.error(`unexpected in the package: ${unexpected.join(", ")}`);
  if (missing.length) console.error(`missing from the package: ${missing.join(", ")}`);
  if (missingIcons.length)
    console.error(`icons missing from the package: ${missingIcons.join(", ")}`);
  process.exit(1);
}
