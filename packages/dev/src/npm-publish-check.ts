const PUBLISH_CORRECTION = /auto[- ]corrected|was invalid and removed|repository\.url.*normalized/i;
const ALREADY_PUBLISHED = /you cannot publish over the previously published versions/i;

/**
 * Find npm publish-dry-run lines that indicate npm corrected package metadata.
 * @param output Combined npm stdout and stderr.
 * @returns Correction warning lines.
 */
export function findPublishCorrections(output: string): string[] {
  return output.split(/\r?\n/).filter((line) => PUBLISH_CORRECTION.test(line));
}

/**
 * Detect npm's expected error for a version that already exists on the registry.
 * @param output Combined npm stdout and stderr.
 * @returns Whether npm reports that the version is already published.
 */
export function isAlreadyPublished(output: string): boolean {
  return ALREADY_PUBLISHED.test(output);
}

/**
 * Run `npm publish --dry-run` in the current package and reject metadata corrections.
 * @returns A promise that resolves when npm accepts the package unchanged.
 */
export async function assertPublishDryRun(): Promise<void> {
  const result = Bun.spawnSync(["npm", "publish", "--dry-run"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  const output = `${stdout}\n${stderr}`;

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  const alreadyPublished = isAlreadyPublished(output);
  if (result.exitCode !== 0 && !alreadyPublished)
    throw new Error(`npm publish --dry-run failed with exit code ${result.exitCode ?? "unknown"}`);

  const corrections = findPublishCorrections(output);
  if (corrections.length)
    throw new Error(`npm publish --dry-run corrected package metadata:\n${corrections.join("\n")}`);
  console.log(
    alreadyPublished
      ? "npm publish --dry-run: version already published; package metadata was not corrected"
      : "npm publish --dry-run: package metadata was not corrected",
  );
}

if (import.meta.main) await assertPublishDryRun();
