import { defineConfig } from "tsup";

const entryPoints = {
  index: "src/index.ts",
  "domains/currencies/index": "src/domains/currencies/index.ts",
  "domains/currencies/v1/index": "src/domains/currencies/v1/index.ts",
  "domains/client-ids/index": "src/domains/client-ids/index.ts",
  "domains/requests/index": "src/domains/requests/index.ts",
  "domains/requests/v1/index": "src/domains/requests/v1/index.ts",
  "domains/payouts/index": "src/domains/payouts/index.ts",
  "domains/payments/index": "src/domains/payments/index.ts",
  "domains/pay/index": "src/domains/pay/index.ts",
  "domains/pay/v1/index": "src/domains/pay/v1/index.ts",
  "domains/payer/index": "src/domains/payer/index.ts",
  "domains/payer/v1/index": "src/domains/payer/v1/index.ts",
  "domains/payer/v2/index": "src/domains/payer/v2/index.ts",
  "domains/secure-payments/index": "src/domains/secure-payments/index.ts",
};

const shared = {
  sourcemap: true,
  target: "es2022",
  splitting: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  platform: "neutral" as const,
  shims: false,
  env: {
    NODE_ENV: process.env.NODE_ENV ?? "production",
  },
  outExtension() {
    return {
      js: ".js",
    };
  },
};

export default defineConfig([
  {
    entry: entryPoints,
    format: ["esm"],
    outDir: "dist/esm",
    dts: {
      entry: entryPoints,
      resolve: true,
    },
    clean: true,
    ...shared,
  },
  {
    entry: entryPoints,
    format: ["cjs"],
    outDir: "dist/cjs",
    clean: false,
    ...shared,
  },
]);
