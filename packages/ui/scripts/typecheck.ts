// Two passes. The Bun pass (tsconfig.json) checks the pure modules, scripts and tests, and runs
// anywhere. The native pass checks every source module against the gpui-kit and herdr
// declarations Herdr regenerates in its app home, so it needs an installed Herdr: set
// HERDR_APP_HOME, or it reads ~/.config/herdr-app.
import { resolve } from "node:path";

const home = process.env.HERDR_APP_HOME ?? resolve(process.env.HOME!, ".config/herdr-app");
for (const name of ["gpui-kit.d.ts", "herdr.d.ts"])
  if (!(await Bun.file(resolve(home, name)).exists())) {
    console.error(
      `typecheck: no ${name} in ${home}; set HERDR_APP_HOME to an installed Herdr home`,
    );
    process.exit(1);
  }
const config = {
  extends: "../tsconfig.json",
  compilerOptions: {
    types: [],
    paths: { herdr: [resolve(home, "herdr.d.ts")] },
  },
  include: [resolve("src/**/*.ts"), resolve("examples/**/*.ts"), resolve(home, "gpui-kit.d.ts")],
  exclude: [resolve("src/**/*.test.ts"), resolve("src/test/**"), resolve("src/assets.ts")],
};
await Bun.write(".scratch/tsconfig.native.json", JSON.stringify(config, null, 2));
for (const args of [["--noEmit"], ["--noEmit", "-p", ".scratch/tsconfig.native.json"]]) {
  const child = Bun.spawn(["node_modules/.bin/tsc", ...args], {
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await child.exited;
  if (code) process.exit(code);
}
