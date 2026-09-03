import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const SPEC_PATH = require.resolve(
  "@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json"
);
const ROOT = join(__dirname, "..", "..");
const OPERATIONS_PATH = join(ROOT, "src", "generated", "openapi-operations.ts");

const EXPECTED_UNCOVERED_OPERATION_IDS: readonly string[] = [];

function collectOperationIdsFromSpec(): Set<string> {
  const specRaw = readFileSync(SPEC_PATH, "utf8");
  const spec = JSON.parse(specRaw) as { paths: Record<string, Record<string, { operationId?: string }>> };

  const ids = new Set<string>();
  for (const pathConfig of Object.values(spec.paths)) {
    for (const operation of Object.values(pathConfig)) {
      if (operation.operationId) ids.add(operation.operationId);
    }
  }

  return ids;
}

function collectOperationIdsFromSource(): Set<string> {
  const ids = new Set<string>();
  const content = readFileSync(OPERATIONS_PATH, "utf8");
  const matches = content.match(/"([A-Za-z0-9_]+Controller[^"]*)"(?=:\s*\{)/g) ?? [];
  for (const match of matches) {
    ids.add(match.slice(1, -1));
  }
  return ids;
}

describe("OpenAPI parity", () => {
  it("tracks uncovered operation IDs explicitly", () => {
    const specOperations = collectOperationIdsFromSpec();
    const implementedOperations = collectOperationIdsFromSource();

    const uncovered = [...specOperations].filter((operationId) => !implementedOperations.has(operationId)).sort();
    const expected = [...EXPECTED_UNCOVERED_OPERATION_IDS].sort();

    expect(uncovered).toEqual(expected);
  });
});
