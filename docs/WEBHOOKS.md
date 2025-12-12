# Webhooks

Request Network sends HMAC-SHA256 signed JSON payloads to your webhook endpoint. The `@marcohefti/request-network-api-client` package ships a dedicated module that verifies signatures, validates payloads, routes events, and exposes test helpers.

This guide covers signature verification, middleware patterns, event handlers, and local development setup.

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

## Local Development Setup

This section shows how to configure a local webhook listener, expose it via Cloudflare Tunnel, and capture a signing secret so the live webhook tests can run without guesswork.

### Prerequisites

- Node.js ≥ 20.x and pnpm 10.17.1 (per repo toolchain)
- `pnpm install`
- An API key that can create webhooks in the Request API Portal
- Cloudflare Tunnel (`cloudflared`) installed locally
  - macOS: `brew install cloudflared`
  - Other platforms: see [Cloudflare's docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/)

### 1. Populate Environment Variables

Create a `.env` file for your webhook tests (or export the variables directly in your shell):

- Copy `.env.example` to `.env` in the repository root
- Fill in your credentials

```dotenv
REQUEST_API_KEY=...
REQUEST_CLIENT_ID=...
REQUEST_PAYEE_WALLET=...
REQUEST_PAYER_WALLET=...
REQUEST_PAYMENT_NETWORK=erc20-sepolia
REQUEST_PAYMENT_CURRENCY=ETH-sepolia-sepolia
REQUEST_CLIENT_USER_ID=user-test-...
# Leave REQUEST_WEBHOOK_SECRET empty for now
# (Optional) REQUEST_WEBHOOK_PUBLIC_URL=
# (Optional) REQUEST_WEBHOOK_TUNNEL_HOSTNAME=
# (Optional) REQUEST_WEBHOOK_TUNNEL_NAME=
```

### 2. (Optional) Create a Named Cloudflare Tunnel

Quick tunnels (`*.trycloudflare.com`) rotate every time you restart. For a persistent developer URL (and only if your Cloudflare account manages a DNS zone you can edit):

```sh
pnpm dlx cloudflared login
pnpm dlx cloudflared tunnel create <tunnel-name>
pnpm dlx cloudflared tunnel route dns <tunnel-name> <subdomain.your-zone.example>
```

> Already authenticated? `cloudflared login` will refuse to overwrite an existing certificate (`~/.cloudflared/cert.pem`). In that case you can skip the login command and reuse the existing credentials.

Record the tunnel name and hostname in the env file so scripts can reuse them. Stick to hostnames covered by your Cloudflare certificate (for Universal SSL this means a single-level subdomain such as `webhook-dev.<your-zone>.<tld>`):

```dotenv
REQUEST_WEBHOOK_TUNNEL_NAME=<tunnel-name>
REQUEST_WEBHOOK_TUNNEL_HOSTNAME=webhook-dev.<your-zone>.<tld>
```

Skip this section if rotating quick tunnels is fine **or** if your Cloudflare login does not control a zone yet. The tooling still works without a named tunnel.

### 3. Start the Listener + Tunnel via pnpm

```sh
pnpm webhook:dev:all
```

What happens:

- `dev:webhook` launches the Express listener on `http://localhost:8787/webhook`. If `REQUEST_WEBHOOK_SECRET` is empty, it runs in verification-bypass mode so you can create the webhook first.
- `tunnel:webhook` launches Cloudflare Tunnel. It uses:
  - `pnpm dlx cloudflared tunnel run <REQUEST_WEBHOOK_TUNNEL_NAME>` when the name is present (persistent hostname).
  - `pnpm dlx cloudflared tunnel --url http://localhost:8787` otherwise (quick tunnel). Set `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` to request a specific quick-tunnel hostname.

Leave the command running. Both processes stream logs and exit together when you press `Ctrl+C`. The scripts load environment variables via the shared env loader (honouring `REQUEST_API_CLIENT_ENV_FILE` and workspace defaults), so you don’t have to export variables manually.

### 4. Register the Webhook & Capture the Secret

1. Copy the public URL printed by Cloudflare (append `/webhook` if the suffix is missing).
2. Open the Request API Portal -> Webhooks -> "Create webhook".
3. Paste the URL, select the events you need, and submit.
4. Copy the generated signing secret into `REQUEST_WEBHOOK_SECRET` in your `.env` file.
5. Restart `pnpm webhook:dev:all` so the listener picks up the new secret and re-enables verification.

Optionally, set `REQUEST_WEBHOOK_PUBLIC_URL` to the same URL so tooling and logs reference it explicitly.

### 5. Run Live Tests (Optional)

Once the secret is in place (and the listener is running), you can hit staging flows and see real deliveries in the console. When running automated suites, the env vars are enough-no additional commands required.

### One-Line Scripts Reference

```sh
# Start listener + tunnel (stop with Ctrl+C)
pnpm webhook:dev:all

# Listener only
pnpm dev:webhook

# Tunnel only (quick tunnel or named tunnel depending on env vars)
pnpm tunnel:webhook
```

Restart `webhook:dev:all` whenever you rotate secrets or change env vars.

## See Also

- [QUICK-START.md](./QUICK-START.md) - Installation and basic usage
- [DOMAINS.md](./DOMAINS.md) - Domain API reference
- [HTTP-AND-ERRORS.md](./HTTP-AND-ERRORS.md) - HTTP client and error handling
