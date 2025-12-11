import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface TunnelConfigOptions {
  tunnelName: string;
  credentialsFile: string;
  hostname?: string;
  port: number;
  workspaceCacheDir: string;
}

export function createTunnelConfig(options: TunnelConfigOptions): string {
  const { tunnelName, credentialsFile, hostname, port, workspaceCacheDir } = options;
  const lines = [
    `tunnel: ${tunnelName}`,
    `credentials-file: ${credentialsFile}`,
    "ingress:",
  ];

  if (hostname) {
    lines.push(`  - hostname: ${hostname}`);
    lines.push(`    service: http://localhost:${port}`);
  } else {
    lines.push(`  - service: http://localhost:${port}`);
  }

  lines.push("  - service: http_status:404");

  const cacheDir = join(workspaceCacheDir, ".request-network-api-client");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  const configFile = join(cacheDir, `cloudflared-${tunnelName}.yml`);
  writeFileSync(configFile, `${lines.join("\n")}\n`, { encoding: "utf8" });
  return configFile;
}
