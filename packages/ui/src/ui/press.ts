import type { Color, Context, Element } from "gpui-kit";

/**
 * Adds the standard pointer, background hover and click tail when a handler exists.
 * @param element The element to make pressable.
 * @param onClick The press handler, or undefined for an inert element.
 * @param hover The hover background.
 * @returns The unchanged or pressable element.
 */
export const pressable = (
  element: Element,
  onClick: ((cx: Context) => void) | undefined,
  hover: Color,
): Element => {
  if (onClick === undefined) return element;
  return element
    .cursor_pointer()
    .hover((style) => style.bg(hover))
    .on_click((_event, cx) => onClick(cx));
};
