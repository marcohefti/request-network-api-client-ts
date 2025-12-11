# Request Network API Client (TypeScript)

TypeScript client for the Request Network hosted REST API. The goal is
to provide typed, ergonomic helpers for the API domains showcased in the Request
Easy Invoice app (invoices, payouts, compliance, client IDs, and currency
conversion) while offering a polished developer experience for future
WordPress/WooCommerce integrations.

Note: This package targets the REST API (hosted service), not the official protocol SDK.

## Installation

Install via npm or pnpm:

```bash
# npm
npm install @marcohefti/request-network-api-client

# pnpm
pnpm add @marcohefti/request-network-api-client
```

## Scope & Positioning

- This is an API client for the hosted Request Network REST API (v2). It is not the protocol SDK and does not require wallets/signers.
- Use this client when you need payouts, payment routes/intents, payer/compliance, client IDs, or currencies via REST (API key or client ID auth).
- Use the official `@requestnetwork/*` SDKs when you need protocol/on‑chain operations via a Request Node and you manage a signer.
- The two can be combined: keep protocol logic in dapps. Use this client for hosted API flows.

See the docs site:
- Scope & Positioning (/guide/scope)
- Quick Start (/guide/quick-start)
- HTTP Client details (/guide/http-client)
- Errors & Retries (/guide/error-retry)
- Domain guides: Currencies (/guide/domains/currencies), Client IDs (/guide/domains/client-ids)
- Before/After examples (/guide/before-after)

## Current Status

- **Scope:** 
- **Implementation:** Domain facades now cover requests (v2 + legacy v1), payer/compliance (v2 + legacy v1), payouts, client IDs, currencies (v2 + legacy v1), legacy pay execution, and payments search.  
  Vitest suites with MSW fixtures exercise success, validation, and 429 retry scenarios, and the OpenAPI parity guard asserts that no operation IDs are left uncovered.
- **Documentation:** Architectural research is in progress. The package will
  ship with comprehensive docs (README + `docs/ARCHITECTURE.md`) once patterns
  are finalized.
  - See `docs/WEBHOOKS.md` for the end-to-end local webhook setup (env vars, `pnpm webhook:dev:all`, Cloudflare tunnel workflow).
- **Toolchain:** Assumes Node.js 20.x-24.x with pnpm 10.17.1 (see workspace README
  for toolchain setup commands).

## Validation & Testing

- `pnpm test` runs the Vitest suite with coverage enabled via `vitest.config.mts`.
- `pnpm coverage` produces coverage reports on demand (`coverage/` directory).
- `pnpm test:matrix` executes the suite across Node 20, 22, and 24 (no coverage)
  by delegating to `scripts/test-matrix.sh`.
- `pnpm coverage:matrix` runs the same matrix with coverage enabled. This mirrors
  the GitHub Actions matrix and must pass before final validation when tasks touch
  this package.
- `pnpm build` bundles the package (CJS/ESM/dts) via tsup. Run it after the matrix
  sweep to mirror the CI packaging job and catch Rollup/DTS issues locally.

Matrix requirements:

1. Install Node versions with `nvm install 20 22 24` (or the exact patch
   releases documented in CI).
2. Run `corepack enable pnpm@10.17.1` (or `corepack prepare pnpm@10.17.1 --activate`)
   once per Node version so `pnpm` is available under `nvm exec`.
3. Execute `pnpm --filter "./packages/request-api-client" coverage:matrix` from
   the repo root (or `pnpm coverage:matrix` inside this package). Override the
   matrix list via `NODE_MATRIX="22 24"` if you need a narrower sweep during
   diagnostics, or switch to `test:matrix` for faster, coverage-free checks.
4. Run `pnpm --filter "./packages/request-api-client" build` so the bundled
   artifacts match the CI packaging stage.

## Runtime Support & Rationale

- **Baseline:** Coverage and production support start at Node 20. The matrix
  tracks Node 20/22/24 to match the active and current releases we ship against.
