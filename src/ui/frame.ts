// The panel's frame: the root, the chrome top bar with its brand and tool row, the padded body,
// and the footer strip. A pane fills its space on the theme's surface; a floating overlay draws
// inside Herdr's frame at a fixed width.
import { div, svg, type Element } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { BRAND, PANEL } from "../tokens";
import { BUTTON_STYLE, TOOL_GAP } from "../toolbar";
import type { Theme } from "./theme";

/**
 * How a column takes height. In a pane (`scrollCap` undefined) it fills the space left. A
 * floating overlay sizes to its content, where a 0 flex basis would collapse it, so there it
 * keeps its content's height.
 * @param el The column.
 * @param scrollCap The overlay's body height cap, or undefined in a pane.
 * @returns The column.
 */
export const fill = (el: Element, scrollCap: number | undefined): Element =>
  scrollCap === undefined ? el.flex_1().min_h_0() : el.flex_none();

/**
 * The panel's root column.
 * @param t The theme.
 * @param id The root's id.
 * @param floatWidth The overlay's width, or undefined in a pane, where the root fills its block
 *   on `surface` with rounded top corners.
 * @returns The root; add the top bar, bands and body as children.
 */
export const panelFrame = (t: Theme, id: string, floatWidth: number | undefined): Element =>
  v_flex()
    .id(id)
    .when(floatWidth === undefined, (el) =>
      el.size_full().bg(t.surface).rounded_t(PANEL.frameRadius),
    )
    .when(floatWidth !== undefined, (el) => el.w(floatWidth!));

/**
 * The top bar: a `chrome` band holding the tool row. Floating, its backdrop reaches up over the
 * strip Herdr's frame leaves above the content and rounds to match; it's absolute, so the
 * frame's size, which Herdr measures from the layout, ignores it.
 * @param t The theme.
 * @param options `floating` in an overlay; `content` is the tool row; `id` defaults to
 *   `tool-bar`.
 * @returns The bar.
 */
export function topBar(
  t: Theme,
  options: { floating: boolean; content: Element; id?: string },
): Element {
  const { floating } = options;
  return v_flex()
    .id(options.id ?? "tool-bar")
    .flex_none()
    .px(PANEL.padding)
    .py(PANEL.barPaddingY)
    .when(floating, (el) => el.pt(PANEL.barPaddingY - PANEL.frameTopInset - 1))
    .relative()
    .when(!floating, (el) => el.bg(t.chrome).rounded_t(PANEL.frameRadius))
    .when(floating, (el) =>
      el.child(
        div()
          .absolute()
          .top(-PANEL.frameTopInset)
          .left(0)
          .right(0)
          .bottom(0)
          .bg(t.chrome)
          .rounded_t(PANEL.frameRadius),
      ),
    )
    .child(options.content);
}

/**
 * A panel's mark and name, as tall as the buttons: the mark in the accent color and the name in
 * the foreground.
 * @param t The theme.
 * @param options The mark's `svg()` path, the name, and the id (default `brand`).
 * @returns The brand.
 */
export const brand = (t: Theme, options: { icon: string; name: string; id?: string }): Element =>
  h_flex()
    .id(options.id ?? "brand")
    .h(BUTTON_STYLE.height)
    .flex_none()
    .gap(BRAND.gap)
    .items_center()
    .child(svg(options.icon).size(BRAND.iconSize).flex_none().text_color(t.accent))
    .child(
      div().text_size(BRAND.textSize).font_semibold().text_color(t.foreground).child(options.name),
    );

/**
 * The tool row inside the top bar.
 * @param options `fixed` keeps one line (the overlay: fit labels first with `fitLabels`), with
 *   the brand and `leading` tools at the start and `trailing` ones at the end, the free space
 *   between them dragging the overlay. Otherwise (a pane) the row wraps and every tool sits at
 *   the end. `id` defaults to `bar`.
 * @returns The row.
 */
export function toolRow(options: {
  fixed: boolean;
  brand?: Element;
  leading: readonly Element[];
  trailing: readonly Element[];
  id?: string;
}): Element {
  const id = options.id ?? "bar";
  const spacer = () => div().flex_1().min_w_0().h(BUTTON_STYLE.height);
  if (options.fixed)
    return h_flex()
      .id(id)
      .gap(TOOL_GAP)
      .items_center()
      .when(options.brand !== undefined, (el) => el.child(options.brand!))
      .children([...options.leading])
      .child(spacer())
      .children([...options.trailing]);
  return h_flex()
    .id(id)
    .flex_wrap()
    .justify_between()
    .gap(TOOL_GAP)
    .items_center()
    .when(options.brand !== undefined, (el) => el.child(options.brand!))
    .child(spacer())
    .child(
      h_flex()
        .flex_wrap()
        .gap(TOOL_GAP)
        .children([...options.leading, ...options.trailing]),
    );
}

/**
 * The padded body under the bands, holding the screen's content column.
 * @param options The body's id (default `panel-body`), the overlay's height cap (undefined in a
 *   pane), `hold` for the content column, and the content.
 * @returns The body.
 */
export function panelBody(options: {
  scrollCap: number | undefined;
  hold: <E extends Element>(el: E) => E;
  content: Element;
  id?: string;
}): Element {
  const id = options.id ?? "panel-body";
  return fill(v_flex().id(id), options.scrollCap)
    .min_w_0()
    .p(PANEL.padding)
    .child(
      fill(options.hold(v_flex().id(`${id}-content`)), options.scrollCap)
        .min_w_0()
        .gap(PANEL.contentGap)
        .child(options.content),
    );
}

/**
 * A footer strip ruled off above, like the diagnostics footer.
 * @param t The theme.
 * @param id The strip's id.
 * @param children Its contents, start to end; put `div().flex_1()` between groups.
 * @returns The strip.
 */
export const panelFooter = (t: Theme, id: string, children: readonly Element[]): Element =>
  h_flex()
    .id(id)
    .flex_none()
    .flex_wrap()
    .px(PANEL.padding)
    .py(PANEL.barPaddingY)
    .gap(PANEL.contentGap)
    .items_center()
    .border_t(1)
    .border_color(t.border)
    .children([...children]);
