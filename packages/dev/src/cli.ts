#!/usr/bin/env bun
import { checkMods } from "./runner";

const [stageHome, ...names] = Bun.argv.slice(2);
if (!stageHome || names.length === 0) {
  console.error("usage: herdr-check <stage-home> <mod-name...>");
  process.exit(64);
}
try {
  const results = await checkMods(stageHome, names);
  console.log(`herdr-check: ${results.length} mod(s) passed`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