- **Why not Node 18?** Vitest’s V8 coverage provider depends on the
  `node:inspector/promises` builtin, which never shipped in any Node 18 release.
  Running the coverage suite under Node 18 fails before tests execute.
- **Evaluated alternative:** We could have retained Node 18 by switching to the
  Istanbul coverage provider (or dynamically swapping providers per runtime).
  That path introduces slower coverage runs, divergent report formats, and extra
  configuration to keep both providers aligned. For now we prefer a single,
  V8-based pipeline across every runtime.
- **Outcome:** We raised the minimum supported Node version to 20, updated the
  matrix, and documented the change here so downstream consumers know why the
  baseline shifted.

## Quick Start

Node (API key) - tested on Node 20.x-24.x with the built-in `fetch` implementation:

```ts
import { createRequestClient, RequestEnvironment, isRequestApiError } from '@marcohefti/request-network-api-client';

const client = createRequestClient({
  baseUrl: RequestEnvironment.production,
  apiKey: process.env.REQUEST_API_KEY!,
});

async function main() {
  try {
    const tokens = await client.currencies.list({ network: 'sepolia' });
    console.log('Currencies:', tokens.length);
  } catch (err) {
    if (isRequestApiError(err)) {
      console.error('API error', err.status, err.code, err.requestId, err.toJSON());
    } else {
      console.error(err);
    }
  }
}

main();
```

Runtime validation is on by default-the client verifies request payloads, success responses, and error envelopes against generated Zod schemas. Pass `runtimeValidation: false` (or a partial map) to `createRequestClient` or use `client.http.*` with `meta.validation` to relax checks on trusted hot paths.

From env:

```ts
import { createRequestClientFromEnv } from '@marcohefti/request-network-api-client';

const client = createRequestClientFromEnv();
// Reads REQUEST_API_URL, REQUEST_API_KEY, REQUEST_CLIENT_ID (falls back to legacy REQUEST_SDK_* vars)
```

Subpath imports (tree‑shake domains):

```ts
import { createRequestClient } from '@marcohefti/request-network-api-client';
import { createPaymentsApi } from '@marcohefti/request-network-api-client/payments';
import { createPayApi } from '@marcohefti/request-network-api-client/pay';
import { createRequestsV1Api } from '@marcohefti/request-network-api-client/v1/requests';
import { createCurrenciesV1Api } from '@marcohefti/request-network-api-client/v1/currencies';

const client = createRequestClient({ apiKey: process.env.REQUEST_API_KEY! });

const payments = createPaymentsApi(client.http);
const results = await payments.search({ requestId: 'req-123' });

const legacyRequests = createRequestsV1Api(client.http);
const status = await legacyRequests.getRequestStatus('ref-123');

const legacyCurrencies = createCurrenciesV1Api(client.http);
const [token] = await legacyCurrencies.list({ firstOnly: 'true', symbol: 'USDC', network: 'mainnet' });

const pay = createPayApi(client.http);
await pay.payRequest({
  payee: '0xpayee',
  amount: '12.50',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});
```

Root-level facades cover the REST v2 surface (`client.requests`, `client.payments`, `client.payouts`, `client.payer`, `client.currencies`, `client.pay`). Legacy endpoints stay available via `client.<domain>.legacy` (for example `client.currencies.legacy.list(...)`) or explicit versioned barrels such as `@marcohefti/request-network-api-client/v1/requests`.

Per‑request retry override and metadata:

```ts
const res = await client.http.request({
  path: '/v2/currencies',
  method: 'GET',
  meta: { operationId: 'CurrenciesV2Controller_getNetworkTokens_v2', retry: { maxAttempts: 3 } },
});
```

Browser/Edge (client ID):

```html
<!-- Requires a bundler or import map to resolve '@marcohefti/request-network-api-client' -->
<script type="module">
  import { createRequestClient, browserFetchAdapter } from '@marcohefti/request-network-api-client';

  const client = createRequestClient({
    baseUrl: 'https://api.request.network',
    clientId: 'YOUR_CLIENT_ID',
    adapter: browserFetchAdapter,
  });

const routes = await client.currencies.getConversionRoutes('USDC', { networks: 'sepolia' });
  console.log(routes);
</script>
```

