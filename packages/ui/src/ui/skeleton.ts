// Placeholder rows for a list while its contents load.
import { div, type Element } from "gpui-kit";
import { h_flex } from "gpui-base";
import { CARD, ROW, SKELETON } from "../tokens";
import type { Theme } from "./theme";

/**
 * Muted placeholder rows for a list that is loading.
 * @param t The theme.
 * @param idPrefix The id prefix; each row appends its one-based number.
 * @param count The number of rows.
 * @returns The rows, each the list-row height from `ROW.list`.
 */
export const skeletonRows = (t: Theme, idPrefix: string, count: number): Element[] =>
  Array.from({ length: count }, (_, index) =>
    h_flex()
      .id(`${idPrefix}-${index + 1}`)
      .h(ROW.list)
      .flex_none()
      .px(CARD.paddingX)
      .gap(CARD.rowGap)
      .items_center()
      .child(
        div()
          .size(SKELETON.markSize)
          .flex_none()
          .rounded(SKELETON.markSize / 2)
          .bg(t.dim),
      )
      .child(div().h(SKELETON.barHeight).flex_1().min_w(0).rounded(SKELETON.barRadius).bg(t.dim)),
  );
