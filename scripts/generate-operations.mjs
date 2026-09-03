#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveContractsOpenApiPaths } from "./contracts-openapi-paths.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "src/generated/openapi-operations.ts");
const METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

function firstSuccessStatus(responses) {
  return Object.keys(responses ?? {}).find((status) => /^2\d\d$/.test(status)) ?? "200";
}

async function main() {
  const { specPath, source } = resolveContractsOpenApiPaths();
  const spec = JSON.parse(await (await import("node:fs/promises")).readFile(specPath, "utf8"));
  const definitions = {};

  for (const [route, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [candidateMethod, operation] of Object.entries(pathItem)) {
      if (!METHODS.has(candidateMethod) || !operation?.operationId) continue;
      definitions[operation.operationId] = {
        method: candidateMethod.toUpperCase(),
        path: route,
        successStatus: Number(firstSuccessStatus(operation.responses)),
        hasJsonResponse: Boolean(operation.responses?.[firstSuccessStatus(operation.responses)]?.content?.["application/json"]),
      };
    }
  }

  const output = [
    "/** Auto-generated from @marcohefti/request-network-api-contracts. Do not edit. */",
    'import type { HttpMethod } from "../core/http/http.types";',
    'import type { operations } from "./openapi-types";',
    "",
    `export const operationDefinitions = ${JSON.stringify(definitions, null, 2)} as const satisfies Record<string, { method: HttpMethod; path: string; successStatus: number; hasJsonResponse: boolean }>;`,
    "",
    "export type OperationId = keyof typeof operationDefinitions & keyof operations;",
    "",
  ].join("\n");

  await writeFile(OUTPUT, output);
  console.log(`✅ Generated ${Object.keys(definitions).length} operation definitions (${source})`);
}

main().catch((error) => {
  console.error("❌ Failed to generate operation definitions:", error);
  process.exitCode = 1;
});
