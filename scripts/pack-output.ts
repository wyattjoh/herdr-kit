type PackFile = { path: string; size: number };

type Pack = { files: PackFile[]; size: number };

/**
 * Parse the single-package JSON output produced by npm pack 10 through 12.
 */
export function parsePackOutput(output: string): Pack {
  let parsed: unknown;
  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error("Invalid npm pack JSON output");
  }
  const entries = Array.isArray(parsed)
    ? parsed
    : parsed !== null && typeof parsed === "object"
      ? Object.values(parsed)
      : [];
  if (entries.length !== 1) throw new Error("Invalid npm pack output: expected one package");
  const pack: unknown = entries[0];
  if (
    pack === null ||
    typeof pack !== "object" ||
    !("size" in pack) ||
    typeof pack.size !== "number" ||
    !("files" in pack) ||
    !Array.isArray(pack.files) ||
    !pack.files.every(
      (file: unknown) =>
        file !== null &&
        typeof file === "object" &&
        "path" in file &&
        typeof file.path === "string" &&
        "size" in file &&
        typeof file.size === "number",
    )
  ) {
    throw new Error("Invalid npm pack output: expected package size and file listing");
  }
  return { files: pack.files, size: pack.size };
}
