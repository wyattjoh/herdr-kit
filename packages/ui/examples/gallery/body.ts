import { svg, type Context, type Element } from "gpui-kit";
import { v_flex } from "gpui-base";
import {
  button,
  card,
  cardBody,
  cardHeader,
  cardNote,
  cardSection,
  compactStateBlock,
  countChip,
  emptyState,
  errorState,
  loadingState,
  documentCard,
  menuInput,
  menuPanel,
  menuRow,
  metadataGrid,
  MENU,
  PANEL,
  rowNote,
  skeletonRows,
  tabBar,
  type Theme,
  HERDR_ICONS,
  toneLine,
} from "@wyattjoh/herdr-ui";
import { checks } from "./checks";
import { labels } from "./labels";
import { overlay } from "./overlay";
import { runs } from "./runs";
import { noop } from "./shared";
import type { GalleryState, Tab } from "./types";

/**
 * Builds the scrollable gallery body from its capability regions.
 */
export function body(options: {
  t: Theme;
  state: GalleryState;
  onTab(tab: Tab, cx: Context): void;
  onToggleDocument(cx: Context): void;
  onToggleFold(id: string, cx: Context): void;
  onToggleLabel(name: string, cx: Context): void;
  onTogglePill(cx: Context): void;
}): Element {
  const { t, state, onTab, onToggleDocument, onToggleFold, onToggleLabel, onTogglePill } = options;
  return v_flex()
    .id("gallery-body")
    .flex_none()
    .min_w_0()
    .gap(PANEL.sectionGap)
    .child(
      tabBar(t, {
        id: "gallery-tabs",
        tabs: [
          { id: "overview", label: "Overview", selected: state.tab === "overview" },
          { id: "checks", label: "Checks", selected: state.tab === "checks" },
        ],
        onTab,
      }),
    )
    .child(
      documentCard(t, {
        id: "gallery",
        text: "# Gallery\n\nEvery piece of the package, once.",
        open: state.document,
        previewHeight: 80,
        surface: t.surface,
        toggle: onToggleDocument,
      }),
    )
    .child(runs({ t, open: state.open, onToggleFold }))
    .child(checks(t))
    .child(
      labels({
        t,
        applied: state.applied,
        shown: state.shown,
        onToggleLabel,
        onTogglePill,
      }),
    )
    .child(
      cardSection(
        cardHeader(t, "empty-header", "Empty"),
        card(t, "empty").child(cardNote(t, "No runs")),
      ),
    )
    .child(
      countChip({
        id: "blocked",
        count: 2,
        icon: HERDR_ICONS.minus,
        color: t.ansi1,
        tooltip: "Blocked by 2",
      }),
    )
    .child(emptyState(t, { title: "Nothing to show", detail: "Focus a terminal in a repository." }))
    .child(
      errorState(t, {
        id: "gallery-error",
        title: "Couldn't load runs",
        detail: "network down",
        action: button(t, { id: "retry", label: "Retry", onClick: noop }),
      }),
    )
    .child(loadingState(t))
    .child(
      toneLine(
        t,
        "warning",
        "Showing cached results",
        "The repository connection is unavailable; showing the last successful scan.",
      ),
    )
    .child(
      card(t, "gallery-compact-state").child(
        cardBody().child(
          compactStateBlock(t, {
            id: "gallery-compact-loading",
            title: "Reading repository",
            detail: "This may take a moment.",
          }),
        ),
      ),
    )
    .child(
      metadataGrid(t, {
        id: "gallery-metadata",
        cells: [
          { id: "state", label: "State", value: "Active" },
          { id: "owner", label: "Owner", value: "Herdr UI" },
          { id: "count", label: "Items", value: "3" },
        ],
      }),
    )
    .children(skeletonRows(t, "gallery-skeleton-row", 3))
    .child(
      menuPanel(t, MENU.width)
        .when(state.search !== undefined, (el) =>
          el.child(menuInput(t, state.search!, "GalleryMenu")),
        )
        .child(
          menuRow(t, {
            id: "gallery-menu-row",
            label: "Open details",
            leading: svg(HERDR_ICONS.terminal).size(MENU.icon).flex_none().text_color(t.muted),
            flyout: true,
            checked: true,
            selected: true,
            onClick: noop,
          }),
        )
        .child(rowNote(t, "Menu surface")),
    )
    .child(overlay(t));
}
