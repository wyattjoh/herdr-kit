import { bundledIconPaths, panelIcons, toneMap } from "@wyattjoh/herdr-ui";

export const MOD_ID = "herdr-ui-gallery";

/**
 * Icons whose paths are provided by Herdr.
 */
export const ICONS = panelIcons(MOD_ID);

/**
 * Paths for icons bundled with the gallery mod.
 */
export const BUNDLED = bundledIconPaths(MOD_ID);

/**
 * Maps run outcomes to the package's semantic tones.
 */
export const runTone = toneMap({
  queued: "neutral",
  running: "active",
  passed: "success",
  failed: "danger",
});

/**
 * An inert callback for gallery controls without behavior.
 */
export const noop = (): void => {};
