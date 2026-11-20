// The breadcrumb band and the page title row under it.
import { div, svg, type Context, type Element } from "gpui-kit";
import { h_flex, Popover, v_flex } from "gpui-base";
import { HERDR_ICONS } from "../icons";
import { CRUMB, PANEL, PICKER, TEXT, TITLE } from "../tokens";
import { BUTTON_STYLE } from "../toolbar";
import { foldChevron } from "./cards";
import { dataColor } from "./data-color";
import { letThrough, type Hold, type Theme } from "./theme";

/**
 * The separator drawn between crumbs.
 * @param t The theme.
 * @returns The separator.
 */
export const crumbSeparator = (t: Theme): Element =>
  div().flex_none().text_color(t.dim).child(CRUMB.separator);

/**
 * The band under the top bar, ruled off above and below, holding the crumbs with a separator
 * between each.
 * @param t The theme.
 * @param crumbs The crumbs, root first.
 * @param id The band's id; default `breadcrumb`.
 * @returns The band.
 */
export function crumbBand(t: Theme, crumbs: readonly Element[], id = "breadcrumb"): Element {
  return h_flex()
    .id(id)
    .flex_none()
    .h(CRUMB.height)
    .px(PANEL.padding)
    .gap(CRUMB.gap)
    .items_center()
    .border_t(1)
    .border_b(1)
    .border_color(t.border)
    .text_size(TEXT.label)
    .text_color(t.muted)
    .children(
      crumbs.flatMap((crumb, index) => (index === 0 ? [crumb] : [crumbSeparator(t), crumb])),
    );
}

/**
 * What a {@link crumb} shows and does.
 */
export type CrumbOptions = {
  id: string;
  label: string;
  /**
   * A leading mark, such as a status icon.
   */
  icon?: Element;
  /**
   * The trail ends here: drawn in the foreground.
   */
  current?: boolean;
  /**
   * Opens what the crumb names; without one the crumb is inert.
   */
  onClick?: (cx: Context) => void;
  tooltip?: string;
  /**
   * Whether the label shrinks and truncates (default) or keeps its width, as a key does.
   */
  truncate?: boolean;
  hold?: Hold;
};

/**
 * One step of the trail: muted, foreground on hover when it opens something, and foreground when
 * it is where the trail ends.
 * @param t The theme.
 * @param options What it shows and does.
 * @returns The crumb.
 */
export function crumb(t: Theme, options: CrumbOptions): Element {
  const { onClick } = options;
  const hold = options.hold ?? letThrough;
  const label = div().child(options.label);
  const item = h_flex()
    .id(options.id)
    .min_w_0()
    .gap(CRUMB.itemGap)
    .items_center()
    .when(options.current === true, (el) => el.text_color(t.foreground))
    .when(options.tooltip !== undefined, (el) => el.tooltip(options.tooltip!))
    .when(onClick !== undefined, (el) =>
      el
        .cursor_pointer()
        .hover((s) => s.text_color(t.foreground))
        .on_click((_event, cx) => onClick!(cx)),
    )
    .when(options.icon !== undefined, (el) => el.child(options.icon!))
    .child(options.truncate === false ? label.flex_none() : label.min_w_0().truncate());
  return onClick === undefined ? item : hold(item);
}

/**
 * One choice of a {@link crumbPicker}: its name and an optional icon in its own color.
 */
export type PickerOption = {
  name: string;
  /**
   * The option's identity for its row id, selection and `pick`; defaults to `name`.
   */
  key?: string;
  /**
   * The icon's `svg()` path; when omitted, no icon is drawn.
   */
  icon?: string;
  /**
   * The icon's color (data, such as a user-picked color); when omitted, `muted`.
   */
  color?: string;
};

/**
 * What a {@link crumbPicker} offers.
 */
export type CrumbPickerOptions = {
  /**
   * The picker's id; its parts are `<id>-crumb`, `<id>-chevron`, `<id>-popover`,
   * `<id>-list` and `<id>-<choice key>` (the name by default; `<id>-all` for the "any" row).
   */
  id: string;
  /**
   * What choosing nothing is called, like "All projects".
   */
  any: string;
  choices: readonly PickerOption[];
  /**
   * The chosen option's key (or its name when it has no key); omit it or pass undefined for "any".
   */
  chosen?: string;
  open: boolean;
  /**
   * It's the last crumb, where the trail ends.
   */
  current: boolean;
  /**
   * Opens what the crumb names.
   */
  browse: (cx: Context) => void;
  /**
   * Picks a choice by key (or its name when it has no key), or undefined for "any".
   */
  pick: (key: string | undefined, cx: Context) => void;
  /**
   * The popover opened or closed.
   */
  setOpen: (open: boolean, cx: Context) => void;
  /**
   * The chevron's tooltip; default `Switch <id>`.
   */
  switchTooltip?: string;
  hold?: Hold;
};

const optionIcon = (t: Theme, option: PickerOption): Element =>
  svg(option.icon!)
    .size(BUTTON_STYLE.iconSize)
    .flex_none()
    .text_color(dataColor(option.color, t.muted));

/**
 * A breadcrumb with a dropdown: the chosen option (or "any") with its icon, which browses it when
 * pressed, and a chevron after it, which opens a list of the others to switch to.
 * @param t The theme.
 * @param options What it offers.
 * @returns The picker.
 */
