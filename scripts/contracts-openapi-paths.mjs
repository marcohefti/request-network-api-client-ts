import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const WORKSPACE_CONTRACTS_DIR = path.resolve(PACKAGE_ROOT, "..", "request-network-api-contracts");
const WORKSPACE_OPENAPI_DIR = path.join(WORKSPACE_CONTRACTS_DIR, "specs", "openapi");
const WORKSPACE_SPEC_PATH = path.join(WORKSPACE_OPENAPI_DIR, "request-network-openapi.json");

export function resolveContractsOpenApiPaths() {
  if (fs.existsSync(WORKSPACE_SPEC_PATH)) {
    return {
      source: "workspace",
      contractsDir: WORKSPACE_CONTRACTS_DIR,
      openapiDir: WORKSPACE_OPENAPI_DIR,
      specPath: WORKSPACE_SPEC_PATH,
      metaPath: path.join(WORKSPACE_OPENAPI_DIR, "request-network-openapi.meta.json"),
    };
  }

  const require = createRequire(import.meta.url);
  const contractsPackagePath = require.resolve("@marcohefti/request-network-api-contracts/package.json");
  const contractsDir = path.dirname(contractsPackagePath);
  const openapiDir = path.join(contractsDir, "specs", "openapi");

  return {
    source: "dependency",
    contractsDir,
    openapiDir,
    specPath: path.join(openapiDir, "request-network-openapi.json"),
    metaPath: path.join(openapiDir, "request-network-openapi.meta.json"),
  };
}
