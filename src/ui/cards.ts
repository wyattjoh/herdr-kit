// Bordered cards with an external header, their rows, collapsible groups of rows, and the
// progress bar a row can end with. A card clips its rectangle, not its corners, so a band
// painted in a corner (a header, a closed last group, a hovered last row) rounds that corner
// itself.
import { div, svg, type Color, type Context, type Element } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { HERDR_ICONS } from "../icons";
import { CARD, FOLD_MOTION, PROGRESS, ROW, TEXT, TONES } from "../tokens";
import { role, type Theme } from "./theme";

/**
 * A card's outline and the rules between its groups. `border` is a translucent white that reads
 * light over a group's `popover` band but faint over the darker card; `input`, a stronger one,
 * matches that light line over both.
 * @param t The theme.
 * @returns The line color.
 */
export const cardLine = (t: Theme): Color => t.input;

/**
 * A bordered card on `canvas`, so its body and rows take that color with its rounded corners.
 * @param t The theme.
 * @param id The card's id.
 * @returns The card; add a body or groups as children.
 */
export const card = (t: Theme, id: string): Element =>
  v_flex()
    .id(id)
    .flex_none()
    .bg(t.canvas)
    .border(1)
    .border_color(cardLine(t))
    .rounded(CARD.radius)
    .overflow_hidden();

/**
 * A fold's chevron, just after the label it folds.
 * @param t The theme.
 * @param open Whether the fold is open.
 * @returns The chevron.
 */
export const foldChevron = (t: Theme, open: boolean): Element =>
  svg(open ? HERDR_ICONS.chevronDown : HERDR_ICONS.chevronRight)
    .size(CARD.chevronSize)
    .flex_none()
    .text_color(t.dim);

/**
 * A section's muted title on the panel background, outside its card.
 * @param t The theme.
 * @param id The header's id.
 * @param name The section's name.
 * @param open When the section folds, whether it is open (draws the chevron).
 * @returns The header.
 */
export const cardHeader = (
  t: Theme,
  id: string,
  name: string,
  open: boolean | undefined = undefined,
): Element =>
  h_flex()
    .id(id)
    .h(CARD.headerHeight)
    .flex_none()
    .px(CARD.paddingX)
    .gap(CARD.headerGap)
    .items_center()
    .child(div().text_size(TEXT.body).font_medium().text_color(t.muted).child(name))
    .when(open !== undefined, (el) => el.child(foldChevron(t, open!)));

/**
 * A section: its header close above its card.
 * @param header The {@link cardHeader}.
 * @param content The {@link card}.
 * @returns The section.
 */
export const cardSection = (header: Element, content: Element): Element =>
  v_flex().flex_none().gap(CARD.sectionGap).child(header).child(content);

/**
 * Content padding inside a card, which supplies the outline and corners.
 * @returns The padded body.
 */
export const cardBody = (): Element => div().px(CARD.paddingX).py(CARD.paddingY);

/**
 * A card's dimmed note, for an empty card or a "N more." footer.
 * @param text The note.
 * @returns The padded note.
 */
export const cardNote = (t: Theme, text: string): Element =>
  cardBody().text_size(TEXT.label).text_color(t.dim).child(text);

/**
 * A row of a card, ruled off from the one above; it highlights on hover.
 * @param t The theme.
 * @param id The row's id.
 * @param hover The hover fill; default `hover`.
 * @returns The row; set its height and add its parts.
 */
export const cardRow = (t: Theme, id: string, hover: Color = t.hover): Element =>
  h_flex()
    .id(id)
    .flex_none()
    .px(CARD.paddingX)
    .gap(CARD.rowGap)
    .items_center()
    .cursor_pointer()
    .hover((s) => s.bg(hover))
    .border_t(1)
    .border_color(t.border);

/**
 * What a {@link listRow} shows and does.
 */
export type ListRowOptions = {
  id: string;
  title: string;
  /**
   * A leading mark, such as a status icon.
   */
  mark?: Element;
  /**
   * A key or number, drawn muted before the title.
   */
  label?: string;
  /**
   * The title's theme role; default `foreground` (the Tasks panel dims a canceled row).
   */
  titleRole?: string;
  /**
   * Items after the title: chips, a dimmed note, a progress bar.
   */
  trailing?: readonly Element[];
  /**
   * The row's height; default {@link ROW.list}.
   */
  height?: number;
  tooltip?: string;
  onClick: (cx: Context) => void;
};

/**
 * A row of a list card: its mark, key and title, then what else it says.
 * @param t The theme.
 * @param options What it shows and does.
 * @returns The row.
 */
