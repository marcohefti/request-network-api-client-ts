import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const SPEC_PATH = require.resolve(
  "@request-suite/request-client-contracts/specs/openapi/request-network-openapi.json"
);
const ROOT = join(__dirname, "..", "..");
const DOMAINS_PATH = join(ROOT, "src", "domains");

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

function walkDomainFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDomainFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function collectOperationIdsFromSource(): Set<string> {
  const ids = new Set<string>();
  const files = walkDomainFiles(DOMAINS_PATH).filter((file) => file.endsWith(".ts"));
  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    const matches = content.match(/"([A-Za-z0-9_]+Controller[^"]*)"/g);
    if (!matches) continue;
    for (const match of matches) {
      const operationId = match.slice(1, -1);
      ids.add(operationId);
    }
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
