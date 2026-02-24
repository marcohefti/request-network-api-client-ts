#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

import { applyOpenApiDriftPatches } from "./openapi-drift-patches.mjs";
import { resolveContractsOpenApiPaths } from "./contracts-openapi-paths.mjs";

const { specPath, source } = resolveContractsOpenApiPaths();

async function main() {
  const raw = await readFile(specPath, "utf8");
  const spec = JSON.parse(raw);
  const patchSummary = applyOpenApiDriftPatches(spec);

  if (patchSummary.mutationCount === 0) {
    console.log("✅ OpenAPI drift patch already applied");
    return;
  }

  await writeFile(specPath, `${JSON.stringify(spec)}\n`);
  console.log(
    `✅ OpenAPI drift patch applied (${patchSummary.enumPatchedCount} enum updates, ${patchSummary.nullablePatchedCount} nullable updates, source=${source})`,
  );
}

main().catch((error) => {
  console.error("❌ Failed to patch OpenAPI spec:", error);
  process.exitCode = 1;
});