## API Surface & Naming

- Domain facades use consistent verbs: `create`, `list`, `findOne`, `update`, `delete`. Derived getters keep descriptive prefixes (`getPaymentRoutes`, `getPaymentCalldata`, `getConversionRoutes`) and fire-and-forget helpers use imperatives such as `sendPaymentIntent`.
- Method arguments are ordered as path identifiers (`requestId`, `clientId`, etc.), followed by the primary payload/body, then an optional `options` bag for params or overrides. Avoid positional booleans or unnamed tuples.
- Identifiers mirror REST paths-reuse upstream names instead of inventing aliases. `list*` methods return raw arrays; `findOne*` methods return a single object (or `null` when 404s are handled). Union responses expose a `kind` discriminant to make type narrowing straightforward.
- Tree-shakeable domain barrels are published at `@marcohefti/request-network-api-client/requests`, `.../payouts`, `.../payer`, `.../currencies`, and `.../client-ids`. Additional domains must follow the same naming pattern.

### Shared Request REST types (single source of truth)

Use the client’s exported types instead of mirroring Request REST shapes downstream:

- `PaymentCalldataResult`, `PaymentRoutesResponse`/`PaymentRoute`, `RequestStatusResult`, `GetPaymentCalldataOptions` from `@marcohefti/request-network-api-client/requests` (also re-exported at the package root).
- `CurrencyToken` from `@marcohefti/request-network-api-client/currencies`.
- `ClientIdResponse` from `@marcohefti/request-network-api-client/client-ids`.

If a Request domain type is missing, add it here rather than re-declaring it in consumers.

## HTTP Client Options

- Cancellation & timeouts: pass `signal` and/or `timeoutMs` per request. Defaults propagate to the fetch adapter.
- Query serialization: override `querySerializer` with `'repeat'` or a custom function when endpoints expect exploded params (default: comma-joined).
- Convenience verbs: `http.get/post/put/patch/delete/head/options` wrap `http.request`.
- Logging: supply `logger` plus `logLevel` (`silent` | `error` | `info` | `debug`) to control `request:start`, `request:response`, `request:retry`, `request:error`, and `rate-limit` events.
- Telemetry headers: set `userAgent` and/or `sdkInfo` (`{ name, version? }`) on `createRequestClient` to stamp `User-Agent` and `x-sdk` headers globally.
- Runtime validation: enabled by default for request bodies, responses, and error envelopes. Configure globally with `runtimeValidation` (boolean or `{ requests?, responses?, errors? }`) and override per call via `meta.validation` on `RequestOptions` when performance is critical and upstream data is trusted.

## Webhooks

### Signature Verification

The `webhooks` module exposes low-level helpers to verify Request Network webhook deliveries. Every webhook is signed with an HMAC-SHA256 digest in the `x-request-network-signature` header. Recompute the digest over the **raw request body** (no JSON parsing) and compare it using a constant-time check:

```ts
import { webhooks } from "@marcohefti/request-network-api-client";

const { signature, matchedSecret } = webhooks.verifyWebhookSignature({
  rawBody: rawPayloadBuffer,
  secret: process.env.REQUEST_WEBHOOK_SECRET!,
  headers: request.headers,
});
```

`verifyWebhookSignature` throws `RequestWebhookSignatureError` when the header is missing, malformed, outside the optional timestamp tolerance, or invalid.

### Express Middleware & Dispatcher

`createWebhookMiddleware` verifies signatures, validates payloads with Zod, and hands typed events to your handlers:

```ts
import express from "express";
import { webhooks } from "@marcohefti/request-network-api-client";

const dispatcher = webhooks.createWebhookDispatcher();

webhooks.events.onPaymentConfirmed(dispatcher, async (payload) => {
  await enqueueSettlement(payload.requestId);
});

const middleware = webhooks.createWebhookMiddleware({
  secret: process.env.REQUEST_WEBHOOK_SECRET!,
  dispatcher,
});

const app = express();
app.post("/request-webhook", middleware, (req, res) => {
  res.status(200).send("ok");
});
```

