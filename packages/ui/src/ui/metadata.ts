// A compact grid of labeled values for a detail header.
import { div, type Element } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { METADATA_GRID, TEXT } from "../tokens";
import type { Theme } from "./theme";

/**
 * One labeled value in a {@link metadataGrid}.
 */
export type MetadataGridCell = {
  /**
   * The cell id, namespaced by the grid id.
   */
  id: string;
  label: string;
  value: string;
  /**
   * A leading icon or other visual for the value.
   */
  leading?: Element;
  /**
   * The cell tooltip; defaults to its label and value.
   */
  tooltip?: string;
  /**
   * Dims a value that cannot currently be edited.
   */
  enabled?: boolean;
  /**
   * Wraps the cell, for example in a consumer-owned popover.
   */
  wrap?: (element: Element) => Element;
};

/**
 * What a {@link metadataGrid} shows.
 */
export type MetadataGridOptions = {
  /**
   * The grid id, from a domain id and namespaced by region.
   */
  id: string;
  /**
   * The properties in display order.
   */
  cells: readonly MetadataGridCell[];
};

/**
 * A row of equally shrinkable labeled values, separated by vertical rules.
 * @param t The theme.
 * @param options The grid id and its cells.
 * @returns The fixed-width grid; values truncate but remain available in tooltips.
 */
export function metadataGrid(t: Theme, options: MetadataGridOptions): Element {
  return h_flex()
    .id(options.id)
    .w_full()
    .min_w(0)
    .flex_none()
    .border_b(1)
    .border_color(t.border)
    .children(
      options.cells.map((cell, index) => {
        const content = v_flex()
          .id(`${options.id}-${cell.id}`)
          .w_full()
          .min_w(0)
          .overflow_hidden()
          .px(METADATA_GRID.paddingX)
          .py(METADATA_GRID.paddingY)
          .gap(METADATA_GRID.gap)
          .when(index > 0, (el) => el.border_l(1).border_color(t.border))
          .tooltip(cell.tooltip ?? `${cell.label}: ${cell.value}`)
          .when(cell.enabled === false, (el) => el.opacity(0.5))
          .child(
            div()
              .min_w(0)
              .truncate()
              .text_size(METADATA_GRID.labelTextSize)
              .text_color(t.muted)
              .child(cell.label),
          )
          .child(
            h_flex()
              .min_w(0)
              .gap(METADATA_GRID.gap)
              .items_center()
              .when(cell.leading !== undefined, (el) => el.child(cell.leading!))
              .child(
                div()
                  .flex_1()
                  .min_w(0)
                  .truncate()
                  .text_size(TEXT.label)
                  .text_color(t.foreground)
                  .child(cell.value),
              ),
          );
        const wrapped = cell.wrap === undefined ? content : cell.wrap(content);
        return v_flex().flex_1().min_w(0).child(wrapped);
      }),
    );
}