export function crumbPicker(t: Theme, options: CrumbPickerOptions): Element {
  const hold = options.hold ?? letThrough;
  const keyOf = (choice: PickerOption | undefined) => choice?.key ?? choice?.name;
  const chosen = options.choices.find((choice) => keyOf(choice) === options.chosen);
  const chosenName = chosen?.name ?? options.any;
  const option = (choice: PickerOption | undefined) => {
    const isChosen = keyOf(choice) === keyOf(chosen);
    return h_flex()
      .id(`${options.id}-${keyOf(choice) ?? "all"}`)
      .h(BUTTON_STYLE.height)
      .flex_none()
      .px(PICKER.optionPaddingX)
      .gap(PICKER.optionGap)
      .items_center()
      .text_size(TEXT.label)
      .text_color(isChosen ? t.foreground : t.muted)
      .hover((style) => style.bg(t.hover))
      .on_click((_event, cx) => options.pick(keyOf(choice), cx))
      .when(choice?.icon !== undefined, (el) => el.child(optionIcon(t, choice!)))
      .child(
        div()
          .flex_1()
          .min_w_0()
          .truncate()
          .child(choice?.name ?? options.any),
      )
      .when(isChosen, (el) =>
        el.child(svg(HERDR_ICONS.check).size(BUTTON_STYLE.iconSize).flex_none()),
      );
  };
  const label = hold(
    h_flex()
      .id(`${options.id}-crumb`)
      .gap(CRUMB.itemGap)
      .items_center()
      .min_w_0()
      .cursor_pointer()
      .text_color(options.current ? t.foreground : t.muted)
      .hover((style) => style.text_color(t.foreground))
      .tooltip(`Browse ${chosenName}`)
      .on_click((_event, cx) => options.browse(cx))
      .when(chosen?.icon !== undefined, (el) => el.child(optionIcon(t, chosen!)))
      .child(div().min_w_0().truncate().child(chosenName)),
  );
  const chevron = h_flex()
    .id(`${options.id}-chevron`)
    .px(PICKER.chevronPaddingX)
    .items_center()
    .cursor_pointer()
    .hover((style) => style.bg(t.hover))
    .rounded(PICKER.chevronRadius)
    .tooltip(options.switchTooltip ?? `Switch ${options.id}`)
    .child(foldChevron(t, true));
  return h_flex()
    .gap(2)
    .items_center()
    .min_w_0()
    .child(label)
    .child(
      Popover.new(`${options.id}-popover`)
        .open(options.open)
        .anchor("top_left")
        .on_open_change((open, cx) => options.setOpen(open, cx))
        .trigger(chevron)
        .content(
          v_flex()
            .id(`${options.id}-list`)
            .w(PICKER.width)
            .max_h(PICKER.rows * BUTTON_STYLE.height)
            .overflow_y_scroll()
            .rounded(PICKER.radius)
            .border_1()
            .border_color(t.input)
            .bg(t.popover)
            .child(option(undefined))
            .children(options.choices.map(option)),
        ),
    );
}

/**
 * What a {@link titleRow} shows.
 */
export type TitleRowOptions = {
  /**
   * The row's id; default `page-title`. Its icon is `<id>-icon`; its trailing slot defaults to
   * `<id>-trailing`.
   */
  id?: string;
  /**
   * The trailing slot's id; defaults to `<id>-trailing`.
   */
  trailingId?: string;
  title: string;
  /**
   * A record's key or number, drawn muted before the title.
   */
  identifier?: string;
  /**
   * A leading icon, centered on the title's first line.
   */
  icon?: Element;
  /**
   * A trailing control, centered on the title's first line (a Copy ID button).
   */
  trailing?: Element;
};

/**
 * The page's title in a row of its own under the breadcrumb band, ruled off below.
 * @param t The theme.
 * @param options What it shows.
 * @returns The row.
 */
export function titleRow(t: Theme, options: TitleRowOptions): Element {
  const id = options.id ?? "page-title";
  const lineBox = (partId: string, child: Element) =>
    h_flex().id(partId).flex_none().h(TITLE.lineHeight).items_center().child(child);
  return h_flex()
    .id(id)
    .flex_none()
    .min_w_0()
    .px(PANEL.padding)
    .py(TITLE.paddingY)
    .gap(TITLE.gap)
    .items_start()
    .border_b(1)
    .border_color(t.border)
    .text_size(TITLE.textSize)
    .font_semibold()
    .when(options.icon !== undefined, (el) => el.child(lineBox(`${id}-icon`, options.icon!)))
    .when(options.identifier !== undefined && options.identifier !== "", (el) =>
      el.child(div().flex_none().text_color(t.muted).child(options.identifier!)),
    )
    .child(div().flex_1().min_w_0().text_color(t.foreground).child(options.title))
    .when(options.trailing !== undefined, (el) =>
      el.child(lineBox(options.trailingId ?? `${id}-trailing`, options.trailing!)),
    );
}

/**
 * A title row's icon at the title's icon size.
 * @param t The theme.
 * @param icon The `svg()` path.
 * @param color Its color (data), else `muted`.
 * @returns The icon.
 */
export const titleIcon = (t: Theme, icon: string, color: string | undefined = undefined): Element =>
  svg(icon).size(TITLE.iconSize).flex_none().text_color(dataColor(color, t.muted));