> **Raw body capture**
>
> Configure your framework to supply the raw request body to the middleware:
>
> - **Express** - `app.use("/request-webhook", express.raw({ type: "application/json" }))` before the middleware.
> - **Next.js (route handlers)** - call `await request.clone().arrayBuffer()` and pass the clone into `verifyWebhookSignature`.
> - **Next.js (pages/api)** - disable the default body parser (`export const config = { api: { bodyParser: false } };`) and use `getRawBody` with `micro` or `raw-body`.
> - **Fastify** - enable `rawBody: true` on the route (`{ config: { rawBody: true } }`) and use `request.rawBody`.

The dispatcher supports multiple handlers per event and guarantees registration order. Typed helpers live under `webhooks.events.*` (e.g. `onPaymentFailed`, `isPaymentDetailApproved`, `complianceStatusSummary`).

### Local Development with Cloudflare Tunnel

Spin up a local endpoint and expose it through Cloudflare to fetch real webhook payloads and secrets:

1. Start both the listener and tunnel (expects `REQUEST_WEBHOOK_SECRET`. Stop with `Ctrl+C` when done):
   ```sh
   pnpm --filter "./packages/request-api-client" webhook:dev:all
   ```
   The listener binds to `http://localhost:8787/webhook`. The tunnel script shells out to `pnpm dlx cloudflared tunnel --url http://localhost:8787` and streams Cloudflare’s logs.
   - Prefer a dedicated tunnel? Run the pieces separately with `pnpm --filter "./packages/request-api-client" dev:webhook` and `pnpm --filter "./packages/request-api-client" tunnel:webhook`.
   - If `REQUEST_WEBHOOK_SECRET` is missing, the listener starts in verification-bypass mode with a placeholder secret so you can register the webhook. Update the env and restart once you have the real value.
   - Provide `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` to request a specific hostname or `REQUEST_WEBHOOK_TUNNEL_NAME` to run an existing named tunnel (via `cloudflared tunnel run <name>`) for persistence.
   - The scripts load `env/request-api-client.local.env` automatically. There’s no need to export variables manually.
2. Cloudflare prints a URL such as `https://purple-bird.trycloudflare.com`. Record it in `REQUEST_WEBHOOK_PUBLIC_URL` if you want it visible in logs. Set `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` to request a specific hostname (requires `cloudflared login`).
3. Create a webhook in the Request API Portal that targets `<public-url>/webhook` and copy the generated secret into `REQUEST_WEBHOOK_SECRET`. Restart the listener (if needed) so it picks up the new value.
4. Trigger events (for example, pay a Sepolia request) and watch the console for structured logs from the middleware and sample dispatcher handlers.

For a stable hostname, authenticate with `cloudflared login`, create a named tunnel, and map it to a domain you control. Cloudflare continues to route traffic through the same edge network while giving you a persistent URL.

### Testing Utilities

`webhooks.testing` mirrors industry webhook SDK ergonomics:

- `generateTestWebhookSignature(payload, secret?)` - produce HMAC digests for fixtures.
- `withWebhookVerificationDisabled(fn)` / `setWebhookVerificationBypass(true)` - temporarily disable verification (the middleware also obeys `REQUEST_WEBHOOK_DISABLE_VERIFICATION=true`).
- `createMockWebhookRequest({ payload, secret?, headerName?, headers? })` and `createMockWebhookResponse()` - lightweight Express-compatible mocks for unit tests.

Example:

```ts
import { webhooks } from "@marcohefti/request-network-api-client";

const payload = { event: "payment.confirmed", requestId: "req_123" };
const signature = webhooks.testing.generateTestWebhookSignature(payload, "whsec_test");
const req = webhooks.testing.createMockWebhookRequest({ payload, secret: "whsec_test" });

// mutate req.rawBody before invoking the middleware to simulate tampering
```

