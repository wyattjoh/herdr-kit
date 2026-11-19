import type { Theme } from "../ui/theme";

/**
 * A theme whose every role's color is `#<role>`, so a test reads which role an element used.
 */
export const THEME = new Proxy({}, { get: (_, name) => `#${String(name)}` }) as Theme;
