// Empty, error and loading blocks: a title, an optional detail and an optional action.
import { div, type Element } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { STATE, TEXT, TONES, type Tone } from "../tokens";
import { role, type Theme } from "./theme";

/**
 * What a state block says.
 */
export type StateOptions = {
  /**
   * The block's id; omitted by default.
   */
  id?: string;
  title: string;
  detail?: string;
  /**
   * A control below, like a Sign in or Retry button.
   */
  action?: Element;
};

const drawState = (t: Theme, options: StateOptions, titleColor: Theme[string]): Element =>
  v_flex()
    .when(options.id !== undefined, (el) => el.id(options.id!))
    .gap(STATE.gap)
    .child(div().text_size(TEXT.body).font_medium().text_color(titleColor).child(options.title))
    .when(options.detail !== undefined, (el) =>
      el.child(div().text_size(TEXT.label).text_color(t.muted).child(options.detail!)),
    )
    .when(options.action !== undefined, (el) => el.child(h_flex().child(options.action!)));

/**
 * A message block: the title in the foreground, its detail muted, then an optional action.
 * @param t The theme.
 * @param options What it says, and an optional id for the block.
 * @returns The block.
 */
export const stateBlock = (t: Theme, options: StateOptions): Element =>
  drawState(t, options, t.foreground);

/**
 * A smaller state message for use inside a card.
 * @param t The theme.
 * @param options What it says, and an optional id for the block.
 * @returns The compact state block.
 */
export const compactStateBlock = (t: Theme, options: StateOptions): Element =>
  v_flex()
    .when(options.id !== undefined, (el) => el.id(options.id!))
    .gap(STATE.compactGap)
    .child(div().text_size(TEXT.label).font_medium().text_color(t.foreground).child(options.title))
    .when(options.detail !== undefined, (el) =>
      el.child(div().text_size(TEXT.caption).text_color(t.muted).child(options.detail!)),
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
 * What an {@link errorState} says.
 */
export type ErrorStateOptions = StateOptions & {
  /**
   * The title's tone; defaults to `danger`.
   */
  tone?: Tone;
};

/**
 * Something failed: what, why, and maybe a retry; its title defaults to the `danger` tone.
 * @param t The theme.
 * @param options What it says and its optional tone.
 * @returns The block.
 */
export const errorState = (t: Theme, options: ErrorStateOptions): Element =>
  drawState(t, options, role(t, TONES[options.tone ?? "danger"]));

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

/**
 * A single-line message in a semantic tone, such as a warning or failure notice.
 * @param t The theme.
 * @param tone The line's tone.
 * @param text The message.
 * @param tooltip The full message when the visible line may be truncated.
 * @returns The tone-colored line.
 */
export const toneLine = (
  t: Theme,
  tone: Tone,
  text: string,
  tooltip: string | undefined = undefined,
): Element =>
  div()
    .flex_none()
    .min_w(0)
    .text_size(TEXT.label)
    .text_color(role(t, TONES[tone]))
    .when(tooltip !== undefined, (line) => line.truncate().tooltip(tooltip!))
    .child(text);