### Event Helpers

Each documented webhook event ships with a typed facade:

- `payment.confirmed` - request/payment metadata and dispatcher helper.
- `payment.failed` - failure predicates (`isBouncedFailure`, `isInsufficientFundsFailure`) and retry hints.
- `payment.processing` - stage predicates (`isProcessingTerminalStatus`, `processingStageLabel`, `isRetryRequired`).
- `payment.partial` - dispatcher helper for partial payments (`onPaymentPartial`).
- `payment.refunded` - dispatcher helper for refunds (`onPaymentRefunded`).
- `payment_detail.updated` - account onboarding helpers (`isPaymentDetailApproved`, `isPaymentDetailRejected`, `isPaymentDetailPending`, `isPaymentDetailVerified`).
- `request.recurring` - dispatcher helper for recurring requests (`onRequestRecurring`).
- `compliance.updated` - compliance summaries (`isKycComplete`, `isAgreementRejected`, `complianceStatusSummary`) with `agreementStatus: "signed"` support.

All helpers validate payloads against the shared webhook spec in `@marcohefti/request-network-api-contracts/specs/webhooks/request-network-webhooks.json`. The parity guard (`tests/webhooks/event-parity.test.ts`) ensures the exported event list stays in sync with the spec.

## Error Handling

- All non-2xx responses surface as `RequestApiError` with `status`, `code`, `detail`, `errors[]`, `requestId`, `correlationId`, and `retryAfterMs` metadata.
- Call `error.toJSON()` to log or emit structured telemetry without losing context:

```ts
import { isRequestApiError } from "@marcohefti/request-network-api-client";

try {
  await client.requests.get("req-123");
} catch (error) {
  if (isRequestApiError(error)) {
    console.error("Request API failure", error.toJSON());
    if (error.retryAfterMs) {
      setTimeout(() => console.info("Retrying after backoff"), error.retryAfterMs);
    }
  }
}
```

- Unexpected error shapes raise a `ClientValidationError` when runtime validation is enabled. Disable error validation only when upstream responses are fully trusted or downstream systems enforce their own guards.

## Domain Facades

The high-level client exposes typed facades for core REST domains:

```ts
import { createRequestClient } from '@marcohefti/request-network-api-client';

const client = createRequestClient({ baseUrl: 'https://api.request.network', apiKey: '...' });

const request = await client.requests.create({
  amount: '12.5',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});

const calldata = await client.requests.getPaymentCalldata(request.requestId!, { chain: 'OPTIMISM' });
if (calldata.kind === 'paymentIntent') {
  await client.requests.sendPaymentIntent(calldata.paymentIntentId, {
    signedPaymentIntent: { signature: '0xintent', nonce: '1', deadline: '999999' },
  });
}

const status = await client.requests.getRequestStatus(request.requestId!);
if (status.kind === 'paid') {
  console.log('Request paid with tx hash', status.txHash);
}

const batch = await client.payouts.createBatch({
  requests: [
    { payee: '0xpayee', amount: '120', invoiceCurrency: 'USD', paymentCurrency: 'USDC-sepolia' },
  ],
});

await client.payer.createComplianceData({
  clientUserId: 'merchant-user-1',
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  beneficiaryType: 'individual',
  dateOfBirth: '1990-01-01',
  addressLine1: '1 Main St',
  city: 'Paris',
  postcode: '75001',
  country: 'FR',
  nationality: 'FR',
  phone: '+33123456789',
  ssn: '123456789',
});

const search = await client.payments.search({ requestId: request.requestId! });
console.log('Payments found:', search.pagination.total);

await client.pay.payRequest({
  payee: '0xmerchant',
  amount: '25',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});

const tokens = await client.currencies.list({ network: 'sepolia' });
const legacyTokens = await client.currencies.legacy.list({ firstOnly: 'true', symbol: 'USDC', network: 'mainnet' });
```

All domain methods honour the runtime validation toggle and leverage operationId-scoped schemas for both requests and responses.

## API Versioning

