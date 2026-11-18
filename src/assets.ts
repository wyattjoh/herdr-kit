// Build-side helper: copies the bundled icons into a mod folder. Uses node:fs, so only build
// scripts import it (`@wyattjoh/herdr-ui/assets`), never a mod bundle.
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { BUNDLED_ICONS, type BundledIcon } from "./icons";

/**
 * The package's icon folder on disk.
 */
export const ICONS_DIR: string = fileURLToPath(new URL("../assets/icons/", import.meta.url));

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
