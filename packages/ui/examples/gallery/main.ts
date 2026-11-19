// A gallery of every @wyattjoh/herdr-ui piece, built the way a consumer builds a mod.
// `bun run mod:check` packs the package, installs the tarball into a scratch consumer, bundles
// this file there and loads it once with `herdr-app check` in an isolated Herdr home.
import { View, type AsyncContext, type Context, type Element } from "gpui-kit";
import { InputState } from "gpui-base";
import { theme } from "herdr";
import {
  letThrough,
  paneScrollRegion,
  panelBody,
  panelFrame,
  PANEL,
  type Theme,
} from "@wyattjoh/herdr-ui";
import { chrome, footer } from "./chrome";
import { MOD_ID } from "./shared";
import { body } from "./body";
import type { Tab } from "./types";

/**
 * Interactive composition root for the package gallery mod.
 */
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

  private toggleFold(id: string, cx: Context): void {
    if (!this.open.delete(id)) this.open.add(id);
    cx.notify();
  }

  private toggleLabel(name: string, cx: Context): void {
    if (!this.applied.delete(name)) this.applied.add(name);
    cx.notify();
  }

  private setPicker(open: boolean, cx: Context): void {
    this.picker = open;
    cx.notify();
  }

  private selectTab(tab: Tab, cx: Context): void {
    this.tab = tab;
    cx.notify();
  }

  private toggleDocument(cx: Context): void {
    this.document = !this.document;
    cx.notify();
  }

  private togglePill(cx: Context): void {
    this.shown = !this.shown;
    cx.notify();
  }

  render(): Element {
    const t = theme() as Theme;
    const content = body({
      t,
      state: {
        tab: this.tab,
        open: this.open,
        document: this.document,
        applied: this.applied,
        shown: this.shown,
        search: this.search,
      },
      onTab: (tab, cx) => this.selectTab(tab, cx),
      onToggleDocument: (cx) => this.toggleDocument(cx),
      onToggleFold: (id, cx) => this.toggleFold(id, cx),
      onToggleLabel: (name, cx) => this.toggleLabel(name, cx),
      onTogglePill: (cx) => this.togglePill(cx),
    });
    return panelFrame(t, MOD_ID).children([
      ...chrome({
        t,
        picker: this.picker,
        onPickerOpen: (open, cx) => this.setPicker(open, cx),
      }),
      panelBody({
        contentId: "panel-content",
        hold: letThrough,
        content: paneScrollRegion("gallery-scroll", content, PANEL.padding),
      }),
      footer(t),
    ]);
  }
}
