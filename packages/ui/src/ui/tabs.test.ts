import { describe, expect, test } from "bun:test";
import { byId } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { tabBar } from "./tabs";

describe("tabBar", () => {
  test("the selected tab takes the selected fill; a locked bar is inert", () => {
    const bar = tabBar(t, {
      id: "tabs",
      tabs: [
        { id: "a", label: "A", selected: true },
        { id: "b", label: "B", selected: false },
      ],
      locked: true,
      onTab: () => {},
    });
    expect(byId(bar, "tabs-a")!.styles.bg).toBe(t.selected);
    expect(byId(bar, "tabs-b")!.click).toBeUndefined();
    expect(byId(bar, "tabs-b")!.styles.text_color).toBe(t.dim);
  });
});
