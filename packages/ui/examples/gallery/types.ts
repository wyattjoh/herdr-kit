import type { InputState } from "gpui-base";

/**
 * Gallery tabs available in the main panel.
 */
export type Tab = "overview" | "checks";

/**
 * State read by the gallery's body regions.
 */
export type GalleryState = {
  tab: Tab;
  open: Set<string>;
  document: boolean;
  applied: Set<string>;
  shown: boolean;
  search: InputState | undefined;
};
