# Webhooks

Request Network sends HMAC-SHA256 signed JSON payloads to your webhook endpoint. The `@marcohefti/request-network-api-client` package ships a dedicated module that verifies signatures, validates payloads, routes events, and exposes test helpers.

## Capturing the Raw Body

The signature covers the **raw request body**. Make sure your framework hands the unparsed payload to the verifier:

- **Express** - register `express.raw({ type: "application/json" })` on the webhook route before any body parser.
- **Next.js App Router** - call `await request.clone().arrayBuffer()` in a Route Handler and pass the Buffer to the verifier.
- **Next.js Pages Router** - disable the default body parser (`export const config = { api: { bodyParser: false } };`) and use `micro` or `raw-body` to obtain the raw payload.
- **Fastify** - enable `rawBody: true` on the route (`{ config: { rawBody: true } }`) and read `request.rawBody`.
- **NestJS (Express adapter)** - configure the underlying Express instance to expose `req.rawBody` (for example by registering `express.raw({ type: "application/json" })` on the webhook route) and pass that value into `parseWebhookEvent`.

## Signature Verification

```ts
import { webhooks } from "@marcohefti/request-network-api-client";

const { signature } = webhooks.verifyWebhookSignature({
  rawBody: rawPayloadBuffer,
  headers: request.headers,
  secret: process.env.REQUEST_WEBHOOK_SECRET!,
});
```

`verifyWebhookSignature` throws a `RequestWebhookSignatureError` when the signature is missing, malformed, or invalid.

## Middleware & Dispatcher

```ts
import express from "express";
import { webhooks } from "@marcohefti/request-network-api-client";

const dispatcher = webhooks.createWebhookDispatcher();

webhooks.events.onPaymentProcessing(dispatcher, async (payload) => {
  if (webhooks.events.isProcessingTerminalStatus(payload.subStatus)) {
    await markRequestComplete(payload.requestId);
  }
});

const middleware = webhooks.createWebhookMiddleware({
  secret: process.env.REQUEST_WEBHOOK_SECRET!,
  dispatcher,
});

const app = express();
app.use("/webhook", express.raw({ type: "application/json" }));
app.post("/webhook", middleware, (_req, res) => res.sendStatus(200));
```

The middleware attaches the typed payload to `req.webhook` and honours the global bypass toggle (set `REQUEST_WEBHOOK_DISABLE_VERIFICATION=true` or call `webhooks.testing.setWebhookVerificationBypass(true)` inside tests).

## NestJS-style Controller (parseWebhookEvent)

When you prefer to keep verification and routing inside a NestJS controller or service, use the low-level parser instead of the Express middleware:

```ts
import { BadRequestException, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { webhooks, ValidationError } from "@marcohefti/request-network-api-client";

type RawBodyRequest = Request & { rawBody?: Buffer | string | Uint8Array };

@Controller("webhooks/request")
export class RequestWebhookController {
  @Post()
  async handleWebhook(@Req() req: RawBodyRequest): Promise<void> {
    if (!req.rawBody || (typeof req.rawBody === "string" && req.rawBody.length === 0)) {
      throw new BadRequestException("Raw body is required for webhook verification");
    }

    let parsed: webhooks.ParsedWebhookEvent;
    try {
      parsed = webhooks.parseWebhookEvent({
        rawBody: req.rawBody,
        headers: req.headers,
        secret: process.env.REQUEST_WEBHOOK_SECRET!,
      });
    } catch (error) {
      if (webhooks.isRequestWebhookSignatureError(error)) {
        throw new BadRequestException("Invalid webhook signature");
      }
      if (error instanceof ValidationError) {
        throw new BadRequestException("Invalid webhook payload");
      }
      throw error;
    }

    // Handle the typed payload
    if (parsed.event === "payment.confirmed") {
      // e.g., mark a payment as complete in your system
      // await paymentsService.handleConfirmed(parsed.payload);
    }
  }
}
```

Make sure `req.rawBody` is populated as described in the **Capturing the Raw Body** section. NestJS automatically forwards headers from the underlying adapter, so you can pass `req.headers` directly into `parseWebhookEvent`.

## Local Development with Cloudflare Tunnel

1. Start the bundled listener and tunnel together (stop with `Ctrl+C` when finished):
   ```sh
   pnpm --filter "./packages/request-api-client" webhook:dev:all
   ```
   The listener runs on `http://localhost:8787/webhook`. The tunnel shells out to `pnpm dlx cloudflared tunnel --url http://localhost:8787`.
   - Prefer separate processes? Use `pnpm --filter "./packages/request-api-client" dev:webhook` and `pnpm --filter "./packages/request-api-client" tunnel:webhook`.
   - Set `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` to request a specific hostname (requires `cloudflared login`). Provide `REQUEST_WEBHOOK_TUNNEL_NAME` to run an existing named tunnel via `cloudflared tunnel run <name>` for a persistent URL.
   - If `REQUEST_WEBHOOK_SECRET` is missing, the listener starts in verification-bypass mode with a placeholder secret so you can register the webhook. Update the env and restart once the real secret is available.
   - Need more detail? See `docs/WEBHOOKS.md` in the repository for the full checklist.
2. Copy the public URL that Cloudflare prints (for example, `https://purple-bird.trycloudflare.com`) and optionally store it in `REQUEST_WEBHOOK_PUBLIC_URL` so the listener logs it on startup.
3. Register a webhook in the Request API Portal pointing at `<public-url>/webhook` and copy the generated secret into `REQUEST_WEBHOOK_SECRET`.
4. Trigger payments or compliance flows to replay real payloads locally. Restart the listener whenever you rotate secrets.

For a persistent hostname, authenticate with `cloudflared login`, create a named tunnel, and map it to a domain you control. Cloudflare continues to proxy traffic through the same edge network.

## Event Helpers

- `payment.confirmed` - typed payload + dispatcher helper (`onPaymentConfirmed`).
- `payment.failed` - predicates (`isBouncedFailure`, `isInsufficientFundsFailure`) and failure metadata.
- `payment.processing` - stage helpers (`isProcessingTerminalStatus`, `processingStageLabel`, `isRetryRequired`) including the new `processing` stage.
- `payment.partial` - dispatcher helper for partial payments (`onPaymentPartial`).
- `payment.refunded` - dispatcher helper for refunds (`onPaymentRefunded`) with destination metadata.
- `payment_detail.updated` - onboarding predicates (`isPaymentDetailApproved`, `isPaymentDetailRejected`, `isPaymentDetailPending`, `isPaymentDetailVerified`).
- `request.recurring` - dispatcher helper for recurring requests (`onRequestRecurring`).
- `compliance.updated` - compliance helpers (`isKycComplete`, `isAgreementRejected`, `complianceStatusSummary`) and agreement status coverage, including `signed`.

Every helper validates against `@marcohefti/request-network-api-contracts/specs/webhooks/request-network-webhooks.json`; `webhooks.WEBHOOK_EVENT_NAMES` and the parity guard (`tests/webhooks/event-parity.test.ts`) keep exports aligned with the spec.

## Testing Utilities

`webhooks.testing` exposes:

- `generateTestWebhookSignature(payload, secret?)`
- `createMockWebhookRequest({ payload, secret?, headerName?, headers? })`
- `createMockWebhookResponse()`
- `withWebhookVerificationDisabled(fn)` / `setWebhookVerificationBypass(true)`

Use them inside Vitest suites or downstream packages to avoid duplicating HMAC logic. Fixtures for the documented events live in `@marcohefti/request-network-api-contracts/fixtures/webhooks/**`.
