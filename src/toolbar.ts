// How a panel button looks, and which of a row's buttons fit their labels in a fixed width.
// Pure, so the label fitting is testable without Herdr.

/**
 * How a panel button looks: the stock `tabs` mod's `panelButton` (Files and Changes in Herdr's
 * top bar) in its off state. Colors are `theme()` role names.
 */
export type ButtonStyle = {
  height: number;
  paddingX: number;
  /**
   * Between the icon and the label.
   */
  gap: number;
  radius: number;
  textSize: number;
  iconSize: number;
  background: string;
  text: string;
  hover: string;
};

/**
 * The style of every panel button.
 */
export const BUTTON_STYLE: ButtonStyle = {
  height: 26,
  paddingX: 8,
  gap: 5,
  radius: 6,
  textSize: 12,
  iconSize: 14,
  background: "chrome",
  text: "muted",
  hover: "hover",
};

/**
 * The theme roles a lit toggle pill takes over its {@link ButtonStyle}: the Tasks and CI toggles'
 * on state.
 */
export const LIT_STYLE = {
  background: "selected",
  text: "foreground",
} as const;

/**
 * Space between a toolbar's buttons, in px.
 */
export const TOOL_GAP = 6;

/**
 * Space a floating overlay's toolbar keeps free, in px: it's what drags the overlay, and it
 * absorbs a label a little wider than estimated.
 */
export const DRAG_ROOM = 24;

/**
 * A label's estimated width per character as a share of the text size: Herdr's UI font is
 * JetBrains Mono (0.6em a glyph); proportional fonts run narrower.
 */
export const CHAR_WIDTH_RATIO = 0.6;

/**
 * One button of a toolbar, for fitting: its label, and whether it shows it (else it's an icon
 * with the label as its tooltip).
 */
export type Tool<Id extends string = string> = {
  id: Id;
  label: string;
  labelled: boolean;
};

/**
 * A button's estimated width.
 * @param tool The button.
 * @param style Its style.
 * @returns Its width in px.
 */
export function toolWidth(tool: Tool, style: ButtonStyle = BUTTON_STYLE): number {
  const iconOnly = style.paddingX * 2 + style.iconSize;
  return tool.labelled
    ? iconOnly + style.gap + tool.label.length * style.textSize * CHAR_WIDTH_RATIO
    : iconOnly;
}

/**
 * A row of buttons' estimated width, gaps included.
 * @param tools The buttons.
 * @param style Their style.
 * @returns Its width in px.
 */
export const toolsWidth = (tools: readonly Tool[], style: ButtonStyle = BUTTON_STYLE): number =>
  tools.reduce((sum, tool) => sum + toolWidth(tool, style), 0) +
  TOOL_GAP * Math.max(0, tools.length - 1);

/**
 * Gives labels to a fixed-width row's buttons while they fit, a group at a time, so the row
 * never wraps or truncates.
 * @param tools The row's buttons, all unlabelled or as the caller wants them by default.
 * @param width The room for the row in px, or undefined in a pane, where the row wraps and
 *   `tools` is returned as given.
 * @param order Groups of ids to label, most important first; a group is labelled only when the
 *   whole row still keeps `DRAG_ROOM` free.
 * @param style The buttons' style.
 * @returns The buttons, some labelled.
 */
export function fitLabels<Id extends string>(
  tools: readonly Tool<Id>[],
  width: number | undefined,
  order: readonly (readonly Id[])[],
  style: ButtonStyle = BUTTON_STYLE,
): Tool<Id>[] {
  if (width === undefined) return [...tools];
  return order.reduce<Tool<Id>[]>(
    (row, group) => {
      const next = row.map((tool) =>
        group.includes(tool.id) ? { ...tool, labelled: true } : tool,
      );
      return toolsWidth(next, style) + DRAG_ROOM <= width ? next : row;
    },
    [...tools],
  );
}
