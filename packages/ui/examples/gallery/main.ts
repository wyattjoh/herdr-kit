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

  private changeState(cx: Context, change: () => void): void {
    change();
    cx.notify();
  }

  private toggle(set: Set<string>, value: string): void {
    if (!set.delete(value)) set.add(value);
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
      onTab: (tab, cx) => this.changeState(cx, () => (this.tab = tab)),
      onToggleDocument: (cx) => this.changeState(cx, () => (this.document = !this.document)),
      onToggleFold: (id, cx) => this.changeState(cx, () => this.toggle(this.open, id)),
      onToggleLabel: (name, cx) => this.changeState(cx, () => this.toggle(this.applied, name)),
      onTogglePill: (cx) => this.changeState(cx, () => (this.shown = !this.shown)),
    });
    return panelFrame(t, MOD_ID).children([
      ...chrome({
        t,
        picker: this.picker,
        onPickerOpen: (open, cx) => this.changeState(cx, () => (this.picker = open)),
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
