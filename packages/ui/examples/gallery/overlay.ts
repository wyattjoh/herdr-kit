import type { Element } from "gpui-kit";
import {
  brand,
  BRAND,
  button,
  card,
  cardHeader,
  cardNote,
  cardSection,
  fitLabels,
  floatScrollRegion,
  panelBody,
  panelFrame,
  PANEL,
  stopPress,
  toolRow,
  topBar,
  type Theme,
} from "@wyattjoh/herdr-ui";
import { ICONS, noop } from "./shared";

/**
 * Builds the floating panel example with a fixed-width frame and capped scroll area.
 */
export function overlay(t: Theme): Element {
  const width = 320;
  const scrollCap = 120;
  const tools = fitLabels(
    [
      { id: "follow", label: "Follow agent", labelled: false },
      { id: "pin", label: "Pinned", labelled: false },
    ],
    width - PANEL.padding * 2 - BRAND.width,
    [["follow"]],
  );
  return panelFrame(t, "gallery-float", width)
    .child(
      topBar(t, {
        floating: true,
        id: "gallery-float-bar",
        content: toolRow({
          fixed: true,
          id: "gallery-float-tools",
          brand: brand(t, {
            icon: ICONS.openInBrowser,
            name: "Float",
            id: "gallery-float-brand",
          }),
          leading: [
            button(t, {
              id: "float-follow",
              label: tools[0]!.label,
              icon: ICONS.follow,
              labelled: tools[0]!.labelled,
              onClick: noop,
            }),
          ],
          trailing: [
            button(t, {
              id: "float-pinned",
              label: tools[1]!.label,
              icon: ICONS.pinned,
              labelled: tools[1]!.labelled,
              active: true,
              onClick: noop,
            }),
            button(t, { id: "float-inert", label: "Dock", icon: ICONS.dock, labelled: false }),
          ],
        }),
      }),
    )
    .child(
      panelBody({
        id: "gallery-float-body",
        scrollCap,
        hold: stopPress,
        content: floatScrollRegion(
          "gallery-float-scroll",
          scrollCap,
          cardSection(
            cardHeader(t, "float-header", "Overlay"),
            card(t, "float-card").child(cardNote(t, "Capped and scrolling")),
          ),
        ),
      }),
    );
}
