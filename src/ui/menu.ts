// The compact property menu's surface and search input.
import { div, type Element } from "gpui-kit";
import { Input, type InputState, v_flex } from "gpui-base";
import { MENU } from "../menu-metrics";
import { MENU_SURFACE } from "../tokens";
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