- Root exports target the Request hosted REST API v2 endpoints. Keep new integrations on these defaults so they inherit the latest behaviour automatically.
- The client does not expose a global `apiVersion` toggle. Mixing versions within one instance is discouraged.
- When legacy support is required, use explicit subpath barrels (e.g., `@marcohefti/request-network-api-client/v1/requests`) that map to older endpoints. These barrels are introduced only when we need to support multiple versions in parallel.
- Version-specific barrels reuse the same HTTP pipeline and surface identical method names-the version difference lives in the request path and generated types.

## Available Tooling

- `pnpm run build` bundles the client to dual ESM/CJS outputs in `dist/`.
- `pnpm run tsc` (alias: `pnpm run typecheck`) runs strict `tsc` diagnostics against both the build config (`tsconfig.build.json`) and the test config (`tsconfig.vitest.json`) so source and integration suites stay aligned.
- `pnpm run lint` / `lint:fix` enforce the TypeScript + Prettier ruleset.
- `pnpm run test` executes the Vitest suite (MSW-backed unit tests plus the OpenAPI parity guard).
- `pnpm run test:live` runs the live integration suite (Sepolia by default). Set `REQUEST_API_URL`, `REQUEST_PAYMENT_NETWORK`, and wallets to mainnet when you want to hit production.
- `pnpm run dev` keeps the tsup bundler in watch mode during local work.
- `pnpm run prepare:spec` refreshes the Request Network OpenAPI spec and regenerates typed contracts.
- `pnpm run generate:zod` emits Zod schemas for request bodies, success responses (200/201), and error envelopes keyed by `operationId`/status and registers them. Each domain barrel lazily loads its group schemas for validation. Currencies override the generated `unknown` schema with a richer token definition.
- For endpoint-specific behaviour notes (prerequisites, known quirks), see [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md).
- For upcoming test structure and sandbox credentials, see [`docs/TESTING.md`](docs/TESTING.md).

### Integration Suites & Credentials

- The live integration suite lives under `tests/integration/live/` and expects the integration env vars (`REQUEST_API_KEY`, `REQUEST_PAYEE_WALLET`, `REQUEST_PAYMENT_NETWORK`, `REQUEST_PAYMENT_CURRENCY`, etc.) to be populated. Missing variables cause the suite to skip automatically with console guidance. Point the env values at Sepolia for sandbox runs or switch them to mainnet when you need to validate against the live network.
- The default live scenario exercises wallet-to-wallet flows only (create request -> status -> routes -> calldata -> payment search). Off-ramp helpers remain in the codebase but are disabled, so providing `REQUEST_CLIENT_USER_ID`, `REQUEST_PAYMENT_DETAILS_ID`, or payout env vars simply emits a notice that the coverage was skipped.
- A dedicated webhook suite (`tests/integration/live/webhooks-recurring.test.ts`) spins up the Express middleware in-process, relays traffic through the Cloudflare tunnel (`pnpm run tunnel:webhook`), waits for a `request.recurring` delivery, and then pauses the recurrence via the legacy API. Provide `REQUEST_WEBHOOK_SECRET` and ensure `REQUEST_WEBHOOK_PUBLIC_URL` points at your named tunnel before running it.
- The single env template lives at `env/request-api-client.integration.env.example`. Copy it to `env/request-api-client.local.env` (gitignored) before running `pnpm --filter "./packages/request-api-client" test:live`.

## Working with the OpenAPI Spec

- The canonical API definition is downloaded via `pnpm run fetch:openapi`, which now writes the latest schema into the shared contracts package at `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json` alongside metadata (`request-network-openapi.meta.json`).
- `pnpm run generate:types` converts that shared spec into TypeScript exports at `src/generated/openapi-types.ts`. Do not hand-edit the generated file.
- Commit both the raw spec changes under `packages/request-client-contracts/specs/` and the regenerated outputs in this package so diffs surface upstream API updates during review.
- `pnpm run generate:zod` emits Zod schemas (by operationId) and registers them. Parsers are grouped by tag/controller so domains lazy‑load only what they need.

