import { describe, expect, test } from "bun:test";
import { div } from "gpui-kit";
import { byId, nodeOf, texts } from "@wyattjoh/herdr-dev/test/renderer";
import { METADATA_GRID } from "../tokens";
import { THEME as t } from "../test/theme";
import { metadataGrid } from "./metadata";

describe("metadataGrid", () => {
  test("renders equally shrinking label/value cells with separators", () => {
    const grid = metadataGrid(t, {
      id: "record-metadata",
      cells: [
        { id: "status", label: "Status", value: "Active" },
        { id: "owner", label: "Owner", value: "Herdr UI" },
        { id: "count", label: "Items", value: "3" },
      ],
    });
    const root = nodeOf(grid);
    expect(root.kind).toBe("h_flex");
    expect(root.styles).toMatchObject({
      id: "record-metadata",
      border_b: 1,
      border_color: t.border,
    });
    expect(texts(grid)).toEqual(["Status", "Active", "Owner", "Herdr UI", "Items", "3"]);
    expect(byId(grid, "record-metadata-status")!.styles).toMatchObject({
      px: METADATA_GRID.paddingX,
      py: METADATA_GRID.paddingY,
      gap: METADATA_GRID.gap,
      tooltip: "Status: Active",
    });
    expect(byId(grid, "record-metadata-owner")!.styles).toMatchObject({
      border_l: 1,
      border_color: t.border,
    });
  });

  test("supports a leading element, a disabled value and a consumer wrapper", () => {
    const grid = metadataGrid(t, {
      id: "record-metadata",
      cells: [
        {
          id: "status",
          label: "Status",
          value: "Unavailable",
          leading: div().id("status-icon").child("•"),
          enabled: false,
          tooltip: "Status is unavailable",
          wrap: (element) => div().id("metadata-wrapper").child(element),
        },
      ],
    });
    const content = byId(grid, "record-metadata-status")!;
    expect(content.styles).toMatchObject({ opacity: 0.5, tooltip: "Status is unavailable" });
    expect(byId(grid, "metadata-wrapper")).toBeDefined();
    expect(byId(grid, "status-icon")).toBeDefined();
  });
});
