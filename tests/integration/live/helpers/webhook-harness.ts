import express from "express";
import type { Request, Response } from "express";
import { createServer, type Server } from "node:http";

import { WEBHOOK_HEALTH_PATH } from "./cloudflare";
import { webhooks } from "../../../../src";

const WEBHOOK_PATH = "/webhook";

export interface RecordedWebhookEvent {
  readonly event: string;
  readonly payload: unknown;
  readonly signature: string | null;
  readonly receivedAt: number;
}

interface WaitForEventOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

interface WebhookHarnessOptions {
  secret: string;
  logger?: (message: string, context?: Record<string, unknown>) => void;
}

interface RunningWebhookHarness {
  readonly port: number;
  readonly localUrl: string;
  readonly events: RecordedWebhookEvent[];
  waitForEvent(eventName: string, options?: WaitForEventOptions): Promise<RecordedWebhookEvent>;
  clearEvents(): void;
  close(): Promise<void>;
}

export async function startWebhookHarness(options: WebhookHarnessOptions): Promise<RunningWebhookHarness> {
  const { secret, logger } = options;
  const events: RecordedWebhookEvent[] = [];
  const watchers = new Set<{
    predicate: (event: RecordedWebhookEvent) => boolean;
    resolve: (event: RecordedWebhookEvent) => void;
    reject: (error: Error) => void;
    timeout?: NodeJS.Timeout;
  }>();

  const app = express();
  app.disable("x-powered-by");

  app.get(WEBHOOK_HEALTH_PATH, (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  });

  const middleware = webhooks.createWebhookMiddleware({
    secret,
    onEvent: (parsed) => {
      const record: RecordedWebhookEvent = {
        event: parsed.event,
        payload: parsed.payload,
        signature: parsed.signature,
        receivedAt: Date.now(),
      };
      events.push(record);
      for (const watcher of watchers) {
        if (watcher.predicate(record)) {
          watcher.resolve(record);
          clearTimeout(watcher.timeout);
          watchers.delete(watcher);
        }
      }
    },
    logger: logger
      ? {
          info: (message, context) => {
            logger(message, context);
          },
          warn: (message, context) => {
            logger(message, context);
          },
          error: (message, context) => {
            logger(message, context);
          },
          debug: (message, context) => {
            logger(message, context);
          },
        }
      : undefined,
  });

  app.post(
    WEBHOOK_PATH,
    express.raw({ type: "application/json" }),
    middleware,
    (_req: Request, res: Response) => {
      res.status(204).end();
    },
  );

  const preferredPort = Number.parseInt(process.env.REQUEST_WEBHOOK_PORT ?? "", 10);
  const server = await listen(app, Number.isInteger(preferredPort) && preferredPort > 0 ? preferredPort : undefined);
  const port = getPort(server);
  const localUrl = `http://127.0.0.1:${String(port)}`;

  return {
    port,
    localUrl,
    events,
    waitForEvent(eventName, opts) {
      const { timeoutMs = 120_000, signal } = opts ?? {};
      return new Promise<RecordedWebhookEvent>((resolve, reject) => {
        if (signal?.aborted) {
          reject(new Error(`waitForEvent(${eventName}) aborted`));
          return;
        }

        const existing = events.find((event) => event.event === eventName);
        if (existing) {
          resolve(existing);
          return;
        }

        const watcher = {
          predicate: (event: RecordedWebhookEvent) => event.event === eventName,
          resolve,
          reject,
          timeout: undefined as NodeJS.Timeout | undefined,
        };

        watcher.timeout = setTimeout(() => {
          watchers.delete(watcher);
        reject(new Error(`Timed out waiting for webhook event "${eventName}" after ${String(timeoutMs)}ms`));
        }, timeoutMs);

        if (signal) {
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(watcher.timeout);
              watchers.delete(watcher);
              reject(new Error(`waitForEvent(${eventName}) aborted`));
            },
            { once: true },
          );
        }

        watchers.add(watcher);
      });
    },
    clearEvents() {
      events.splice(0, events.length);
    },
    async close() {
      for (const watcher of watchers) {
        clearTimeout(watcher.timeout);
        watcher.reject(new Error("Webhook harness stopped before event arrived"));
      }
      watchers.clear();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    },
  };
}

async function listen(app: express.Express, port?: number): Promise<Server> {
  return new Promise<Server>((resolve, reject) => {
    const server = createServer(app);
    server.on("error", reject);
    server.listen(port ?? 0, () => {
      resolve(server);
    });
  });
}

function getPort(server: Server): number {
  const address = server.address();
  if (!address || typeof address !== "object" || typeof address.port !== "number") {
    throw new Error("Webhook harness could not determine listening port");
  }
  return address.port;
}
