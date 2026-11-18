// A collapsible markdown document card: native Markdown, clipped to a preview with a fade, and a
// control below to reveal or re-collapse it.
import { div, type Color, type Context, type Element } from "gpui-kit";
import { h_flex, TextView, v_flex } from "gpui-base";
import { opaqueOver } from "../color";
import { HERDR_ICONS } from "../icons";
import { DOCUMENT, TEXT } from "../tokens";
import { card, cardBody, cardHeader, cardNote, cardSection } from "./cards";
import { button } from "./controls";
import type { Theme } from "./theme";

/**
 * A fade over a clipped preview's bottom. A translucent card exposes the host surface, so the
 * bands paint that visible color at full alpha and the ramp, not the card's alpha, sets the
 * fade's strength.
 * @param t The theme.
 * @param id The fade's id.
 * @param surface The paint behind the card.
 * @returns The fade, absolute over its parent.
 */
export function documentFade(t: Theme, id: string, surface: Color): Element {
  const background = opaqueOver(t.canvas, surface) as Color;
  const bandHeight = DOCUMENT.fadeHeight / DOCUMENT.fadeOpacities.length;
  return v_flex()
    .id(id)
    .absolute()
    .inset_0()
    .justify_end()
    .children(
      DOCUMENT.fadeOpacities.map((opacity) =>
        div().h(bandHeight).flex_none().bg(background).opacity(opacity),
      ),
    );
}

/**
 * What a {@link documentCard} shows.
 */
export type DocumentCardOptions = {
  /**
   * Qualifies every part's id (`document-card-<id>`, `document-<id>`…), isolating its UI state.
   */
  id: string;
  /**
   * The section's header; default `Document`.
   */
  title?: string;
  /**
   * The markdown.
   */
  text: string;
  /**
   * What an empty document says; default `No document`.
   */
  empty?: string;
  open: boolean;
  /**
   * A collapsed preview's height cap in px; {@link DOCUMENT.previewViewportRatio} times the
   * window's height gives the Tasks panel's.
   */
  previewHeight: number;
  /**
   * The paint behind the card (`surface` in a pane, `popover` in an overlay).
   */
  surface: Color;
  toggle: (cx: Context) => void;
};

/**
 * A document card: its header, then the markdown, collapsed to a faded preview until revealed.
 * @param t The theme.
 * @param options What it shows.
 * @returns The section.
 */
export function documentCard(t: Theme, options: DocumentCardOptions): Element {
  const { id, open } = options;
  const header = cardHeader(t, `document-header-${id}`, options.title ?? "Document");
  if (options.text.trim() === "")
    return cardSection(
      header,
      card(t, `document-card-${id}`).child(cardNote(t, options.empty ?? "No document")),
    );
  const markdown = TextView.markdown(`document-${id}`, options.text)
    .selectable()
    .text_size(TEXT.body)
    .text_color(t.foreground);
  const content = open
    ? markdown
    : v_flex()
        .id(`document-preview-${id}`)
        .w_full()
        .relative()
        .max_h(options.previewHeight)
        .overflow_hidden()
        .child(markdown)
        .child(documentFade(t, `document-fade-${id}`, options.surface));
  return cardSection(
    header,
    card(t, `document-card-${id}`).child(
      cardBody().child(
        v_flex()
          .gap(DOCUMENT.gap)
          .child(content)
          .child(
            h_flex()
              .w_full()
              .justify_center()
              .child(
                button(t, {
                  id: `document-toggle-${id}`,
                  icon: open ? HERDR_ICONS.chevronDown : HERDR_ICONS.chevronRight,
                  label: open ? "Show less" : "Reveal more",
                  onClick: options.toggle,
                }),
              ),
          ),
      ),
    ),
  );
}
