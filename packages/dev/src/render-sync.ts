#!/usr/bin/env bun
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Find literal sub-five-second `cx.timer.every` calls in TypeScript source.
 * @param root Source tree to inspect.
 * @returns Violations with file and line.
 */
export async function findFastTimers(root: string): Promise<string[]> {
  const violations: string[] = [];
  const visit = async (directory: string) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      if (
        !entry.isFile() ||
        !/\.tsx?$/.test(entry.name) ||
        entry.name.endsWith(".d.ts") ||
        entry.name.endsWith(".test.ts")
      )
        continue;
      const source = await Bun.file(path).text();
      // Deliberately enforce only a direct numeric literal argument. Dynamic expressions and
      // other timer APIs need semantic review; this rule does not claim to prove render safety.
      const pattern = /\bcx\s*\.\s*timer\s*\.\s*every\s*\(\s*(\d+(?:_\d+)*)\s*(?:,|\))/g;
      for (const match of source.matchAll(pattern)) {
        const milliseconds = Number(match[1].replaceAll("_", ""));
        if (milliseconds < 5000) {
          const line = source.slice(0, match.index).split("\n").length;
          violations.push(`${path}:${line}: cx.timer.every(${match[1]}) is below 5000ms`);
        }
      }
    }
  };
  await visit(root);
  return violations;
}

if (import.meta.main) {
  const roots = Bun.argv.slice(2).map((root) => resolve(root));
  if (roots.length === 0) roots.push(resolve("src"));
  const violations = (await Promise.all(roots.map(findFastTimers))).flat();
  if (violations.length) {
    console.error(violations.join("\n"));
    process.exit(1);
  }
  console.log(
    `render-sync: no literal cx.timer.every interval below 5000ms in ${roots.join(", ")}`,
  );
}
