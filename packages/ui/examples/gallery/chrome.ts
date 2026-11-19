import type { Context, Element } from "gpui-kit";
import {
  brand,
  button,
  crumb,
  crumbBand,
  crumbPicker,
  HERDR_ICONS,
  letThrough,
  panelFooter,
  titleIcon,
  titleRow,
  toolRow,
  topBar,
  type Theme,
} from "@wyattjoh/herdr-ui";
import { ICONS, BUNDLED, noop } from "./shared";

/**
 * Builds the top bar, breadcrumb trail, and title row above the panel body.
 */
export function chrome(options: {
  t: Theme;
  picker: boolean;
  onPickerOpen(open: boolean, cx: Context): void;
}): Element[] {
  const { t, picker, onPickerOpen } = options;
  return [
    topBar(t, {
      floating: false,
      content: toolRow({
        fixed: false,
        brand: brand(t, { icon: ICONS.openInBrowser, name: "Gallery" }),
        leading: [
          button(t, {
            id: "follow",
            label: "Follow agent",
            icon: ICONS.follow,
            labelled: false,
            onClick: noop,
          }),
          button(t, {
            id: "pin",
            label: "Pin",
            icon: ICONS.pin,
            labelled: false,
            onClick: noop,
          }),
        ],
        trailing: [
          button(t, {
            id: "refresh",
            label: "Refresh",
            icon: BUNDLED.refresh,
            spin: 1000,
            onClick: noop,
          }),
          button(t, {
            id: "open",
            label: "Open in browser",
            icon: ICONS.openInBrowser,
            labelled: false,
            onClick: noop,
          }),
        ],
      }),
    }),
    crumbBand(t, [
      crumbPicker(t, {
        id: "repo",
        any: "All repos",
        choices: [
          {
            name: "herdr-ui",
            key: "repo-uuid",
            icon: HERDR_ICONS.gitBranch,
            color: undefined,
          },
        ],
        chosen: "repo-uuid",
        open: picker,
        current: false,
        browse: noop,
        pick: noop,
        setOpen: onPickerOpen,
        hold: letThrough,
      }),
      crumb(t, { id: "crumb-pr", label: "#42", onClick: noop }),
      crumb(t, { id: "crumb-run", label: "Run #119", current: true, truncate: false }),
    ]),
    titleRow(t, {
      identifier: "#42",
      title: "Extract the shared UI package",
      icon: titleIcon(t, HERDR_ICONS.gitBranch),
      trailingId: "page-title-copy",
      trailing: button(t, {
        id: "copy-id",
        label: "ID",
        icon: ICONS.copy,
        tooltip: "Copy ID",
        onClick: noop,
      }),
    }),
  ];
}

/**
 * Builds the gallery panel's diagnostics footer.
 */
export function footer(t: Theme): Element {
  return panelFooter(t, "gallery-footer", [
    button(t, {
      id: "copy-diagnostics",
      label: "Copy Diagnostics",
      icon: ICONS.copy,
      onClick: noop,
    }),
  ]);
}
