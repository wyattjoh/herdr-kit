// The Tasks panel's look as named numbers and theme role names. Pure: no gpui-kit or herdr
// import, so tests and build scripts can read it. Every value is copied from the Tasks panel's
// view, so a region built from these tokens lines up with the panel it came from.

/**
 * A `theme()` color role name, such as `"muted"` or `"ansi2"`.
 */
export type ThemeRole = string;

/**
 * The panel's outer geometry: the inset on every side, the top bar's vertical padding, and the
 * corner radius Herdr's frame uses.
 */
export const PANEL = {
  /**
   * The panel's padding on every side.
   */
  padding: 12,
  /**
   * The top bar's padding above and below its buttons.
   */
  barPaddingY: 6,
  /**
   * The radius of the panel's top corners, matching Herdr's floating frame.
   */
  frameRadius: 9,
  /**
   * The strip of frame color Herdr leaves above a floating block's content, which the top bar's
   * backdrop reaches up over.
   */
  frameTopInset: 5,
  /**
   * Between blocks inside the panel body.
   */
  contentGap: 8,
  /**
   * Between cards on a screen.
   */
  sectionGap: 10,
} as const;

/**
 * Text sizes, in px.
 */
export const TEXT = {
  /**
   * A page title and the brand's wordmark.
   */
  title: 15,
  /**
   * Row titles, markdown and state titles.
   */
  body: 13,
  /**
   * Buttons, breadcrumbs, row keys, group headers and state details.
   */
  label: 12,
  /**
   * Chips.
   */
  caption: 10,
} as const;

/**
 * The page title row under the breadcrumb band.
 */
export const TITLE = {
  textSize: TEXT.title,
  /**
   * One line of the title: gpui's default line height (1.618 times the size), rounded. A leading
   * icon or trailing control is centered in a box this tall so it sits on the first line.
   */
  lineHeight: Math.round(TEXT.title * 1.618),
  iconSize: 16,
  paddingY: 10,
  gap: 8,
} as const;

/**
 * The breadcrumb band.
 */
export const CRUMB = {
  height: 36,
  gap: 6,
  /**
   * Between a crumb's icon and its label.
   */
  itemGap: 5,
  separator: "›",
} as const;

/**
 * A bordered content card, its external header, and the rows and group bands inside it.
 */
export const CARD = {
  radius: 8,
  /**
   * The radius a band painted in a card's corner rounds itself to: one less than the card's, so
   * it sits inside the 1px outline.
   */
  innerRadius: 7,
  headerHeight: 24,
  headerGap: 6,
  /**
   * Between a section's header and its card.
   */
  sectionGap: 2,
  paddingX: 10,
  paddingY: 8,
  /**
   * Between a row's mark, key, title and trailing items.
   */
  rowGap: 7,
  /**
   * A collapsible group's header band.
   */
  groupHeaderHeight: 28,
  chevronSize: 12,
} as const;

/**
 * Fixed row heights, so a group's open height is known without measuring.
 */
export const ROW = {
  /**
   * A row in a record's grouped list (a Spec's Tasks).
   */
  compact: 32,
  /**
   * A row in a listing card.
   */
  list: 34,
} as const;

/**
 * The muted bars of a placeholder list row.
 */
export const SKELETON = {
  /**
   * The leading mark's width and height.
   */
  markSize: 14,
  /**
   * The title bar's height.
   */
  barHeight: 8,
  /**
   * The bars' corner radius.
   */
  barRadius: 4,
} as const;

/**
 * A compact grid of labeled properties, like the record detail header.
 */
export const METADATA_GRID = {
  /**
   * The property cell's horizontal inset.
   */
  paddingX: 8,
  /**
   * The property cell's vertical inset.
   */
  paddingY: 6,
  /**
   * Between a label and its value.
   */
  gap: 3,
  /**
   * Between a value's leading visual and its text, matching the Tasks panel's button gap.
   */
  valueGap: 5,
  /**
   * The label's text size.
   */
  labelTextSize: 11,
} as const;

/**
 * How a group's body folds: its height eases to its rows' total, or to nothing.
 */
export const FOLD_MOTION = { duration: 200, easing: "ease-out" } as const;

/**
 * A small badge: a label chip or a tinted count chip.
 */
