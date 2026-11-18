// Scroll regions: a pane's bounded viewport with its scrollbar in the gutter, and an overlay's
// height-capped one.
import type { Element } from "gpui-kit";
import { Scrollbar, v_flex, type ScrollHandle } from "gpui-base";

/**
 * A bounded pane viewport with an explicit scrollbar in the existing right gutter.
 * @param id The viewport's id, which also pairs its scrollbar.
 * @param content The scrolling content.
 * @param rightGutter The gutter the scrollbar extends into (the panel's padding).
 * @param handle An existing scroll handle, created outside render; its lifetime is the caller's.
 * @returns The frame holding the viewport and its scrollbar.
 */
export function paneScrollRegion(
  id: string,
  content: Element,
  rightGutter: number,
  handle: ScrollHandle | undefined = undefined,
): Element {
  const viewport = v_flex()
    .id(id)
    .flex_1()
    .min_h_0()
    .min_w_0()
    .overflow_y_scroll()
    .when(handle !== undefined, (el) => el.track_scroll(handle!));

  return v_flex()
    .id(`${id}-frame`)
    .relative()
    .flex_1()
    .min_h_0()
    .min_w_0()
    .child(viewport.child(content))
    .child(Scrollbar.vertical(id).viewport_from_layout().absolute().inset_0().right(-rightGutter));
}

/**
 * A floating overlay's viewport: it takes its content's height up to a cap, then scrolls.
 * @param id The viewport's id, which also pairs its scrollbar.
 * @param maxHeight The cap.
 * @param content The scrolling content.
 * @param handle An existing scroll handle, created outside render.
 * @returns The viewport with its scrollbar.
 */
export const floatScrollRegion = (
  id: string,
  maxHeight: number,
  content: Element,
  handle: ScrollHandle | undefined = undefined,
): Element =>
  v_flex()
    .relative()
    .flex_none()
    .min_w_0()
    .child(
      v_flex()
        .id(id)
        .max_h(maxHeight)
        .overflow_y_scroll()
        .when(handle !== undefined, (el) => el.track_scroll(handle!))
        .child(content),
    )
    .child(Scrollbar.vertical(id).absolute().inset_0());
