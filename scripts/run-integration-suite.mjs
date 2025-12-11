#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(__dirname);
const suite = process.argv[2] ?? "live";

if (suite !== "live") {
  console.error("Usage: node scripts/run-integration-suite.mjs live");
  process.exit(1);
}

const pattern = "tests/integration/live";

const child = spawn(
  'pnpm',
  ['exec', 'vitest', 'run', pattern, '--passWithNoTests', '--coverage.enabled=false'],
  {
    cwd: packageRoot,
    env: { ...process.env, REQUEST_SUITE_DISABLE_MSW: '1' },
    stdio: 'inherit',
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
