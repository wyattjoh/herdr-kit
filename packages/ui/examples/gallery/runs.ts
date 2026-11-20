import type { Context, Element } from "gpui-kit";
import {
  card,
  cardHeader,
  cardSection,
  chipRow,
  groupBlock,
  HERDR_ICONS,
  labelChip,
  listRow,
  progressBar,
  ROW,
  rowNote,
  statusMark,
  type Theme,
} from "@wyattjoh/herdr-ui";
import { noop, runTone } from "./shared";

/**
 * Builds the grouped runs card and its fold controls.
 */
export function runs(options: {
  t: Theme;
  open: ReadonlySet<string>;
  onToggleFold(id: string, cx: Context): void;
}): Element {
  const { t, open, onToggleFold } = options;
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
              onClick: noop,
            }),
          ),
          rowHeight: ROW.list,
          open: open.has(state),
          first: index === 0,
          last: index === states.length - 1,
          toggle: (cx) => onToggleFold(state, cx),
        }),
      ),
    ),
  );
}
