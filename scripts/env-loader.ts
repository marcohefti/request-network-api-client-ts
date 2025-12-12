import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadRequestClientEnv(): void {
  const envPath = getEnvPath();
  if (!envPath || !existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf8");
  parseEnv(content);
}

function getEnvPath(): string | undefined {
  if (process.env.REQUEST_API_CLIENT_ENV_FILE) {
    return resolve(process.cwd(), process.env.REQUEST_API_CLIENT_ENV_FILE);
  }
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), ".env.local"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function parseEnv(content: string): void {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (!key || key in process.env) continue;
    const rawValue = line.slice(idx + 1).trim();
    process.env[key] = stripQuotes(rawValue);
  }
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  }
  return value;
}

export function resolveProjectRoot(): string {
  return process.cwd();
}
