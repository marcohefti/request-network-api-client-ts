#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SPEC_URL = "https://api.request.network/open-api/openapi.json";

const pkgDir = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  ".."
);
const require = createRequire(import.meta.url);
const contractsPackagePath = require.resolve("@request-suite/request-client-contracts/package.json");
const contractsDir = path.dirname(contractsPackagePath);
const openapiDir = path.join(contractsDir, "specs", "openapi");
const specPath = path.join(openapiDir, "request-network-openapi.json");
const metaPath = path.join(openapiDir, "request-network-openapi.meta.json");

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
  await writeFile(specPath, `${body}\n`);

  const meta = {
    url: SPEC_URL,
    fetchedAt: new Date().toISOString(),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  };

  await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

  console.log(`✅ OpenAPI spec saved to ${path.relative(pkgDir, specPath)}`);
}

main().catch((error) => {
  console.error("❌ Failed to update OpenAPI spec:", error);
  process.exitCode = 1;
});
