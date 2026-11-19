// The compact property menu's surface and search input.
import { div, svg, type Context, type Element } from "gpui-kit";
import { h_flex, Input, type InputState, v_flex } from "gpui-base";
import { HERDR_ICONS } from "../icons";
import { MENU } from "../menu-metrics";
import { MENU_ROW_STYLE, MENU_SURFACE } from "../tokens";
import type { Theme } from "./theme";

/**
 * A compact menu panel on `popover`. It consumes presses so an outside-dismiss surface beneath
 * doesn't close it.
 * @param t The theme.
 * @param width The panel's width.
 * @param padding Its padding; default the Task menu's.
 * @returns The panel; add rows as children.
 */
export const menuPanel = (t: Theme, width: number, padding: number = MENU.padding): Element =>
  v_flex()
    .w(width)
    .flex_none()
    .p(padding)
    .rounded(MENU_SURFACE.radius)
    .bg(t.popover)
    .border_1()
    .border_color(t.border)
    .text_color(t.foreground)
    .on_mouse_down("left", (_event, cx) => cx.stop_propagation())
    .on_mouse_down("right", (_event, cx) => cx.stop_propagation());

/**
 * What a {@link menuRow} shows and does.
 */
export type MenuRowOptions = {
  /**
   * The row id, from a domain id and namespaced by region.
   */
  id: string;
  label: string;
  /**
   * A leading icon or visual, already styled by the consumer.
   */
  leading?: Element;
  /**
   * Whether this row opens a child menu.
   */
  flyout?: boolean;
  /**
   * Whether this choice is checked.
   */
  checked?: boolean;
  /**
   * Whether this is the current keyboard selection.
   */
  selected?: boolean;
  /**
   * Whether this row is unavailable; disabled rows have no hover or press handler.
   */
  disabled?: boolean;
  tooltip?: string;
  /**
   * The press handler; without one the row is inert and dimmed.
   */
  onClick?: (cx: Context) => void;
};

/**
 * A compact menu item with optional flyout and checkmark affordances.
 * @param t The theme.
 * @param options What the row shows and does.
 * @returns The menu row.
 */
export function menuRow(t: Theme, options: MenuRowOptions): Element {
  const enabled = options.disabled !== true && options.onClick !== undefined;
  const selected = options.selected ?? false;
  return h_flex()
    .id(options.id)
    .h(MENU.row)
    .flex_none()
    .px(MENU_ROW_STYLE.paddingX)
    .gap(MENU_ROW_STYLE.gap)
    .items_center()
    .rounded(MENU_ROW_STYLE.radius)
    .text_size(MENU_ROW_STYLE.textSize)
    .text_color(enabled ? t.foreground : t.dim)
    .disabled(!enabled)
    .selected(selected)
    .when(selected, (el) => el.bg(t.selected))
    .when(options.tooltip !== undefined, (el) => el.tooltip(options.tooltip!))
    .when(enabled, (el) =>
      el
        .cursor_pointer()
        .hover((style) => style.bg(t.hover))
        .on_click((_event, cx) => {
          cx.stop_propagation();
          options.onClick!(cx);
        }),
    )
    .when(options.leading !== undefined, (el) => el.child(options.leading!))
    .child(div().flex_1().min_w(0).truncate().child(options.label))
    .when(options.flyout === true, (el) =>
      el.child(
        svg(HERDR_ICONS.chevronRight)
          .size(MENU_ROW_STYLE.affordanceSize)
          .flex_none()
          .text_color(t.muted),
      ),
    )
    .when(options.checked === true, (el) =>
      el.child(svg(HERDR_ICONS.check).size(MENU.icon).flex_none().text_color(t.foreground)),
    );
}

/**
 * A menu's native search input, keeping the caller's keyboard context.
 * @param t The theme.
 * @param input The input's state, created outside render.
 * @param context The key context its bindings use.
 * @param height Its height; default the Task menu's.
 * @returns The input.
 */
export const menuInput = (
  t: Theme,
  input: InputState,
  context: string,
  height: number = MENU.inputHeight,
): Element =>
  div()
    .h(height)
    .flex_none()
    .key_context(context)
    .child(
      Input.new(input)
        .h(height)
        .px(MENU_SURFACE.inputPaddingX)
        .rounded(MENU_SURFACE.inputRadius)
        .border_1()
        .border_color(t.input)
        .text_size(MENU_SURFACE.inputTextSize),
    );
