// A gallery of every @wyattjoh/herdr-ui piece, built the way a consumer builds a mod.
// `bun run mod:check` packs the package, installs the tarball into a scratch consumer, bundles
// this file there and loads it once with `herdr-app check` in an isolated Herdr home.
import { View, type AsyncContext, type Context, type Element } from "gpui-kit";
import { InputState, v_flex } from "gpui-base";
import { theme } from "herdr";
import {
  brand,
  BRAND,
  bundledIconPaths,
  button,
  card,
  cardHeader,
  cardItem,
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
  floatScrollRegion,
  labelChip,
  letThrough,
  listRow,
  loadingState,
  menuInput,
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
  staticRow,
  statusMark,
  stopPress,
  tabBar,
  titleIcon,
  titleRow,
  toggleChip,
  togglePill,
  toneMap,
  toolRow,
  topBar,
  type Theme,
} from "@wyattjoh/herdr-ui";

const MOD = "herdr-ui-gallery";
const ICONS = panelIcons(MOD);
const BUNDLED = bundledIconPaths(MOD);
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
  private applied = new Set<string>(["bug"]);
  private shown = false;
  private search: InputState | undefined;

  init(_props: unknown, _cx: AsyncContext): void {
    this.search = InputState.new({ placeholder: "Search" });
  }

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
                id: "refresh",
                label: "Refresh",
                icon: BUNDLED.refresh,
                onClick: () => {},
              }),
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
      .child(this.plain(t))
      .child(this.toggles(t))
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
      .child(
        menuPanel(t, MENU.width)
          .when(this.search !== undefined, (el) =>
            el.child(menuInput(t, this.search!, "GalleryMenu")),
          )
          .child(rowNote(t, "Menu surface")),
      )
      .child(this.overlay(t));
  }

  // A plain card (no groups): a first row with no top rule, a static row whose button is the
  // click target, an inert list row with a tooltipped mark, and a multi-line item.
  private plain(t: Theme): Element {
    return cardSection(
      cardHeader(t, "checks-header", "Checks"),
      card(t, "checks")
        .child(
          listRow(t, {
            id: "check-build",
            mark: statusMark(t, HERDR_ICONS.circleCheck, runTone("passed"), "completed · success"),
            title: "build",
            first: true,
            onClick: () => {},
          }),
        )
        .child(
          staticRow(t, "check-lint")
            .h(34)
            .child(statusMark(t, HERDR_ICONS.spinner, runTone("running"), "running · unavailable"))
            .child(rowNote(t, "lint"))
            .child(button(t, { id: "check-lint-open", label: "Logs", onClick: () => {} })),
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

  // Label toggles (applied, unapplied, pending, inert), a tag label chip, and the toggle pill
  // lit, unlit and inert.
  private toggles(t: Theme): Element {
    const flip = (name: string, cx: Context) => {
      if (!this.applied.delete(name)) this.applied.add(name);
      cx.notify();
    };
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
                  applied: this.applied.has(name),
                  color: name === "bug" ? "#d73a4a" : undefined,
                  onClick: (cx) => flip(name, cx),
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
                color: undefined,
              }),
            ]),
          )
          .child(
            chipRow([
              togglePill(t, {
                id: "pill",
                label: "CI",
                icon: HERDR_ICONS.gitBranch,
                lit: this.shown,
                tooltip: "CI passing",
                onClick: (cx) => {
                  this.shown = !this.shown;
                  cx.notify();
                },
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

  // The floating overlay's half: a fixed-width frame, the top bar reaching over Herdr's frame
  // strip, a one-line tool row with fitted labels, inert and active buttons, and a capped viewport.
  private overlay(t: Theme): Element {
    const width = 320;
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
                onClick: () => {},
              }),
            ],
            trailing: [
              button(t, {
                id: "float-pinned",
                label: tools[1]!.label,
                icon: ICONS.pinned,
                labelled: tools[1]!.labelled,
                active: true,
                onClick: () => {},
              }),
              button(t, { id: "float-inert", label: "Dock", icon: ICONS.dock, labelled: false }),
            ],
          }),
        }),
      )
      .child(
        panelBody({
          id: "gallery-float-body",
          scrollCap: 120,
          hold: stopPress,
          content: floatScrollRegion(
            "gallery-float-scroll",
            120,
            cardSection(
              cardHeader(t, "float-header", "Overlay"),
              card(t, "float-card").child(cardNote(t, "Capped and scrolling")),
            ),
          ),
        }),
      );
  }
}
