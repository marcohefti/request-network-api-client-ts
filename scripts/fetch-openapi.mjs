#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { applyOpenApiDriftPatches } from "./openapi-drift-patches.mjs";
import { resolveContractsOpenApiPaths } from "./contracts-openapi-paths.mjs";

const SPEC_URL = "https://api.request.network/open-api/openapi.json";

const pkgDir = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  ".."
);
const { openapiDir, specPath, metaPath, source } = resolveContractsOpenApiPaths();

async function main() {
  await mkdir(openapiDir, { recursive: true });

  const response = await fetch(SPEC_URL, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI spec (${response.status} ${response.statusText})`
    );
  }

  const body = await response.text();
  const spec = JSON.parse(body);
  const patchSummary = applyOpenApiDriftPatches(spec);
  await writeFile(specPath, `${JSON.stringify(spec)}\n`);

  const meta = {
    url: SPEC_URL,
    fetchedAt: new Date().toISOString(),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  };

  await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

  const relativeSpecPath = path.relative(pkgDir, specPath);
  console.log(`✅ OpenAPI spec saved to ${relativeSpecPath} (${source})`);
  console.log(
    `✅ OpenAPI drift patch status: ${patchSummary.enumPatchedCount} enum updates, ${patchSummary.nullablePatchedCount} nullable updates`,
  );
}

main().catch((error) => {
  console.error("❌ Failed to update OpenAPI spec:", error);
  process.exitCode = 1;
});
