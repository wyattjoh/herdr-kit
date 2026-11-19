import { describe, expect, test } from "bun:test";
import { byId, nodeOf, walk } from "@wyattjoh/herdr-dev/test/renderer";
import { CARD, ROW, SKELETON } from "../tokens";
import { THEME as t } from "../test/theme";
import { skeletonRows } from "./skeleton";

describe("skeletonRows", () => {
  test("builds list-height rows with caller-prefixed one-based ids", () => {
    const rows = skeletonRows(t, "ci-waiting-row", 3);
    expect(rows).toHaveLength(3);
    rows.forEach((row, index) => {
      expect(nodeOf(row).styles).toMatchObject({
        id: `ci-waiting-row-${index + 1}`,
        h: ROW.list,
        px: CARD.paddingX,
        gap: CARD.rowGap,
      });
      expect(byId(row, `ci-waiting-row-${index + 1}`)).toBeDefined();
    });
  });

  test("draws a muted leading mark and title bar", () => {
    const row = skeletonRows(t, "loading", 1)[0]!;
    const nodes = walk(row);
    expect(nodes.map((node) => node.styles.bg)).toContain(t.dim);
    expect(nodes.map((node) => node.styles.size)).toContain(SKELETON.markSize);
    expect(nodes.map((node) => node.styles.h)).toContain(SKELETON.barHeight);
  });

  test("returns no rows for a zero count", () => {
    expect(skeletonRows(t, "loading-row", 0)).toEqual([]);
  });
});
