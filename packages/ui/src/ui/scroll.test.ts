import { describe, expect, test } from "bun:test";
import { walk } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { card } from "./cards";
import { paneScrollRegion } from "./scroll";

describe("paneScrollRegion", () => {
  test("pairs its scrollbar with the pane", () => {
    const region = paneScrollRegion("s", card(t, "c"), 12);
    expect(walk(region).find((node) => node.kind === "Scrollbar")!.styles).toMatchObject({
      ctor: "s",
      right: -12,
    });
  });
});
