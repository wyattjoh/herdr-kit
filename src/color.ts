// Color arithmetic on `#` hex theme colors. Pure.

/**
 * Parses a hex color.
 * @param color `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`.
 * @returns Its red, green and blue channels (0-255) and alpha (0-1), or undefined when it isn't
 *   hex.
 */
export function hexColor(color: string): readonly [number, number, number, number] | undefined {
  const digits = color.slice(1);
  if (color[0] !== "#" || ![3, 4, 6, 8].includes(digits.length) || /[^\da-f]/i.test(digits))
    return undefined;
  const expanded = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join("") : digits;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
    expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1,
  ];
}

/**
 * Resolves the opaque paint a translucent color shows over a backing color.
 * @param canvas The color on top, including its optional alpha.
 * @param surface The paint behind it; only its RGB channels count.
 * @returns Opaque `#rrggbb` when both are hex; otherwise the canvas, or the surface unchanged
 *   when the canvas is recognized as fully transparent.
 */
export function opaqueOver(canvas: string, surface: string): string {
  const foreground = hexColor(canvas);
  const backing = hexColor(surface);
  if (!foreground || !backing) return foreground?.[3] === 0 ? surface : canvas;
  const alpha = foreground[3];
  const channels = backing.slice(0, 3).map((channel, index) =>
    Math.round(foreground[index]! * alpha + channel * (1 - alpha))
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${channels.join("")}`;
}

/**
 * A color with its alpha replaced, for a tinted background behind an icon of the same color.
 * @param color A `#rgb`, `#rrggbb` or `#rrggbbaa` color.
 * @param alpha Two hex digits of alpha, like `"1f"`.
 * @returns `#rrggbb` plus the alpha.
 */
export function tint(color: string, alpha: string): string {
  const rgb =
    color.length === 4
      ? color
          .slice(1)
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : color.slice(1, 7);
  return `#${rgb}${alpha}`;
}
