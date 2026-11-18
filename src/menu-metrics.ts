// The compact property menu's metrics: Herdr's popup-menu rows and padding, and how a child
// flyout fits beside its parent. Pure.

/**
 * A compact menu's sizes, in px.
 */
export type MenuMetrics = {
  width: number;
  flyoutWidth: number;
  row: number;
  padding: number;
  /**
   * The parent menu's fixed height.
   */
  height: number;
  inputHeight: number;
  gap: number;
  icon: number;
  /**
   * How many rows a searchable child shows: it must fit inside the parent's height, or native
   * fitting moves parent rows under a stationary pointer and can cycle hover-open and close.
   */
  visibleRows: number;
};

/**
 * Options for {@link menuMetrics}; each defaults to the Tasks panel's Task menu.
 */
export type MenuMetricsOptions = {
  /**
   * How many rows the parent menu holds.
   */
  rows?: number;
  width?: number;
  flyoutWidth?: number;
  row?: number;
  padding?: number;
  inputHeight?: number;
  gap?: number;
  icon?: number;
  /**
   * Overrides the derived visible-row budget.
   */
  visibleRows?: number;
};

/**
 * Builds a menu's metrics.
 * @param options Sizes that differ from the Task menu's.
 * @returns The metrics, with the parent height and visible-row budget derived.
 */
export function menuMetrics(options: MenuMetricsOptions = {}): MenuMetrics {
  const {
    rows = 8,
    width = 220,
    flyoutWidth = 240,
    row = 31,
    padding = 5,
    inputHeight = 32,
    gap = 2,
    icon = 14,
  } = options;
  const height = padding * 2 + row * rows;
  return {
    width,
    flyoutWidth,
    row,
    padding,
    height,
    inputHeight,
    gap,
    icon,
    visibleRows: options.visibleRows ?? Math.floor((height - padding * 2 - inputHeight) / row),
  };
}

/**
 * The Tasks panel's Task menu: eight rows, 220px wide, with 240px flyouts.
 */
export const MENU: MenuMetrics = menuMetrics();

/**
 * A choice list's definite viewport height: intrinsic popovers otherwise collapse the body.
 * @param metrics The menu.
 * @param count Filtered choices, or zero for an empty-search note.
 * @param visibleRows The row budget; defaults to the menu's.
 * @returns At least one row, capped at the budget.
 */
export const choicesHeight = (
  metrics: MenuMetrics,
  count: number,
  visibleRows: number = metrics.visibleRows,
): number => Math.min(Math.max(count, 1), visibleRows) * metrics.row;

/**
 * Aligns a short child with its parent row, lifting a long child inside the parent's fixed
 * height, so native bottom-edge fitting can't move the parent as the child opens.
 * @param metrics The menu.
 * @param rowIndex The property's row in the parent.
 * @param count Filtered choices, including an empty-search placeholder when zero.
 * @param searchable Whether the child holds a search input.
 * @param visibleRows The child's row budget; defaults to the menu's.
 * @returns The child's top inset.
 */
export function flyoutTop(
  metrics: MenuMetrics,
  rowIndex: number,
  count: number,
  searchable: boolean,
  visibleRows: number = metrics.visibleRows,
): number {
  const childHeight =
    metrics.padding * 2 +
    choicesHeight(metrics, count, visibleRows) +
    (searchable ? metrics.inputHeight : 0);
  return Math.max(0, Math.min(rowIndex * metrics.row, metrics.height - childHeight));
}
