import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { setTimeout as delay } from "node:timers/promises";

export const WEBHOOK_HEALTH_PATH = "/healthz";
const HEALTH_TIMEOUT_ERROR = "Webhook health check request timed out";
const STREAM_ERROR_MESSAGE = "cloudflared tunnel did not expose stdout/stderr streams";

export type TunnelMode = "none" | "spawn";

export interface StartTunnelOptions {
  port: number;
  mode: TunnelMode;
}

export interface CloudflareTunnelHandle {
  stop(): Promise<void>;
}

export async function startCloudflareTunnel(options: StartTunnelOptions): Promise<CloudflareTunnelHandle | undefined> {
  if (options.mode === "none") {
    return undefined;
  }

  const args = ["run", "tunnel:webhook"];
  const tunnelEnv = {
    ...process.env,
    REQUEST_WEBHOOK_PORT: String(options.port),
  };

  const child = spawn("pnpm", args, {
    env: tunnelEnv,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  const stdout = requireStream(child.stdout);
  const stderr = requireStream(child.stderr);

  const forwardStdout = (chunk: Buffer) => {
    process.stdout.write(chunk);
  };
  const forwardStderr = (chunk: Buffer) => {
    process.stderr.write(chunk);
  };

  stdout.on("data", forwardStdout);
  stderr.on("data", forwardStderr);

  await waitForTunnelStartup(child, stdout, stderr);

  return {
    async stop() {
      stdout.off("data", forwardStdout);
      stderr.off("data", forwardStderr);
      await terminateProcessTree(child);
    },
  };
}

async function waitForTunnelStartup(
  child: ChildProcess,
  stdout: NodeJS.ReadableStream,
  stderr: NodeJS.ReadableStream,
): Promise<void> {
  let resolved = false;

  await new Promise<void>((resolve, reject) => {
    const onData = (buffer: Buffer): void => {
      const output = buffer.toString();
      if (output.includes("Starting Cloudflare Tunnel")) {
        resolved = true;
        cleanup();
        resolve();
      }
    };

    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };

    const onExit = (code: number | null): void => {
      if (!resolved) {
        cleanup();
        reject(new Error(`cloudflared tunnel exited unexpectedly (code ${String(code ?? "unknown")})`));
      }
    };

    const cleanup = (): void => {
      stdout.off("data", onData);
      stderr.off("data", onData);
      child.off("error", onError);
      child.off("exit", onExit);
    };

    stdout.on("data", onData);
    stderr.on("data", onData);
    child.on("error", onError);
    child.on("exit", onExit);

    void delay(10_000).then(() => {
      if (!resolved) {
        cleanup();
        reject(new Error("Timed out waiting for cloudflared tunnel to start"));
      }
    });
  });
}

export async function pingPublicWebhookEndpoint(publicUrl: string, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await issueHealthRequest(publicUrl);
      return;
    } catch {
      // retry
    }

    await delay(500);
  }

  throw new Error(`Timed out pinging webhook endpoint at ${publicUrl}`);
}

function killIgnoreMissing(targetPid: number, signal: NodeJS.Signals): void {
  try {
    process.kill(targetPid, signal);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") {
      throw error;
    }
  }
}

function killGroupOrSelf(pid: number, signal: NodeJS.Signals): void {
  // Attempt to signal the process group first, then the process itself.
  killIgnoreMissing(-pid, signal);
  killIgnoreMissing(pid, signal);
}

async function terminateProcessTree(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;

  const pid = child.pid;
  if (pid) {
    killGroupOrSelf(pid, "SIGINT");
  }

  const exited = await waitForExit(child, 3000);
  if (!exited && pid) {
    killGroupOrSelf(pid, "SIGTERM");
    await waitForExit(child, 3000);
  }

  child.unref();
}

function waitForExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;

    const onExit = () => {
      if (!settled) {
        settled = true;
        resolve(true);
      }
    };

    child.once("exit", onExit);
    child.once("close", onExit);

    setTimeout(() => {
      if (!settled) {
        settled = true;
        child.off("exit", onExit);
        child.off("close", onExit);
        resolve(false);
      }
    }, timeoutMs).unref();
  });
}

async function issueHealthRequest(publicUrl: string): Promise<void> {
  const target = new URL(WEBHOOK_HEALTH_PATH, publicUrl);
  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const settle = (fn: () => void): void => {
      if (!settled) {
        settled = true;
        fn();
      }
    };

    const requestImpl = target.protocol === "https:" ? httpsRequest : httpRequest;
    const req = requestImpl(
      target,
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 200 && status < 400) {
          settle(resolve);
        } else {
          settle(() => {
            reject(new Error(`Unexpected status code ${String(status)} from webhook health check`));
          });
        }
      },
    );

    req.setHeader("user-agent", "request-network-api-client/webhook-harness");
    req.on("error", (error) => {
      settle(() => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
    req.end();

    setTimeout(() => {
      if (!settled) {
        req.destroy(new Error(HEALTH_TIMEOUT_ERROR));
        settle(() => {
          reject(new Error(HEALTH_TIMEOUT_ERROR));
        });
      }
    }, 5000);
  });
}

function requireStream(stream: NodeJS.ReadableStream | null): NodeJS.ReadableStream {
  if (!stream) {
    throw new Error(STREAM_ERROR_MESSAGE);
  }
  return stream;
}
