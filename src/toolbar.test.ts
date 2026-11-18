import { describe, expect, test } from "bun:test";
import { BUTTON_STYLE, DRAG_ROOM, fitLabels, toolsWidth, toolWidth, type Tool } from "./toolbar";

const tools: Tool<"follow" | "pin" | "open">[] = [
  { id: "follow", label: "Follow agent", labelled: false },
  { id: "pin", label: "Pin", labelled: false },
  { id: "open", label: "Open in browser", labelled: false },
];

describe("button style", () => {
  test("matches Herdr's panel button", () => {
    expect(BUTTON_STYLE).toMatchObject({
      height: 26,
      paddingX: 8,
      gap: 5,
      radius: 6,
      textSize: 12,
      iconSize: 14,
    });
  });
  test("estimates an icon-only and a labelled width", () => {
    expect(toolWidth(tools[1]!)).toBe(30);
    expect(toolWidth({ ...tools[1]!, labelled: true })).toBeCloseTo(30 + 5 + 3 * 7.2);
  });
});

describe("fitLabels", () => {
  test("leaves a pane's row as given", () => {
    expect(fitLabels(tools, undefined, [["follow"]])).toEqual(tools);
  });
  test("labels a group only while the row keeps its drag room", () => {
    const labelled = fitLabels(tools, 1000, [["follow"], ["open"]]);
    expect(labelled.map((tool) => tool.labelled)).toEqual([true, false, true]);
    const tight = toolsWidth(tools) + DRAG_ROOM;
    expect(fitLabels(tools, tight, [["follow"]]).some((tool) => tool.labelled)).toBe(false);
  });
});
