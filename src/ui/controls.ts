// The panel button: an icon and a label in Herdr's top-bar button style, and the toggle pill a
// tab-row toggle draws in the same metrics.
import { svg, type Context, type Element } from "gpui-kit";
import { h_flex } from "gpui-base";
import { BUTTON_STYLE, LIT_STYLE, type ButtonStyle } from "../toolbar";
import { role, type Theme } from "./theme";

/**
 * What a {@link button} shows and does.
 */
export type ButtonOptions = {
  /**
   * The element id, from a domain id and namespaced by region.
   */
  id: string;
  /**
   * The label: shown when `labelled`, else the tooltip.
   */
  label: string;
  /**
   * The leading icon's `svg()` path.
   */
  icon?: string;
  /**
   * The press handler; without one the button is inert and dimmed.
   */
  onClick?: (cx: Context) => void;
  /**
   * Whether the label shows. Default true.
   */
  labelled?: boolean;
  /**
   * A tooltip other than the label.
   */
  tooltip?: string;
  /**
   * Draws the icon in the accent color: the button names a state that is on (Pinned).
   */
  active?: boolean;
  /**
   * Overrides the panel button style.
   */
  style?: ButtonStyle;
};

/**
 * A panel button in the top bar's Files/Changes style. An icon-only button shows its label as its
 * tooltip unless it's given another.
 * @param t The theme.
 * @param options What it shows and does.
 * @returns The button.
 */
export function button(t: Theme, options: ButtonOptions): Element {
  const s = options.style ?? BUTTON_STYLE;
  const labelled = options.labelled ?? true;
  const tooltip = options.tooltip ?? (labelled ? undefined : options.label);
  const { onClick, icon } = options;
  return h_flex()
    .id(options.id)
    .h(s.height)
    .px(s.paddingX)
    .gap(s.gap)
    .flex_none()
    .items_center()
    .rounded(s.radius)
    .text_size(s.textSize)
    .bg(role(t, s.background))
    .text_color(onClick === undefined ? t.dim : role(t, s.text))
    .when(onClick !== undefined, (el) =>
      el
        .cursor_pointer()
        .hover((style) => style.bg(role(t, s.hover)))
        .on_click((_event, cx) => onClick!(cx)),
    )
    .when(icon !== undefined, (el) =>
      el.child(
        svg(icon!)
          .size(s.iconSize)
          .when(options.active === true, (glyph) => glyph.text_color(t.accent)),
      ),
    )
    .when(labelled, (el) => el.child(options.label))
    .when(tooltip !== undefined, (el) => el.tooltip(tooltip!));
}

/**
 * What a {@link togglePill} shows and does.
 */
export type TogglePillOptions = {
  /**
   * The element id.
   */
  id: string;
  label: string;
  /**
   * The leading icon's `svg()` path.
   */
  icon?: string;
  /**
   * Whether what it toggles is shown: the pill takes the {@link LIT_STYLE} fill and text.
   */
  lit: boolean;
  /**
   * The press handler; without one the pill is inert: dimmed, with no pointer or hover.
   */
  onClick?: (cx: Context) => void;
  tooltip?: string;
  /**
   * Overrides the panel button style.
   */
  style?: ButtonStyle;
};

/**
 * A tab-row toggle's pill, like the Tasks and CI toggles: an icon and a label in the panel
 * button's metrics, lit while what it toggles is shown.
 * @param t The theme.
 * @param options What it shows and does.
 * @returns The pill; add trailing parts, such as a status dot, as children.
 */
export function togglePill(t: Theme, options: TogglePillOptions): Element {
  const s = options.style ?? BUTTON_STYLE;
  const { lit, onClick, icon, tooltip } = options;
  return h_flex()
    .id(options.id)
    .h(s.height)
    .px(s.paddingX)
    .gap(s.gap)
    .flex_none()
    .flex_nowrap()
    .items_center()
    .justify_center()
    .rounded(s.radius)
    .text_size(s.textSize)
    .bg(role(t, lit ? LIT_STYLE.background : s.background))
    .text_color(onClick === undefined ? t.dim : role(t, lit ? LIT_STYLE.text : s.text))
    .when(tooltip !== undefined, (el) => el.tooltip(tooltip!))
    .when(onClick !== undefined, (el) =>
      el
        .cursor_pointer()
        .hover((style) => style.bg(role(t, s.hover)))
        .on_click((_event, cx) => onClick!(cx)),
    )
    .when(icon !== undefined, (el) => el.child(svg(icon!).size(s.iconSize).flex_none()))
    .child(options.label);
}
