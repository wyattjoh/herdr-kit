import type { Element } from "gpui-kit";
import {
  button,
  card,
  cardHeader,
  cardItem,
  cardSection,
  listRow,
  rowNote,
  staticRow,
  statusMark,
  HERDR_ICONS,
  ROW,
  type Theme,
} from "@wyattjoh/herdr-ui";
import { noop, runTone } from "./shared";

/**
 * Builds the plain checks card with its static and multi-line rows.
 */
export function checks(t: Theme): Element {
  return cardSection(
    cardHeader(t, "checks-header", "Checks"),
    card(t, "checks")
      .child(
        listRow(t, {
          id: "check-build",
          mark: statusMark(t, HERDR_ICONS.circleCheck, runTone("passed"), "completed · success"),
          title: "build",
          first: true,
          onClick: noop,
        }),
      )
      .child(
        staticRow(t, "check-lint")
          .h(ROW.list)
          .child(statusMark(t, HERDR_ICONS.spinner, runTone("running"), "running · unavailable"))
          .child(rowNote(t, "lint"))
          .child(button(t, { id: "check-lint-open", label: "Logs", onClick: noop })),
      )
      .child(
        listRow(t, {
          id: "check-test",
          mark: statusMark(t, HERDR_ICONS.clock, runTone("queued"), "queued · unavailable"),
          title: "test",
        }),
      )
      .child(
        cardItem(t, "check-note")
          .child(rowNote(t, "octocat · 2m"))
          .child(rowNote(t, "A comment of several lines.")),
      ),
  );
}