export const CHIP = {
  height: 18,
  maxWidth: 180,
  paddingX: 4,
  gap: 3,
  radius: 3,
  iconSize: 12,
  /**
   * A toggle chip's color dot, as the CI panel's label chips draw it.
   */
  dotSize: 8,
  textSize: TEXT.caption,
  /**
   * The alpha suffix a tinted chip's background adds to its color (`#rrggbb1f`).
   */
  tintAlpha: "1f",
  /**
   * Between chips in a row.
   */
  rowGap: 4,
} as const;

/**
 * A progress bar and its fraction, fixed-width so bars line up down a list.
 */
export const PROGRESS = {
  width: 56,
  height: 6,
  radius: 3,
  gap: 6,
  /**
   * The room the `done/total` fraction gets.
   */
  labelWidth: 34,
} as const;

/**
 * A breadcrumb's dropdown list.
 */
export const PICKER = {
  rows: 7,
  width: 260,
  radius: 6,
  optionPaddingX: 8,
  optionGap: 6,
  chevronPaddingX: 2,
  chevronRadius: 4,
} as const;

/**
 * The brand mark and wordmark at the start of the overlay's top bar.
 */
export const BRAND = {
  iconSize: 20,
  textSize: TEXT.title,
  gap: 6,
  /**
   * The top bar's allowance for the brand, used when fitting button labels beside it.
   */
  width: 76,
} as const;

/**
 * A tab in a tab bar, sized like the panel's buttons.
 */
export const TAB = {
  height: 26,
  paddingX: 10,
  gap: 4,
  radius: 6,
  textSize: TEXT.label,
} as const;

/**
 * A collapsible markdown document card.
 */
export const DOCUMENT = {
  /**
   * A collapsed document's height cap as a share of the window's height (web's 15vh).
   */
  previewViewportRatio: 0.15,
  fadeHeight: 120,
  /**
   * The fade's bands, top to bottom: each paints the card's color at this opacity.
   */
  fadeOpacities: [
    0.02, 0.04, 0.07, 0.11, 0.16, 0.23, 0.32, 0.42, 0.53, 0.64, 0.74, 0.83, 0.9, 0.95, 0.98, 1,
  ],
  gap: 8,
} as const;

/**
 * An empty, error or loading message block.
 */
export const STATE = {
  /**
   * Between lines in a standard state block.
   */
  gap: 4,
  /**
   * Between lines in a compact in-card state block.
   */
  compactGap: 2,
} as const;

/**
 * The compact property menu's frame and its search input.
 */
export const MENU_SURFACE = {
  radius: 7,
  inputPaddingX: 8,
  inputRadius: 6,
  inputTextSize: TEXT.body,
} as const;

/**
 * A compact menu row's shape, matching the Tasks property menu.
 */
export const MENU_ROW_STYLE = {
  /**
   * Horizontal inset on each row.
   */
  paddingX: 8,
  /**
   * Between the icon, label and affordances.
   */
  gap: 9,
  /**
   * The row's corner radius.
   */
  radius: MENU_SURFACE.radius,
  /**
   * The row's text size.
   */
  textSize: 12.8,
  /**
   * The flyout chevron's size.
   */
  affordanceSize: 12,
} as const;

/**
 * Domain-neutral tones, each the theme role the Tasks panel uses for that meaning: `neutral`
 * for not started (slate), `info` for ready (blue), `active` for in progress (Herdr's amber
 * `working`), `success` for done (green), `danger` for canceled or blocked (red), `warning`
 * for blocking (yellow), and `accent` for the host theme's accent color. Herdr's `done` role is
 * blue in its default theme, so success doesn't use it.
 */
export const TONES = {
  neutral: "dim",
  info: "ansi4",
  active: "working",
  success: "ansi2",
  danger: "ansi1",
  warning: "ansi3",
  accent: "accent",
  muted: "muted",
} as const satisfies Record<string, ThemeRole>;

/**
 * A domain-neutral tone name.
 */
export type Tone = keyof typeof TONES;

/**
 * Maps a domain's states to tones, so a consumer keeps its own status names.
 * @param tones Each state's tone.
 * @returns A function giving a state's theme role.
 * @example const statusTone = toneMap({ queued: "neutral", running: "active", passed: "success" });
 */
export const toneMap =
  <S extends string>(tones: Readonly<Record<S, Tone>>) =>
  (state: S): ThemeRole =>
    TONES[tones[state]];
