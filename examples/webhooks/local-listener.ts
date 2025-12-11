import { Buffer } from "node:buffer";

import express, { type NextFunction, type Request, type Response } from "express";

import { webhooks } from "@request-suite/request-api-client";

import { loadRequestClientEnv } from "../../scripts/env-loader";

loadRequestClientEnv();

const DEFAULT_PORT = 8787;
const port = Number.parseInt(process.env.REQUEST_WEBHOOK_PORT ?? "", 10) || DEFAULT_PORT;

const secretEnv = process.env.REQUEST_WEBHOOK_SECRET;

let secrets: string[] = [];
let bypassVerification = false;

if (!secretEnv || !secretEnv.trim()) {
  bypassVerification = true;
  secrets = ["whsec_dev_placeholder"];
  webhooks.testing.setWebhookVerificationBypass(true);
  process.stdout.write(
    "[request-api-client] REQUEST_WEBHOOK_SECRET not set - starting in verification-bypass mode with a placeholder secret.\n" +
      "→ Cloudflare will expose a public URL so you can create the webhook and fetch the real secret.\n" +
      "→ Once you have the secret, update REQUEST_WEBHOOK_SECRET and restart `pnpm webhook:dev:all` to enable verification.\n",
  );
} else {
  secrets = secretEnv
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (secrets.length === 0) {
    bypassVerification = true;
    secrets = ["whsec_dev_placeholder"];
    webhooks.testing.setWebhookVerificationBypass(true);
    process.stdout.write(
      "[request-api-client] REQUEST_WEBHOOK_SECRET is empty after trimming - starting in verification-bypass mode.\n" +
        "→ Populate REQUEST_WEBHOOK_SECRET with the real value and restart to enforce signatures.\n",
    );
  } else {
    webhooks.testing.setWebhookVerificationBypass(false);
  }
}

function formatError(error: unknown): unknown {
  if (error instanceof Error) {
    const details: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };
    if (error.stack) {
      details.stack = error.stack;
    }
    if ("cause" in error) {
      details.cause = (error as Error & { cause?: unknown }).cause;
    }
    return details;
  }
  return error;
}

function extractSchemaIssueSummaries(error: unknown): string[] {
  if (!error || typeof error !== "object") return [];
  const cause = (error as { cause?: unknown }).cause;
  if (!cause || typeof cause !== "object") return [];
  const issues = (cause as { issues?: unknown }).issues;
  if (!Array.isArray(issues)) return [];

  return issues
    .map((issue) => {
      if (!issue || typeof issue !== "object") return undefined;
      const code = (issue as { code?: unknown }).code;
      const pathValue = (issue as { path?: unknown }).path;
      const options = (issue as { options?: unknown }).options;
      const received = (issue as { received?: unknown }).received;
      const message = (issue as { message?: unknown }).message;
      const path = Array.isArray(pathValue) && pathValue.length > 0 ? pathValue.join(".") : "(root)";
      const parts: string[] = [];
      parts.push(`[${typeof code === "string" ? code : "unknown"}]`);
      parts.push(`path=${path}`);
      if (Array.isArray(options) && options.length > 0) {
        parts.push(`expected=[${options.join(", ")}]`);
      }
      if (received !== undefined) {
        try {
          parts.push(`received=${JSON.stringify(received)}`);
        } catch {
          parts.push("received=<unserializable>");
        }
      }
      if (typeof message === "string" && message.length > 0) {
        parts.push(`message=${message}`);
      }
      return parts.join(" ");
    })
    .filter((summary): summary is string => Boolean(summary));
}

function extractUnknownEventSummary(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.includes("Unknown webhook event")) {
    return message;
  }
  return undefined;
}

const dispatcher = webhooks.createWebhookDispatcher();

const middleware = webhooks.createWebhookMiddleware({
  secret: secrets.length === 1 ? secrets[0] : secrets,
  dispatcher,
  onEvent(event) {
    const summary: Record<string, unknown> = {
      signature: event.signature,
      matchedSecret: event.matchedSecret,
      timestamp: event.timestamp,
    };

    const payload = event.payload as Record<string, unknown>;
    if (payload && typeof payload === "object") {
      if (typeof payload.requestId === "string") {
        summary.requestId = payload.requestId;
      }
      if (typeof payload.paymentReference === "string") {
        summary.paymentReference = payload.paymentReference;
      }
      if (typeof payload.subStatus === "string") {
        summary.subStatus = payload.subStatus;
      }
      if (typeof payload.status === "string") {
        summary.status = payload.status;
      }
    }

    process.stdout.write(
      `[request-api-client] event.${event.event} ${JSON.stringify(summary)}\n`,
    );
  },
  logger: {
    info(message: string, context?: Record<string, unknown>) {
      process.stdout.write(
        `[request-api-client] ${message}${context ? ` ${JSON.stringify(context)}` : ""}\n`,
      );
    },
    warn(message: string, context?: Record<string, unknown>) {
      process.stderr.write(
        `[request-api-client] WARN ${message}${context ? ` ${JSON.stringify(context)}` : ""}\n`,
      );
    },
    error(message: string, context?: Record<string, unknown>) {
      let payload = context;
      if (context && "error" in context) {
        const errorValue = (context as { error?: unknown }).error;
        const issueSummaries = extractSchemaIssueSummaries(errorValue);
        for (const summary of issueSummaries) {
          process.stderr.write(`[request-api-client] schema.issue ${summary}\n`);
        }
        const unknownEvent = extractUnknownEventSummary(errorValue);
        if (unknownEvent) {
          process.stderr.write(`[request-api-client] schema.unknown ${unknownEvent}\n`);
        }
        payload = { ...context, error: formatError(errorValue) };
      }
      process.stderr.write(
        `[request-api-client] ERROR ${message}${payload ? ` ${JSON.stringify(payload)}` : ""}\n`,
      );
    },
  },
});

webhooks.events.onPaymentConfirmed(dispatcher, async (payload) => {
  process.stdout.write(
    `[request-api-client] handler.payment.confirmed ${JSON.stringify({
      requestId: payload.requestId,
      paymentReference: payload.paymentReference,
      txHash: payload.txHash ?? null,
    })}\n`,
  );
});

const app = express();

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req: Request, _res: Response, next: NextFunction) => {
    const body = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
    process.stdout.write(
      `[request-api-client] raw.body ${body}\n`,
    );
    Reflect.set(req, "rawBody", req.body);
    next();
  },
  middleware,
  (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  },
);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (!res.headersSent) {
    res.status(500).json({ error: "internal_error" });
  }
  process.stderr.write(`[request-api-client] ERROR ${String(error)}\n`);
});

app.listen(port, () => {
  const publicUrl = process.env.REQUEST_WEBHOOK_PUBLIC_URL?.trim();
  const url = `http://localhost:${port}/webhook`;
  const lines: string[] = [`[request-api-client] Webhook listener ready on ${url}`];

  if (publicUrl) {
    lines.push(`[request-api-client] Public URL (tunnel): ${publicUrl}`);
  }

  if (bypassVerification) {
    lines.push(
      "[request-api-client] Forward the public URL to Request Network and copy the generated webhook secret into REQUEST_WEBHOOK_SECRET.",
    );
    lines.push(`cloudflared example:\n  cloudflared tunnel --url ${url}`);
  } else {
    lines.push("[request-api-client] Using webhook secret from env; signature verification is enabled.");
  }

  process.stdout.write(`${lines.join("\n")}\n`);
});
