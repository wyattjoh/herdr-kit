import type { Context, Element } from "gpui-kit";
import {
  card,
  cardHeader,
  cardItem,
  cardSection,
  chipRow,
  labelChip,
  toggleChip,
  togglePill,
  HERDR_ICONS,
  type Theme,
} from "@wyattjoh/herdr-ui";
import { BUNDLED } from "./shared";

/**
 * Builds the editable label chips and the gallery's toggle pills.
 */
export function labels(options: {
  t: Theme;
  applied: ReadonlySet<string>;
  shown: boolean;
  onToggleLabel(name: string, cx: Context): void;
  onTogglePill(cx: Context): void;
}): Element {
  const { t, applied, shown, onToggleLabel, onTogglePill } = options;
  return cardSection(
    cardHeader(t, "labels-header", "Labels"),
    card(t, "labels").child(
      cardItem(t, "labels-body", true)
        .child(
          chipRow([
            ...["bug", "docs"].map((name) =>
              toggleChip(t, {
                id: `label-${name}`,
                label: name,
                applied: applied.has(name),
                color: name === "bug" ? "#d73a4a" : undefined,
                onClick: (cx) => onToggleLabel(name, cx),
              }),
            ),
            toggleChip(t, {
              id: "label-ci",
              label: "ci",
              applied: false,
              pending: true,
              color: "#0075ca",
              caption: "Applying…",
            }),
            toggleChip(t, {
              id: "label-locked",
              label: "locked",
              applied: false,
              color: undefined,
            }),
            labelChip(t, {
              id: "label-tag",
              label: "release",
              icon: BUNDLED.tag,
            }),
          ]),
        )
        .child(
          chipRow([
            togglePillElement(t, {
              id: "pill",
              label: "CI",
              icon: HERDR_ICONS.gitBranch,
              lit: shown,
              tooltip: "CI passing",
              onClick: onTogglePill,
            }),
            togglePill(t, {
              id: "pill-inert",
              label: "CI",
              icon: HERDR_ICONS.gitBranch,
              lit: false,
            }),
          ]),
        ),
    ),
  );
}
