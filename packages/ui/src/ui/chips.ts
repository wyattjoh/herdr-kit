// Small badges: a label chip on `raised`, a toggle chip that applies a label, and a count chip
// tinted in its own color.
import { div, svg, type Color, type Context, type Element } from "gpui-kit";
import { h_flex } from "gpui-base";
import { tint } from "../color";
import { CHIP } from "../tokens";
import { dataColor } from "./data-color";
import { pressable } from "./press";
import type { Theme } from "./theme";

/**
 * A row of chips that shrinks and clips rather than pushing its row wider.
 * @param chips The chips.
 * @returns The row.
 */
export const chipRow = (chips: readonly Element[]): Element =>
  h_flex()
    .min_w_0()
    .flex_shrink(1)
    .gap(CHIP.rowGap)
    .items_center()
    .overflow_hidden()
    .children([...chips]);

/**
 * What a {@link labelChip} shows.
 */
export type LabelChipOptions = {
  id: string;
  label: string;
  /**
   * The icon's `svg()` path.
   */
  icon: string;
  /**
   * The icon's color (data, such as a label's color); when omitted, `muted`.
   */
  color?: string;
  /**
   * The tooltip and accessibility label; default the label.
   */
  caption?: string;
};

/**
 * A label chip: an icon in the label's color and its truncating name on `raised`.
 * @param t The theme.
 * @param options What it shows.
 * @returns The chip.
 */
export function labelChip(t: Theme, options: LabelChipOptions): Element {
  const caption = options.caption ?? options.label;
  return h_flex()
    .id(options.id)
    .h(CHIP.height)
    .max_w(CHIP.maxWidth)
    .min_w_0()
    .px(CHIP.paddingX)
    .gap(CHIP.gap)
    .rounded(CHIP.radius)
    .bg(t.raised)
    .text_size(CHIP.textSize)
    .text_color(t.foreground)
    .tooltip(caption)
    .accessibility_label(caption)
    .child(
      svg(options.icon)
        .size(CHIP.iconSize)
        .flex_none()
        .text_color(dataColor(options.color, t.muted)),
    )
    .child(div().min_w_0().truncate().child(options.label));
}

/**
 * What a {@link toggleChip} shows and does.
 */
export type ToggleChipOptions = {
  id: string;
  label: string;
  /**
   * Whether the label is applied: a filled chip, else an outlined one.
   */
  applied: boolean;
  /**
   * A change to this chip is in flight: the label ends in an ellipsis and the chip is inert.
   */
  pending?: boolean;
  /**
   * The color dot's color (data, such as a forge label's `#rrggbb`); no dot when omitted.
   */
  color?: string;
  /**
   * The tooltip and accessibility label; default the label.
   */
  caption?: string;
  /**
   * Applies or removes the label; without one (or while pending) the chip is inert, and an
   * unapplied one dims.
   */
  onClick?: (cx: Context) => void;
};

/**
 * A label chip that toggles its label: applied on `raised`, unapplied outlined, with an optional
 * color dot before the truncating name.
 * @param t The theme.
 * @param options What it shows and does.
 * @returns The chip.
 */
export function toggleChip(t: Theme, options: ToggleChipOptions): Element {
  const caption = options.caption ?? options.label;
  const pending = options.pending ?? false;
  const { applied, color } = options;
  const onClick = pending ? undefined : options.onClick;
  return h_flex()
    .id(options.id)
    .flex_shrink_0()
    .h(CHIP.height)
    .max_w(CHIP.maxWidth)
    .min_w_0()
    .px(CHIP.paddingX)
    .gap(CHIP.gap)
    .items_center()
    .rounded(CHIP.radius)
    .text_size(CHIP.textSize)
    .tooltip(caption)
    .accessibility_label(caption)
    .when(applied, (chip) => chip.bg(t.raised).text_color(t.foreground))
    .when(!applied, (chip) =>
      chip
        .border(1)
        .border_color(t.border)
        .text_color(onClick === undefined ? t.dim : t.muted),
    )
    .when(onClick !== undefined, (chip) => pressable(chip, onClick, t.hover))
    .when(color !== undefined, (chip) =>
      chip.child(
        div()
          .size(CHIP.dotSize)
          .flex_none()
          .rounded(CHIP.dotSize / 2)
          .bg(color as Color),
      ),
    )
    .child(
      div()
        .min_w_0()
        .truncate()
        .child(pending ? `${options.label} …` : options.label),
    );
}

/**
 * What a {@link countChip} shows.
 */
export type CountChipOptions = {
  id: string;
  count: number;
  /**
   * The icon's `svg()` path.
   */
  icon: string;
  /**
   * The chip's color: the icon and count take it, the background a tint of it.
   */
  color: Color;
  tooltip: string;
};

/**
 * A count chip, like the Tasks panel's Blocked and Blocking badges: an icon and a number in one
 * color over a tint of it.
 * @param options What it shows.
 * @returns The chip.
 */
export const countChip = (options: CountChipOptions): Element =>
  h_flex()
    .id(options.id)
    .flex_none()
    .h(CHIP.height)
    .px(CHIP.paddingX)
    .rounded(CHIP.radius)
    .gap(CHIP.gap)
    .items_center()
    // GPUI accepts #rrggbbaa: tint only the background, not the icon or count.
    .bg(tint(options.color, CHIP.tintAlpha) as Color)
    .text_size(CHIP.textSize)
    .text_color(options.color)
    .tooltip(options.tooltip)
    .child(svg(options.icon).size(CHIP.iconSize).flex_none().text_color(options.color))
    .child(String(options.count));
