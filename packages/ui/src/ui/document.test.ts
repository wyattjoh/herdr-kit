import { describe, expect, test } from "bun:test";
import { byId, texts } from "@wyattjoh/herdr-dev/test/renderer";
import { THEME as t } from "../test/theme";
import { documentCard } from "./document";

describe("documentCard", () => {
  test("a collapsed document is a faded, capped preview", () => {
    const doc = documentCard(t, {
      id: "spec-1",
      text: "# Hi",
      open: false,
      previewHeight: 120,
      surface: "#000000",
      toggle: () => {},
    });
    expect(byId(doc, "document-preview-spec-1")!.styles.max_h).toBe(120);
    expect(byId(doc, "document-fade-spec-1")!.children).toHaveLength(16);
    expect(
      texts(
        documentCard(t, {
          id: "e",
          text: " ",
          open: false,
          previewHeight: 1,
          surface: "#000000",
          toggle: () => {},
        }),
      ),
    ).toContain("No document");
  });
});
