import type { Theme } from "../ui/theme";

const colors: Record<string, string> = {
  chrome: "#171717",
  muted: "#a3a3a3",
  hover: "#262626",
  dim: "#737373",
  accent: "#3b82f6",
  surface: "#1f1f1f",
  foreground: "#f5f5f5",
  canvas: "#111111",
  input: "#404040",
  popover: "#292929",
  ansi1: "#ef4444",
  ansi2: "#22c55e",
  ansi3: "#eab308",
  raised: "#333333",
  selected: "#2563eb",
  border: "#525252",
};

/**
 * A theme whose role colors use valid concrete hex values, so the renderer mirrors host checks.
 */
export const THEME = new Proxy(colors, {
  get: (target, name) => (typeof name === "string" ? (target[name] ?? "#808080") : undefined),
}) as Theme;
