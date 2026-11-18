// Empty, error and loading blocks: a title, an optional detail and an optional action.
import { div, type Element } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { STATE, TEXT } from "../tokens";
import type { Theme } from "./theme";

/**
 * What a state block says.
 */
export type StateOptions = {
  title: string;
  detail?: string;
  /**
   * A control below, like a Sign in or Retry button.
   */
  action?: Element;
};

/**
 * A message block: the title in the foreground, its detail muted, then an optional action.
 * @param t The theme.
 * @param options What it says.
 * @returns The block.
 */
export const stateBlock = (t: Theme, options: StateOptions): Element =>
  v_flex()
    .gap(STATE.gap)
    .child(div().text_size(TEXT.body).font_medium().text_color(t.foreground).child(options.title))
    .when(options.detail !== undefined, (el) =>
      el.child(div().text_size(TEXT.label).text_color(t.muted).child(options.detail!)),
    )
    .when(options.action !== undefined, (el) => el.child(h_flex().child(options.action!)));

/**
 * Nothing to show yet, and how to get something.
 * @param t The theme.
 * @param options What it says.
 * @returns The block.
 */
export const emptyState = (t: Theme, options: StateOptions): Element => stateBlock(t, options);

/**
 * Something failed: what, why, and maybe a retry.
 * @param t The theme.
 * @param options What it says.
 * @returns The block.
 */
export const errorState = (t: Theme, options: StateOptions): Element => stateBlock(t, options);

/**
 * Work in progress.
 * @param t The theme.
 * @param title What is loading; default `Loading…`.
 * @param detail What the person can do meanwhile.
 * @returns The block.
 */
export const loadingState = (
  t: Theme,
  title = "Loading…",
  detail: string | undefined = undefined,
): Element => stateBlock(t, detail === undefined ? { title } : { title, detail });
