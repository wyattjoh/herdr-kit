// A tab bar sized like the panel's buttons.
import { div, type Context, type Element } from "gpui-kit";
import { h_flex } from "gpui-base";
import { TAB } from "../tokens";
import { pressable } from "./press";
import type { Theme } from "./theme";

/**
 * One tab.
 */
export type TabItem<Id extends string = string> = {
  id: Id;
  label: string;
  selected: boolean;
};

/**
 * The tab bar. The selected tab takes the theme's `selected` fill and the foreground; the others
 * are muted with a hover fill, or dimmed and inert while `locked`.
 * @param t The theme.
 * @param options The bar's id (each tab is `<id>-<tab id>`), its tabs, whether switching is
 *   refused, and the handler.
 * @returns The tab bar.
 */
export function tabBar<Id extends string>(
  t: Theme,
  options: {
    id: string;
    tabs: readonly TabItem<Id>[];
    locked?: boolean;
    onTab: (tab: Id, cx: Context) => void;
  },
): Element {
  const locked = options.locked ?? false;
  return h_flex()
    .id(options.id)
    .flex_shrink_0()
    .min_w(0)
    .gap(TAB.gap)
    .items_center()
    .children(
      options.tabs.map((tab) =>
        div()
          .id(`${options.id}-${tab.id}`)
          .flex_shrink_0()
          .h(TAB.height)
          .px(TAB.paddingX)
          .flex()
          .items_center()
          .rounded(TAB.radius)
          .text_size(TAB.textSize)
          .when(tab.selected, (item) => item.bg(t.selected).text_color(t.foreground))
          .when(!tab.selected, (item) =>
            item
              .text_color(locked ? t.dim : t.muted)
              .when(!locked, (item) => pressable(item, (cx) => options.onTab(tab.id, cx), t.hover)),
          )
          .child(tab.label),
      ),
    );
}