## Planned Capabilities

- Shared HTTP client with API key and client ID authentication helpers.
- Domain modules ship today for requests (v2 + legacy v1), payouts, payer/compliance (v2 + legacy v1), client IDs, currencies (v2 + legacy v1), payments search, legacy pay execution, and webhook verification utilities. React hooks stay on the roadmap.
- Utilities for platform fee configuration, wallet validation, error handling,
  and (eventually) webhook verification.
- Dual build outputs (ESM + CJS) with typed entrypoints and tree-shakeable
  sub-path exports.
- Configurable retries, logging hooks, and custom `RequestApiError` instances
  that surface HTTP status, error codes, and correlation IDs.

## Next Steps

1. Harden sandbox/integration coverage for critical flows (payments, pay, payouts).
2. Expand documentation and examples as new endpoints land. Keep the docs site aligned with the client surface.
3. Monitor upstream OpenAPI changes via the parity guard and regenerate Zod schemas when specs shift.
4. Prepare publishing workflow once the client stabilizes.
5. Track public release requirements in [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

For detailed design goals, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

The shared HTTP pipeline and domain facades ship today. This README captures the
current surface so contributors can integrate without guesswork.

## Versioning & Releases

- Changesets manages release notes and version bumps. Run `pnpm changeset` to create a new entry whenever behaviour changes. The config ignores the other workspace packages so only this client is tracked.
- The repo exposes `pnpm changeset:version` and `pnpm changeset:publish` scripts for local dry-runs. The manual **Changesets Release** workflow mirrors these steps once the package goes public.
- Publishing is currently disabled for this private monorepo. The workflow exits early when the repository is private, but the scaffold documents the eventual process.
- Track remaining launch work (including when to enable automated publishes) in [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

## Environments & fromEnv helper

- Use presets via `RequestEnvironment`:
  
```ts
import { createRequestClient, RequestEnvironment } from '@marcohefti/request-network-api-client';
  const client = createRequestClient({ baseUrl: RequestEnvironment.production, apiKey: process.env.REQUEST_API_KEY });
  ```

- Or load from env variables with `createRequestClientFromEnv()`:
  
```ts
import { createRequestClientFromEnv } from '@marcohefti/request-network-api-client';
  const client = createRequestClientFromEnv();
  // Reads REQUEST_API_URL, REQUEST_API_KEY, REQUEST_CLIENT_ID (falls back to legacy REQUEST_SDK_* vars)
  ```

### Environment Variables

`createRequestClientFromEnv()` looks for the canonical names first:

- `REQUEST_API_URL` - optional override when pointing the client at a proxy or self-hosted gateway. Defaults to `https://api.request.network`.
- `REQUEST_API_KEY` - server-to-server credential from the [Request API Portal](https://docs.request.network/request-network-api/api-portal-manage-api-keys-and-webhooks). Use the same key for production traffic and for sandbox flows backed by Sepolia/testnet accounts.
- `REQUEST_CLIENT_ID` - front-end credential that sends `x-client-id` alongside the browser `Origin` header. Create IDs via `POST /v2/client-ids` (the platform API exposes full CRUD) or, where available, the portal’s **Client IDs** section. Downstream front-end flows should never embed an API key.

If you see `401 Unauthorized`, double-check the key value and confirm the workspace has been granted the capabilities (e.g., crypto-to-fiat) required by the flow you are exercising.

If any are missing, the helper falls back to the legacy `REQUEST_SDK_BASE_URL`, `REQUEST_SDK_API_KEY`, `REQUEST_SDK_CLIENT_ID`, and `REQUEST_SDK_LOG_LEVEL` variables. Document the legacy names only when supporting older deployments, and plan to migrate integrations to the new names ahead of the 1.0 release when the legacy prefix will be removed.

## Examples

- Node: see `examples/node/quick-start.mjs` (set `REQUEST_API_KEY`).
- Browser: see `examples/browser/quick-start.html` (requires a bundler or import map and a client ID).
