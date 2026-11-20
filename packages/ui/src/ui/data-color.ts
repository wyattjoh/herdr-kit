import type { Color } from "gpui-kit";

/**
 * Interprets a consumer-supplied data color as a GPUI color, or returns the fallback.
 * @param color The data color, when supplied.
 * @param fallback The color to use when omitted.
 * @returns The data color or fallback.
 */
export const dataColor = (color: string | undefined, fallback: Color): Color =>
  (color as Color | undefined) ?? fallback;