export function listRow(t: Theme, options: ListRowOptions): Element {
  return cardRow(t, options.id)
    .h(options.height ?? ROW.list)
    .when(options.tooltip !== undefined, (el) => el.tooltip(options.tooltip!))
    .on_click((_event, cx) => options.onClick(cx))
    .when(options.mark !== undefined, (el) => el.child(options.mark!))
    .when(options.label !== undefined && options.label !== "", (el) =>
      el.child(div().flex_none().text_size(TEXT.label).text_color(t.muted).child(options.label!)),
    )
    .child(
      div()
        .flex_1()
        .min_w_0()
        .truncate()
        .text_size(TEXT.body)
        .text_color(role(t, options.titleRole ?? "foreground"))
        .child(options.title),
    )
    .children([...(options.trailing ?? [])]);
}

/**
 * A dimmed note at a row's end, like the Project a listing row belongs to.
 * @param t The theme.
 * @param text The note.
 * @returns The note.
 */
export const rowNote = (t: Theme, text: string): Element =>
  div().flex_none().text_size(TEXT.label).text_color(t.dim).child(text);

/**
 * A status mark at the size list rows give their icons.
 * @param t The theme.
 * @param icon The `svg()` path.
 * @param tone The theme role tinting it.
 * @returns The mark.
 */
export const statusMark = (t: Theme, icon: string, tone: string): Element =>
  svg(icon).size(14).flex_none().text_color(role(t, tone));

/**
 * One collapsible group of a card: a header band with its label in its tone, the chevron and its
 * count, then its rows while it's open.
 */
export type GroupBlockOptions = {
  id: string;
  label: string;
  /**
   * The label's theme role.
   */
  tone: string;
  count: number;
  rows: readonly Element[];
  /**
   * Every row's fixed height, which the fold animates to and from.
   */
  rowHeight: number;
  open: boolean;
  /**
   * The card's first group: rounds its top corners, with no top rule.
   */
  first: boolean;
  /**
   * The card's last group: rounds its bottom band (the header while closed, the last row while
   * open).
   */
  last: boolean;
  toggle: (cx: Context) => void;
  /**
   * Passive size measurement.
   */
  measure?: (size: { width: number; height: number }) => void;
};

/**
 * A group of rows. The band is `popover`, `raised` on hover, above the card's `canvas` rows.
 * @param t The theme.
 * @param motionScope Qualifies the animated body's id: native motion can be sampled before
 *   parent id scopes apply, so retained screens with different height targets need their own.
 * @param group The group.
 * @returns The group.
 */
export function groupBlock(t: Theme, motionScope: string, group: GroupBlockOptions): Element {
  const { open, first, last } = group;
  return v_flex()
    .id(group.id)
    .when(group.measure !== undefined, (el) => el.on_size_change((size) => group.measure!(size)))
    .child(
      cardRow(t, `${group.id}-toggle`, t.raised)
        .h(CARD.groupHeaderHeight)
        .bg(t.popover)
        .when(first, (el) => el.border_t(0).rounded_t(CARD.innerRadius))
        .when(last && !open, (el) => el.rounded_b(CARD.innerRadius))
        .text_size(TEXT.label)
        .on_click((_event, cx) => group.toggle(cx))
        .child(div().font_medium().text_color(role(t, group.tone)).child(group.label))
        .child(foldChevron(t, open))
        .child(div().text_color(t.dim).child(String(group.count)))
        .child(div().flex_1()),
    )
    .child(
      v_flex()
        .id(`${motionScope}-${group.id}-body`)
        .overflow_hidden()
        .h(open ? group.rows.length * group.rowHeight : 0)
        .transition("height", FOLD_MOTION)
        .children(
          group.rows.map((row, index) =>
            row.when(last && index === group.rows.length - 1, (el) =>
              el.rounded_b(CARD.innerRadius),
            ),
          ),
        ),
    );
}

/**
 * A progress bar filled by `done` over `total`, and the fraction; `empty` when there is
 * nothing to count. Its width is fixed, so bars line up down a list.
 * @param t The theme.
 * @param progress The counts, the fill's theme role (default success), and the empty label.
 * @returns The bar.
 */
export function progressBar(
  t: Theme,
  progress: { done: number; total: number; tone?: string; empty?: string },
): Element {
  const { done, total } = progress;
  return h_flex()
    .flex_none()
    .w(PROGRESS.width + PROGRESS.gap + PROGRESS.labelWidth)
    .gap(PROGRESS.gap)
    .items_center()
    .justify_end()
    .text_size(TEXT.label)
    .text_color(t.dim)
    .when(total === 0, (el) => el.child(progress.empty ?? "None"))
    .when(total > 0, (el) =>
      el
        .child(
          div()
            .w(PROGRESS.width)
            .h(PROGRESS.height)
            .rounded(PROGRESS.radius)
            .overflow_hidden()
            .bg(t.border)
            .child(
              div()
                .h_full()
                .w(Math.round((PROGRESS.width * done) / total))
                .bg(role(t, progress.tone ?? TONES.success)),
            ),
        )
        .child(`${done}/${total}`),
    );
}
