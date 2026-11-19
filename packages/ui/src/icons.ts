// Icon paths for `svg()`. Herdr resolves an asset path against its home, so a bundled icon is
// `mods/<mod folder>/<file>`: the consumer's build copies the files in (`copyIcons` from
// `@wyattjoh/herdr-ui/assets`) and its code builds paths from the same folder name. Herdr's own
// icons are referenced where they ship. Pure.

/**
 * Icons this package ships in `assets/icons/`, by name, as their file names. Each is a Lucide
 * glyph (ISC) or a first-party one drawn in the same style; see NOTICE.md.
 */
export const BUNDLED_ICONS = {
  copy: "copy.svg",
  globe: "globe.svg",
  logIn: "log-in.svg",
  externalLink: "external-link.svg",
  anchor: "anchor.svg",
  anchorOff: "anchor-off.svg",
  pinFilled: "pin-filled.svg",
  returnTo: "return.svg",
  tag: "tag.svg",
  refresh: "refresh-cw.svg",
} as const;

/**
 * A bundled icon's name.
 */
export type BundledIcon = keyof typeof BUNDLED_ICONS;

/**
 * Icons Herdr ships with its own mods, as `svg()` paths. They are never copied.
 */
export const HERDR_ICONS = {
  back: "mods/workspace-chrome/chevron-left.svg",
  terminal: "mods/workspace-chrome/terminal.svg",
  pin: "mods/workspace-chrome/pin.svg",
  pinOff: "mods/workspace-chrome/pin-off.svg",
  search: "mods/workspace-chrome/search.svg",
  check: "mods/workspace-chrome/check.svg",
  circleCheck: "mods/workspace-chrome/circle-check.svg",
  close: "mods/workspace-chrome/x.svg",
  clock: "mods/workspace-chrome/clock.svg",
  minus: "mods/workspace-chrome/minus.svg",
  square: "mods/workspace-chrome/square.svg",
  spinner: "mods/workspace-chrome/spinner.svg",
  gitBranch: "mods/workspace-chrome/git-branch.svg",
  chevronDown: "mods/files/chevron-down.svg",
  chevronRight: "mods/workspace-chrome/chevron-right.svg",
} as const;

const MOD_FOLDER = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Checks a mod folder name, the one directory under `<home>/mods/` the consumer installs to.
 * @param modFolder The name.
 * @returns The name.
 * @throws When it is empty or holds a path separator or other character Herdr's mod names don't.
 */
export function modFolderName(modFolder: string): string {
  if (!MOD_FOLDER.test(modFolder)) throw new Error(`Not a mod folder name: ${modFolder}`);
  return modFolder;
}

/**
 * Every bundled icon's `svg()` path inside a mod folder.
 * @param modFolder The folder the consumer's build copied the icons into.
 * @returns Each icon's path, like `mods/<modFolder>/globe.svg`.
 */
export function bundledIconPaths(modFolder: string): Record<BundledIcon, string> {
  const folder = modFolderName(modFolder);
  return Object.fromEntries(
    Object.entries(BUNDLED_ICONS).map(([name, fileName]) => [name, `mods/${folder}/${fileName}`]),
  ) as Record<BundledIcon, string>;
}

/**
 * The Tasks panel's control icons by role.
 */
export type PanelIcons = {
  copy: string;
  openInBrowser: string;
  signIn: string;
  externalLink: string;
  back: string;
  follow: string;
  pin: string;
  pinned: string;
  goPinned: string;
  search: string;
  submit: string;
  cancel: string;
  groupOpen: string;
  groupClosed: string;
  dock: string;
  undock: string;
  spinner: string;
};

/**
 * The Tasks panel's control icons by role, bundled ones resolved in a mod folder.
 * @param modFolder The folder the consumer's build copied the icons into.
 * @returns Each role's `svg()` path.
 */
export function panelIcons(modFolder: string): PanelIcons {
  const bundled = bundledIconPaths(modFolder);
  return {
    copy: bundled.copy,
    openInBrowser: bundled.globe,
    signIn: bundled.logIn,
    externalLink: bundled.externalLink,
    back: HERDR_ICONS.back,
    follow: HERDR_ICONS.terminal,
    pin: HERDR_ICONS.pin,
    pinned: bundled.pinFilled,
    goPinned: bundled.returnTo,
    search: HERDR_ICONS.search,
    submit: HERDR_ICONS.check,
    cancel: HERDR_ICONS.close,
    groupOpen: HERDR_ICONS.chevronDown,
    groupClosed: HERDR_ICONS.chevronRight,
    dock: bundled.anchor,
    undock: bundled.anchorOff,
    spinner: HERDR_ICONS.spinner,
  };
}
