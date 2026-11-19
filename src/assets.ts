// Build-side helpers copy the package's icons and notices into a mod folder. They use node:fs, so
// only build scripts import this module (`@wyattjoh/herdr-ui/assets`), never a mod bundle.
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLED_ICONS, type BundledIcon } from "./icons";

/**
 * The package's icon folder on disk.
 */
export const ICONS_DIR: string = fileURLToPath(new URL("../assets/icons/", import.meta.url));

const PACKAGE_DIR = fileURLToPath(new URL("../", import.meta.url));
const LICENSES_DIR = join(PACKAGE_DIR, "licenses");

/**
 * Copies bundled icons into a staged mod folder, where `bundledIconPaths(<folder name>)` finds
 * them. Herdr's hot reload ignores symlinks, so these are real copies.
 * @param modDir The staged mod folder (`<stage>/mods/<name>`).
 * @param names The icons to copy; all of them by default.
 * @returns The written files' paths.
 */
export async function copyIcons(
  modDir: string,
  names: readonly BundledIcon[] = Object.keys(BUNDLED_ICONS) as BundledIcon[],
): Promise<string[]> {
  await mkdir(modDir, { recursive: true });
  return Promise.all(
    names.map(async (name) => {
      const fileName = BUNDLED_ICONS[name];
      const destination = join(modDir, fileName);
      await copyFile(join(ICONS_DIR, fileName), destination);
      return destination;
    }),
  );
}

/**
 * Copies the package's third-party notice and every bundled licence text into a staged mod folder,
 * preserving the `licenses/` paths referenced by NOTICE.md.
 * @param modDir The staged mod folder (`<stage>/mods/<name>`).
 * @returns The written files' paths.
 */
export async function copyNotices(modDir: string): Promise<string[]> {
  const licenses = (await readdir(LICENSES_DIR)).filter((name) => name.endsWith(".txt")).sort();
  await mkdir(join(modDir, "licenses"), { recursive: true });
  const files = ["NOTICE.md", ...licenses.map((name) => join("licenses", name))];
  return Promise.all(
    files.map(async (file) => {
      const destination = join(modDir, file);
      await copyFile(join(PACKAGE_DIR, file), destination);
      return destination;
    }),
  );
}
