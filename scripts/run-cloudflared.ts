import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

import { loadRequestClientEnv, resolveProjectRoot } from "./env-loader";
import { createTunnelConfig } from "./tunnel-config";

loadRequestClientEnv();

const DEFAULT_PORT = 8787;
const port = Number.parseInt(process.env.REQUEST_WEBHOOK_PORT ?? "", 10) || DEFAULT_PORT;
const localUrl = `http://localhost:${port}`;
const tunnelName = process.env.REQUEST_WEBHOOK_TUNNEL_NAME?.trim();
const hostname = process.env.REQUEST_WEBHOOK_TUNNEL_HOSTNAME?.trim();

const workspaceRoot = resolveProjectRoot();
const repoCacheDir = join(workspaceRoot, ".cache");
const repoPnpmHome = join(workspaceRoot, ".pnpm");
const repoStoreDir = join(workspaceRoot, ".pnpm-store");

ensureDirectories([repoCacheDir, repoPnpmHome, repoStoreDir]);

let usingNamedTunnel = Boolean(tunnelName);
let configPath: string | undefined;
let args: string[] = ["dlx", "cloudflared", "tunnel", "--url", localUrl];

if (hostname && hostname.length > 0) {
  args.push("--hostname", hostname);
}

if (usingNamedTunnel && tunnelName) {
  const credentials = resolveTunnelCredentials(tunnelName);
  if (!credentials) {
    usingNamedTunnel = false;
    process.stderr.write(
      `[request-api-client] Warning: Could not locate credentials for named tunnel "${tunnelName}". Falling back to quick tunnel mode.\n`,
    );
  } else {
    configPath = createTunnelConfig({
      tunnelName,
      credentialsFile: credentials,
      hostname,
      port,
      workspaceCacheDir: repoCacheDir,
    });
    args = ["dlx", "cloudflared", "tunnel", "--config", configPath, "run", tunnelName];
  }
}

const description = usingNamedTunnel && tunnelName
  ? `named tunnel "${tunnelName}"${hostname ? ` (hostname: ${hostname})` : ""}`
  : `${localUrl}${hostname ? ` (requested hostname: ${hostname})` : ""}`;

process.stdout.write(`[request-api-client] Starting Cloudflare Tunnel for ${description}\n`);
process.stdout.write("[request-api-client] Tip: authenticate with `cloudflared login` to provision persistent hostnames.\n");

const child = spawn("pnpm", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    XDG_CACHE_HOME: process.env.XDG_CACHE_HOME ?? repoCacheDir,
    PNPM_HOME: process.env.PNPM_HOME ?? repoPnpmHome,
    PNPM_STORE_PATH: process.env.PNPM_STORE_PATH ?? repoStoreDir,
  },
});

child.on("error", (error) => {
  process.stderr.write(
    `[request-api-client] Failed to launch cloudflared via pnpm dlx: ${String(error)}\n`,
  );
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.stdout.write(`[request-api-client] cloudflared tunnel exited due to signal ${signal}\n`);
  } else {
    process.stdout.write(`[request-api-client] cloudflared tunnel exited with code ${code}\n`);
    if (typeof code === "number" && code !== 0) {
      process.exitCode = code;
    }
  }
});

const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];
signals.forEach((signal) => {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
});

process.on("exit", () => {
  if (configPath && existsSync(configPath)) {
    try {
      unlinkSync(configPath);
    } catch (error) {
      process.stderr.write(
        `[request-api-client] Warning: Failed to remove tunnel config ${configPath}: ${String(error)}\n`,
      );
    }
  }
});

function ensureDirectories(dirs: string[]): void {
  for (const dir of dirs) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch (error) {
      process.stderr.write(`[request-api-client] Failed to prepare ${dir}: ${String(error)}\n`);
    }
  }
}

function resolveTunnelCredentials(name: string): string | undefined {
  const cloudflaredDir = join(homedir(), ".cloudflared");
  if (!existsSync(cloudflaredDir)) {
    return undefined;
  }

  const direct = join(cloudflaredDir, `${name}.json`);
  if (existsSync(direct)) {
    return direct;
  }

  const nested = join(cloudflaredDir, name, "cert.json");
  if (existsSync(nested)) {
    return nested;
  }

  const tunnelId = lookupTunnelId(name);
  if (tunnelId) {
    const byId = join(cloudflaredDir, `${tunnelId}.json`);
    if (existsSync(byId)) {
      return byId;
    }
    const resolvedById = findCredentialsByTunnelId(cloudflaredDir, tunnelId);
    if (resolvedById) {
      return resolvedById;
    }
  }

  const resolvedByName = findCredentialsByTunnelId(cloudflaredDir, name);
  if (resolvedByName) {
    return resolvedByName;
  }

  try {
    const entries = readdirSync(cloudflaredDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const fullPath = join(cloudflaredDir, entry.name);
      try {
        const parsed = JSON.parse(readFileSync(fullPath, "utf8")) as { TunnelName?: string };
        if (parsed.TunnelName === name) {
          return fullPath;
        }
      } catch {
        /* ignore malformed entry */
      }
    }
  } catch {
    /* ignore */
  }

  return undefined;
}

function lookupTunnelId(name: string): string | undefined {
  try {
    const result = spawnSync("cloudflared", ["tunnel", "list", "--output", "json"], {
      encoding: "utf8",
    });
    if (result.status !== 0 || !result.stdout) {
      return undefined;
    }

    const tunnels = JSON.parse(result.stdout) as Array<{ id?: string; name?: string }>;
    const match = tunnels.find((tunnel) => tunnel.name === name);
    return match?.id;
  } catch (error) {
    process.stderr.write(
      `[request-api-client] Warning: Failed to query tunnel list via cloudflared: ${String(error)}\n`,
    );
    return undefined;
  }
}

function findCredentialsByTunnelId(cloudflaredDir: string, identifier: string): string | undefined {
  try {
    const entries = readdirSync(cloudflaredDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const fullPath = join(cloudflaredDir, entry.name);
      try {
        const parsed = JSON.parse(readFileSync(fullPath, "utf8")) as { TunnelID?: string };
        if (parsed.TunnelID === identifier) {
          return fullPath;
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    process.stderr.write(
      `[request-api-client] Warning: Unable to inspect cloudflared credentials directory: ${String(error)}\n`,
    );
  }
  return undefined;
}
