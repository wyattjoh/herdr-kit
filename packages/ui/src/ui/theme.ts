import type { Color, Element } from "gpui-kit";

/**
 * The host theme's colors by role, read once per render with `theme()` and passed to every
 * element function.
 */
export type Theme = Record<string, Color>;

/**
 * Keeps a press on an element from reaching what holds it. A floating overlay stops presses on
 * its controls, since Herdr drags a floating block by any press the mod doesn't stop; a pane lets
 * them through, so a click still focuses the pane.
 */
export type Hold = <E extends Element>(el: E) => E;

/**
 * The pane's {@link Hold}: presses pass through.
 * @param el The element.
 * @returns It unchanged.
 */
export const letThrough: Hold = (el) => el;

/**
 * The floating overlay's {@link Hold}: a left press stops at the element.
 * @param el The element.
 * @returns It, stopping left presses.
 */
export const stopPress: Hold = (el) =>
  el.on_mouse_down("left", (_event, cx) => cx.stop_propagation());

/**
 * A theme role's color, for a role name held as data (a tone).
 * @param t The theme.
 * @param role The role name.
 * @returns Its color.
 */
export const role = (t: Theme, role: string): Color => t[role] as Color;
