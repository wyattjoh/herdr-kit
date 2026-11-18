// A gallery of every @wyattjoh/herdr-ui piece, built the way a consumer builds a mod.
// `bun run mod:check` packs the package, installs the tarball into a scratch consumer, bundles
// this file there and loads it once with `herdr-app check` in an isolated Herdr home.
import { View, type Context, type Element } from "gpui-kit";
import { v_flex } from "gpui-base";
import { theme } from "herdr";
import {
  brand,
  button,
  card,
  cardHeader,
  cardNote,
  cardSection,
  chipRow,
  countChip,
  crumb,
  crumbBand,
  crumbPicker,
  documentCard,
  emptyState,
  errorState,
  fitLabels,
  groupBlock,
  HERDR_ICONS,
  labelChip,
  letThrough,
  listRow,
  loadingState,
  menuPanel,
  MENU,
  paneScrollRegion,
  panelBody,
  panelFooter,
  panelFrame,
  panelIcons,
  PANEL,
  progressBar,
  rowNote,
  statusMark,
  tabBar,
  titleIcon,
  titleRow,
  toneMap,
  toolRow,
  topBar,
  type Theme,
} from "@wyattjoh/herdr-ui";

const MOD = "herdr-ui-gallery";
const ICONS = panelIcons(MOD);
const runTone = toneMap({
  queued: "neutral",
  running: "active",
  passed: "success",
  failed: "danger",
});
type Tab = "overview" | "checks";

export default class Gallery extends View {
  private tab: Tab = "overview";
  private open = new Set<string>(["passed"]);
  private picker = false;
  private document = false;

  private toggle(id: string, cx: Context): void {
    if (!this.open.delete(id)) this.open.add(id);
    cx.notify();
  }

  private groups(t: Theme): Element {
    const states = ["passed", "failed"] as const;
    return cardSection(
      cardHeader(t, "runs-header", "Runs"),
      card(t, "runs").children(
        states.map((state, index) =>
          groupBlock(t, "gallery", {
            id: `runs-${state}`,
            label: state === "passed" ? "Passed" : "Failed",
            tone: runTone(state),
            count: 2,
            rows: [1, 2].map((n) =>
              listRow(t, {
                id: `run-${state}-${n}`,
                mark: statusMark(
                  t,
                  state === "passed" ? HERDR_ICONS.circleCheck : HERDR_ICONS.close,
                  runTone(state),
                ),
                label: `#${n}`,
                title: `Run ${n}`,
                trailing: [
                  chipRow([
                    labelChip(t, {
                      id: `run-${state}-${n}-chip`,
                      label: "main",
                      icon: HERDR_ICONS.gitBranch,
                      color: undefined,
                    }),
                  ]),
                  rowNote(t, "2m"),
                  progressBar(t, { done: n, total: 2 }),
                ],
                onClick: () => {},
              }),
            ),
            rowHeight: 34,
            open: this.open.has(state),
            first: index === 0,
            last: index === states.length - 1,
            toggle: (cx) => this.toggle(state, cx),
          }),
        ),
      ),
    );
  }

  render(): Element {
    const t = theme() as Theme;
    const tools = fitLabels(
      [
        { id: "follow", label: "Follow agent", labelled: false },
        { id: "pin", label: "Pin", labelled: false },
      ],
      undefined,
      [["follow"]],
    );
    const icon = { follow: ICONS.follow, pin: ICONS.pin } as const;
    return panelFrame(t, MOD, undefined)
      .child(
        topBar(t, {
          floating: false,
          content: toolRow({
            fixed: false,
            brand: brand(t, { icon: ICONS.openInBrowser, name: "Gallery" }),
            leading: tools.map((tool) =>
              button(t, {
                id: tool.id,
                label: tool.label,
                icon: icon[tool.id],
                labelled: tool.labelled,
                onClick: () => {},
              }),
            ),
            trailing: [
              button(t, {
                id: "open",
                label: "Open in browser",
                icon: ICONS.openInBrowser,
                labelled: false,
                onClick: () => {},
              }),
            ],
          }),
        }),
      )
      .child(
        crumbBand(t, [
          crumbPicker(t, {
            id: "repo",
            any: "All repos",
            choices: [{ name: "herdr-ui", icon: HERDR_ICONS.gitBranch, color: undefined }],
            chosen: "herdr-ui",
            open: this.picker,
            current: false,
            browse: () => {},
            pick: () => {},
            setOpen: (open, cx) => {
              this.picker = open;
              cx.notify();
            },
            hold: letThrough,
          }),
          crumb(t, { id: "crumb-pr", label: "#42", onClick: () => {} }),
          crumb(t, { id: "crumb-run", label: "Run #119", current: true, truncate: false }),
        ]),
      )
      .child(
        titleRow(t, {
          identifier: "#42",
          title: "Extract the shared UI package",
          icon: titleIcon(t, HERDR_ICONS.gitBranch),
          trailing: button(t, {
            id: "copy-id",
            label: "ID",
            icon: ICONS.copy,
            tooltip: "Copy ID",
            onClick: () => {},
          }),
        }),
      )
      .child(
        panelBody({
          scrollCap: undefined,
          hold: letThrough,
          content: paneScrollRegion("gallery-scroll", this.body(t), PANEL.padding),
        }),
      )
      .child(
        panelFooter(t, "gallery-footer", [
          button(t, {
            id: "copy-diagnostics",
            label: "Copy Diagnostics",
            icon: ICONS.copy,
            onClick: () => {},
          }),
        ]),
      );
  }

  private body(t: Theme): Element {
    return v_flex()
      .id("gallery-body")
      .flex_none()
      .min_w_0()
      .gap(PANEL.sectionGap)
      .child(
        tabBar(t, {
          id: "gallery-tabs",
          tabs: [
            { id: "overview", label: "Overview", selected: this.tab === "overview" },
            { id: "checks", label: "Checks", selected: this.tab === "checks" },
          ],
          onTab: (tab: Tab, cx) => {
            this.tab = tab;
            cx.notify();
          },
        }),
      )
      .child(
        documentCard(t, {
          id: "gallery",
          text: "# Gallery\n\nEvery piece of the package, once.",
          open: this.document,
          previewHeight: 80,
          surface: t.surface,
          toggle: (cx) => {
            this.document = !this.document;
            cx.notify();
          },
        }),
      )
      .child(this.groups(t))
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
      .child(
        emptyState(t, { title: "Nothing to show", detail: "Focus a terminal in a repository." }),
      )
      .child(
        errorState(t, {
          title: "Couldn't load runs",
          detail: "network down",
          action: button(t, { id: "retry", label: "Retry", onClick: () => {} }),
        }),
      )
      .child(loadingState(t))
      .child(menuPanel(t, MENU.width).child(rowNote(t, "Menu surface")));
  }
}
