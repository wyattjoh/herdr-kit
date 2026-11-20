import { describe, expect, test } from "bun:test";
import { findPublishCorrections, isAlreadyPublished } from "./npm-publish-check";

describe("npm publish output", () => {
  test("detects auto-corrected package metadata", () => {
    expect(
      findPublishCorrections(
        [
          "npm warn publish npm auto-corrected some errors in your package.json",
          'npm warn publish "bin[herdr-check]" script name src/cli.ts was invalid and removed',
          'npm warn publish "repository.url" was normalized to a git URL',
        ].join("\n"),
      ),
    ).toHaveLength(3);
  });

  test("recognizes the already-published version error", () => {
    expect(
      isAlreadyPublished(
        "npm error You cannot publish over the previously published versions: 0.5.0",
      ),
    ).toBe(true);
    expect(isAlreadyPublished("npm notice Publishing to the registry")).toBe(false);
  });

  test("ignores ordinary publish output", () => {
    expect(
      findPublishCorrections(
        "npm notice Publishing to https://registry.npmjs.org/ with tag latest",
      ),
    ).toEqual([]);
  });
});
