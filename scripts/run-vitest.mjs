#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const WEBSTORAGE_DISABLE_FLAG = "--no-experimental-webstorage";

const args = process.argv.slice(2);
const existingNodeOptions = (process.env.NODE_OPTIONS ?? "").trim();
const nodeOptions = existingNodeOptions.includes(WEBSTORAGE_DISABLE_FLAG)
  ? existingNodeOptions
  : [existingNodeOptions, WEBSTORAGE_DISABLE_FLAG].filter(Boolean).join(" ");

const result = spawnSync("vitest", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
