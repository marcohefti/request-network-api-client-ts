import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
export function resolveContractsOpenApiPaths() {
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
