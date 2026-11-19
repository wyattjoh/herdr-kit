import { describe, expect, test } from "bun:test";
import { parsePackOutput } from "./pack-output";

describe("parsePackOutput", () => {
  test("accepts npm's array output", () => {
    expect(parsePackOutput('[{"size":12,"files":[{"path":"README.md","size":12}]}]')).toEqual({
      size: 12,
      files: [{ path: "README.md", size: 12 }],
    });
  });

  test("accepts npm 12's package-name keyed output", () => {
    expect(
      parsePackOutput(
        '{"@scope/package":{"id":"@scope/package@1.0.0","name":"@scope/package","version":"1.0.0","size":12,"files":[{"path":"README.md","size":12}]}}',
      ),
    ).toEqual({ size: 12, files: [{ path: "README.md", size: 12 }] });
  });

  test.each(["{}", "[]", "[{}]", '{"one":{},"two":{}}', "not json"])(
    "rejects invalid output: %s",
    (output) => {
      expect(() => parsePackOutput(output)).toThrow("Invalid npm pack");
    },
  );
});
