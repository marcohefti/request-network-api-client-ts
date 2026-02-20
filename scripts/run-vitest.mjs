#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const WEBSTORAGE_DISABLE_FLAG = "--no-experimental-webstorage";
const majorNodeVersion = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
const shouldDisableExperimentalWebstorage = Number.isFinite(majorNodeVersion) && majorNodeVersion >= 25;

const args = process.argv.slice(2);
const existingNodeOptions = (process.env.NODE_OPTIONS ?? "").trim();
const nodeOptions = shouldDisableExperimentalWebstorage
  ? existingNodeOptions.includes(WEBSTORAGE_DISABLE_FLAG)
    ? existingNodeOptions
    : [existingNodeOptions, WEBSTORAGE_DISABLE_FLAG].filter(Boolean).join(" ")
  : existingNodeOptions;

const env = {
  ...process.env,
};

if (nodeOptions) {
  env.NODE_OPTIONS = nodeOptions;
} else {
  delete env.NODE_OPTIONS;
}

const result = spawnSync("vitest", args, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
