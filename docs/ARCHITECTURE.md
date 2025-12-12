# @marcohefti/request-network-api-client Architecture

## 1. Goals & Non-Goals

- **Goals**
  - Provide a developer-friendly, typed client for the Request Network REST API.
  - Support both Node.js (API key auth) and browser/edge contexts (client ID auth).
  - Deliver reliable helpers for invoices, payouts, compliance, client IDs, and currency conversion, matching real-world usage from Request’s Easy Invoice showcase.
  - Ship dual module formats (ESM + CommonJS) with excellent TypeScript support.
  - Offer extensibility for future features (webhooks, analytics, caching).
- **Non-Goals (for the initial release)**
  - Implement full webhook verification or signer utilities (stub included for follow-up).
  - Provide UI elements or React hooks (these live outside this library).

See also: [SCOPE.md](./SCOPE.md), [BEFORE-AFTER.md](./BEFORE-AFTER.md)

## 2. Supported Runtimes

- **Node.js:** >=20.x (CI covers 20/22/24. Stick to the latest Active LTS for production). See the [Runtime Support & Rationale](../README.md#runtime-support--rationale) for details on the Node 20 baseline.
- **Browser / Edge:** Modern browsers and serverless platforms via fetch-compatible adapters. The client must avoid Node-only globals in shared modules.

See also - docs site: [Quick Start](/guide/quick-start)

## 3. High-Level Package Layout

```
.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   └── PUBLISHING.md
├── src/
│   ├── index.ts                       # Public entrypoint
│   ├── core/                          # Transport/auth/error/validation primitives
│   │   ├── http/
│   │   │   ├── client.factory.ts      # Transport-agnostic request builder
│   │   │   ├── interceptors/
│   │   │   │   ├── retry.interceptor.ts
│   │   │   │   └── logging.interceptor.ts
│   │   │   └── adapters/
│   │   │       ├── node-fetch.adapter.ts
│   │   │       └── browser-fetch.adapter.ts
│   │   ├── auth/
│   │   │   └── credential-header.builder.ts
│   │   ├── errors/
│   │   │   └── request-api-error.ts
│   │   └── validation/
│   │       └── <domain>.schema.ts     # Generated + hand-tuned Zod schemas
│   ├── domains/                       # One folder per API domain (requests, payouts, …)
│   │   └── <domain>/
│   │       ├── <domain>.facade.ts     # Public surface for the domain
│   │       ├── <domain>.mappers.ts    # DTO ↔ client translators
│   │       ├── <domain>.ports.ts      # Abstractions for testing/extensibility
│   │       ├── <domain>.errors.ts     # Domain-specific errors (optional)
│   │       └── index.ts               # Barrel export
│   ├── support/                       # Cross-domain behaviour with clear ownership
│   │   ├── fees/fee-policy.ts
│   │   ├── wallet/wallet-address.ts
│   │   └── recurrence/recurrence-plan.ts
│   └── webhooks/
│       ├── verify.service.ts          # Sign/verify helpers (stub for now)
│       └── index.ts
├── tests/                             # Shared testing assets
│   ├── fixtures/                      # Canonical payloads (docs/OpenAPI sourced)
│   ├── msw/                           # Shared MSW server setup
│   ├── types/                         # Type assertion suites (tsc-driven)
│   └── utils/                         # Sandbox gating + helpers
└── tsconfig*.json                     # TypeScript configs (build, vitest, etc.)

> Contracts (OpenAPI spec, metadata, webhook fixtures) live in `@marcohefti/request-network-api-contracts` and are consumed via package imports during build/test steps.
```

## 4. HTTP Pipeline & Request Client

The client is built around a layered transport pipeline:

1. **Public facade** - `RequestClient` exposes domain-centric methods (`client.requests.create`, `client.payouts.listRoutes`, …). It wires user configuration into the shared pipeline and returns typed results.
2. **Auth/header builder** - Injects the correct credentials (`x-api-key`, `x-client-id`, optional rate-limit headers) and merges per-call overrides (e.g., temporary client ID) with client defaults.
3. **Interceptors** - A composable stack that handles:
   - **Retry & backoff** (`retryInterceptor`) driven by configuration (`maxAttempts`, `retryOn` status codes).
   - **Logging / telemetry** (structured logs, request/response timings, optional custom logger hook).
   - **Error normalisation** converting failed responses into `RequestApiError`.
   - **Rate-limit notifications** emitting events so consumers can inspect `Retry-After` or quota headers.
4. **Transport adapters** - `node-fetch` and `browser-fetch` implementations that conform to a narrow adapter interface. Consumers can provide their own adapter (for tracing, caching, or runtime-specific fetch polyfills).
5. **Response mappers** - Domain modules map raw OpenAPI responses into ergonomic client objects (camelCase fields, helper methods) before returning to users.

### HTTP Controls (Timeouts, Abort, Query Serialization, Verbs, User Agent)

- Timeouts & cancellation: Request options accept `timeoutMs` and `signal?: AbortSignal`. Adapters implement `AbortController` to enforce time bounds and propagate cancellations.
- Query serialization: Default to form style with `explode=false` (comma‑joined arrays). Allow an overridable `querySerializer` or per‑key style to support repeated params when needed.
- Convenience verbs: In addition to `get`/`post`, expose `put`, `patch`, `delete`, `head`, and `options` wrappers that delegate to the underlying `request` with typed signatures.
- SDK identification: Support configurable `userAgent`/`x-sdk` header fields via client options. The header builder merges these into default headers for observability/analytics.

See also - docs site: [HTTP Client](/guide/http-client), [Errors & Retries](/guide/error-retry)

`RequestClient` accepts:

- `baseUrl` (defaults to production), `apiKey`, `clientId`.
- `httpAdapter` override, `logger` hook + `logLevel`, `retry` configuration.
- Future telemetry hooks (metrics emitters, tracing) share the same interception surface.

All modules use this pipeline, so resilience or observability features land once and benefit every endpoint.

### Operation Helper Pattern

- Domains use a small helper to DRY transport + validation:
  - `requestJson({ operationId, method, path, query, body, schemaKey, description })` sends the request with `meta.operationId` and validates the response via the schema registry.
  - This keeps facades thin and consistently instrumented.

Core request options include `signal`, `timeoutMs`, and `querySerializer` (comma joined by default, or `'repeat'`/custom) so domains can opt into cancellation, bounded latency, or alternate query encodings per endpoint.

## 5. Generated Types & Runtime Validation

- `openapi-typescript` produces `src/generated/openapi-types.ts` (operation paths, schemas, enums). Do not edit manually.
- `scripts/generate-zod.mjs` emits Zod schemas for **request bodies**, success responses (200/201), and error envelopes (>=400) into `src/validation/generated/**`. Hand-authored refinements live beside the generated schema when OpenAPI lacks precision.
- Error envelopes fall back to a shared schema (`ErrorEnvelopeSchema`) when the spec only provides examples. This validates that the payload is object-shaped and exposes expected fields (`status`, `code`, `message`, `errors[]`, etc.).
- Domain modules import types from `src/types/` barrels that re-export generated definitions and add client-specific helpers (e.g., narrower literal unions, discriminated unions for polymorphic responses).
- Public method signatures must rely on these generated types so compile-time guarantees track upstream contract changes. Implementations validate inputs and outputs via Zod before dispatching requests to catch invalid user data early.
- Runtime validation is **enabled by default** at the HTTP boundary. Consumers can toggle it globally with `createRequestClient({ runtimeValidation: true | false | { requests?, responses?, errors? } })` and per call via `RequestOptions.meta.validation` (domain facades will surface this through optional `options` bags as they expand).
- Normalised errors expose `RequestApiError#toJSON()` so structured logging stays consistent across runtimes without manually selecting fields.
- When the spec updates, run `pnpm run prepare:spec`, inspect both the raw JSON diff and the generated type diff, regenerate Zod (`pnpm run generate:zod`), then update validation and module mappers accordingly.

## 6. Module Boundaries & Dependency Rules

Borrowing from the `api-service`/`web-studio` patterns, we enforce clear dependency arrows:

| Layer / Folder | May import | Must not import | Naming convention | Notes |
| --- | --- | --- | --- | --- |
| `src/core/**` | Standard library, small third-party helpers | `src/domains/**` | `http/client.factory.ts`, `auth/credential-header.builder.ts`, `errors/request-api-error.ts`, `validation/<domain>.schema.ts` | Core transport/auth/error primitives. |
| `src/domains/<domain>/**` | `src/core/**`, `src/support/**`, own subfolders | Other domains (except via facades) | `requests.facade.ts`, `requests.mappers.ts`, `requests.ports.ts` | Domains stay isolated. Reuse via facades or support modules. |
| `src/support/**` | Standard library, small third-party helpers | `src/domains/**` | `fees/fee-policy.ts`, `wallet/wallet-address.ts` | Cross-domain behaviour with explicit ownership. |
| `tests/**` | Everything | - | `fixtures/*.json`, `msw/handlers.server.ts`, `types/*.types.test.ts`, `utils/env.utils.ts` | Shared assets only. Feature specs live next to implementation. |

These rules will later be enforced with ESLint/depcruise once code lands. Keep files close to the feature they support and export only what other slices genuinely need.

### 6.2 Interceptor Execution Order

- User-provided interceptors execute as the outermost layer, followed by built-in interceptors (retry -> logging). This lets consumers add tracing/correlation wrappers around the full pipeline while still benefiting from core policies inside.

### 6.3 Idempotency and Retries

- The retry interceptor evaluates status codes and defaults to idempotent methods only (`GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`). Override per request via `meta.retry` on `RequestOptions` or at client construction.

### 6.1 File & Export Conventions

- **Dot-suffix naming** - Every source file (except `index.ts` barrels and generated code) must use lowercase kebab case with at least one role suffix (e.g., `requests.facade.ts`, `retry.interceptor.ts`). Tests mirror the same convention (`*.test.ts`, `*.int.test.ts`, `*.types.test.ts`). ESLint’s custom `dot-filename/enforce-dot-suffix` rule blocks non-conforming names.
- **Support exports** - `src/support/index.ts` is the only public surface for cross-domain helpers. Other files live under `src/support/**` but remain internal. ESLint forbids deep imports so consumers can’t reach them directly.
- **Domain imports** - Modules interact with other domains exclusively through their `index.ts` barrel or explicitly whitelisted surfaces (`*.facade.ts`, `*.ports.ts`, `*.errors.ts`). This keeps each domain’s internal types private while maintaining discoverable entry points.
- **Generated assets** - Files under `src/generated/**` are maintained by scripts (`pnpm run prepare:spec`) and excluded from lint/name checks. Never hand-edit generated outputs.

### 6.4 Surface & Naming Conventions

- **Verb rubric** - Domain facades expose predictable verbs: `create`, `list`, `findOne`, `update`, and `delete`. Read operations that return derived data use explicit prefixes (`getPaymentRoutes`, `getPaymentCalldata`, `getConversionRoutes`). Mutations that fire-and-forget external behavior (e.g., sending intents) use imperative verbs such as `sendPaymentIntent`.
- **Argument ordering** - Method signatures accept path identifiers first (derived from URL segments such as `requestId` or `clientId`), followed by the primary payload/body object, and end with an optional `options` bag for query params or per-call overrides. Avoid boolean positional flags.
- **Identifier naming** - Mirror the REST path in parameter names (e.g., `/v2/request/{requestId}` -> `requestId: string`). Do not invent aliases unless upstream names are ambiguous. Prefer `payerId`/`clientId`/`paymentIntentId` as defined by the API.
- **Return shapes** - `list*` methods return arrays; `findOne*` methods return a single object or `null` when the API delivers 404/204. Derived helpers return typed objects without nesting (no `{ data: ... }` wrappers). When a response is a union, include a discriminant `kind` property with literal values (`'paymentIntent'`, `'calldata'`, etc.) so consumers can `switch` reliably.
- **Options naming** - Optional argument bags are suffixed with `Options` when exported types are shared (e.g., `GetPaymentRoutesOptions`). Keep the runtime parameter name `options` for consistency.

These rules keep the public surface predictable across domains and make it straightforward to lint for drift in future phases.

### 6.5 Subpath Export Map

The package publishes tree‑shakeable subpaths that line up with domain facades. Consumers should import from these paths instead of deep modules:

| Subpath | Purpose |
| --- | --- |
| `@marcohefti/request-network-api-client/requests` | Requests & invoices facade helpers |
| `@marcohefti/request-network-api-client/payouts` | Payout creation and execution helpers |
| `@marcohefti/request-network-api-client/payer` | Compliance and payer onboarding helpers |
| `@marcohefti/request-network-api-client/currencies` | Currency listing and conversion routes |
| `@marcohefti/request-network-api-client/client-ids` | Client ID lifecycle management |
| `@marcohefti/request-network-api-client/payments` | Payment search facade with pagination helpers |
| `@marcohefti/request-network-api-client/pay` | Legacy pay execution facade (mirrors `/v1/pay`) and exposes `.legacy` |
| `@marcohefti/request-network-api-client/v1/requests` | Legacy request endpoints and status helpers |
| `@marcohefti/request-network-api-client/v1/payer` | Legacy payer/compliance endpoints |
| `@marcohefti/request-network-api-client/v2/payer` | Explicit v2 payer barrel for tree-shaking |
| `@marcohefti/request-network-api-client/v1/currencies` | Legacy currency list and conversion routes |
| `@marcohefti/request-network-api-client/v1/pay` | Versioned legacy pay facade factory |

Each subpath re-exports its typed factory (`create<Domain>Api`) and related types. Additional domains must follow the same naming convention to keep imports ergonomic and avoid breaking tree-shaking.

## 7. Domain Modules & Endpoints

| Module | Endpoints | Notes |
| --- | --- | --- |
| `requests` | v2: `POST /v2/request`, `GET /v2/request/{id}`, `GET /v2/request/{id}/pay`, `GET /v2/request/{id}/routes`, `PATCH /v2/request/{id}`, `POST /v2/request/payment-intents/{paymentIntent}`. Legacy v1: `POST /v1/request`, `GET /v1/request/{paymentReference}`, `GET /v1/request/{paymentReference}/pay`, `GET /v1/request/{paymentReference}/routes`, `POST /v1/request/{paymentIntentId}/send`, `PATCH /v1/request/{paymentReference}/stop-recurrence` | Provides discriminated unions for payment calldata and request status across versions. Legacy helpers remain available via `client.requestsV1` or `client.requests`'s shared status mappers. |
| `payouts` | `POST /v2/payouts`, `POST /v2/payouts/batch`, `GET /v2/payouts/recurring/{id}`, `POST /v2/payouts/recurring/{id}`, `PATCH /v2/payouts/recurring/{id}` | Covers single, batch, and recurring payouts, returning typed transaction metadata. |
| `payer` | v2: `POST /v2/payer`, `GET /v2/payer/{clientUserId}`, `PATCH /v2/payer/{clientUserId}`, `POST /v2/payer/{clientUserId}/payment-details`, `GET /v2/payer/{clientUserId}/payment-details`. Legacy v1 equivalents under `/v1/payer` | Encapsulates compliance onboarding, status polling, and payment detail collection. Access legacy routes via `client.payer.legacy` or the `/v1/payer` barrel. |
| `clientIds` | `POST /v2/client-ids`, `PUT /v2/client-ids/{id}`, `DELETE /v2/client-ids/{id}` | Used for e-commerce client provisioning. Exposes typed responses. |
| `currencies` | v2: `GET /v2/currencies`, `GET /v2/currencies/{currencyId}/conversion-routes`. Legacy v1: `GET /v1/currencies`, `GET /v1/currencies/{currencyId}/conversion-routes` | Returns strongly typed token metadata and conversion routes. Legacy endpoints remain accessible via `client.currencies.legacy` or the `/v1/currencies` barrel. |
| `payments` | `GET /v2/payments` | Provides typed payment search with pagination, fee breakdowns, and request metadata. |
| `pay` | `POST /v1/pay` | Initiates the legacy pay-without-request flow. Exposed via `client.pay.payRequest` and the `/pay` or `/v1/pay` barrels. |

Each module:
- Accepts typed inputs validated via Zod (with `.parse` or `.safeParse`).
- Returns typed responses with camelCase property names, matching API schema.
- Throws `RequestApiError` on HTTP failure, including `status`, `code`, and `details`.

`requests.getPaymentCalldata` returns a discriminated union with `kind: 'calldata' | 'paymentIntent'` so callers can switch on execution strategy. Currency schemas now perform runtime validation against `CurrencyToken` shapes, overriding the generic `z.unknown()` emitted by the generator.

An OpenAPI parity guard (`tests/validation/openapi-parity.test.ts`) diff-checks operation IDs referenced in source files against the bundled spec. The allowlist is intentionally empty-adding new endpoints requires wiring a facade, tests, and documentation before the guard will pass.

## 8. Authentication & Configuration

- **Credentials** - `RequestClient` accepts `apiKey`, `clientId`, or both. Modules decide which headers to send per endpoint (currency routes may require both). Per-call overrides are supported via method options.
- **Base URL presets** - The client defaults to `https://api.request.network`. Helpers expose:
  - `RequestEnvironment.production`
  - `RequestEnvironment.local` (`http://127.0.0.1:8080`) for proxies or self-managed gateways
  - `RequestEnvironment.staging` (legacy placeholder for partner-managed sandboxes. Request no longer operates a public staging host)
  Consumers can supply custom URLs for regional deployments.
- **Environment variables** - Applications should explicitly pass environment variables to `createRequestClient()`:
  ```ts
  const client = createRequestClient({
    baseUrl: process.env.REQUEST_API_URL || RequestEnvironment.production,
    apiKey: process.env.REQUEST_API_KEY,
    clientId: process.env.REQUEST_CLIENT_ID,
  });
  ```
  Common variables:
  - `REQUEST_API_URL` - API base URL (optional, defaults to production)
  - `REQUEST_API_KEY` - Server-side API key
  - `REQUEST_CLIENT_ID` - Client ID for browser/frontend auth
  - `RequestEnvironment` presets remain available for hard-coded environments.
  - Note: `RequestEnvironment.local` (`http://127.0.0.1:8080`) is a placeholder for a locally running Request API. This repo does not start one. Tests do not use it.
- **Fees** - Fee inputs can be supplied via environment variables (e.g., `FEE_PERCENTAGE_FOR_PAYMENT`, `FEE_ADDRESS_FOR_PAYMENT`) and per-call options. A small helper may be added later to centralize fee policies. Until then, pass values explicitly.
- **Adapters** - Node adapter relies on built-in `fetch` (Node ≥20). Browser adapter assumes global `fetch`. Custom adapters (e.g., Axios, instrumented fetch) can be supplied by implementing the adapter interface and passing it to `RequestClient`.

See also - docs site: [Quick Start](/guide/quick-start)

### API Versioning

- **Default target** - All root exports and domain facades call the Request API v2 endpoints. Keep v2 as the pinned default until a successor is production-ready.
- **No global toggle** - Do not add an `apiVersion` flag to `createRequestClient`. Mixing versions at runtime leads to hard-to-debug behaviour. Instead, surface version-specific entrypoints.
- **Legacy barrels** - When backwards compatibility is required, publish explicit subpath barrels such as `@marcohefti/request-network-api-client/v1/requests`. The barrel re-exports the same facade factory wired to v1 paths. Default exports must remain v2-only so new integrations land on the latest API automatically.
- **Naming rule** - Method names stay version-agnostic (`client.requests.create`) and never include suffixes. Versioning is strictly a transport concern owned by the facade implementation.
- **Upgrade flow** - When Request releases v3+ endpoints, add a new barrel (`/v3/...`) and keep root exports pointing at the latest stable version. Document migration notes in the README and release notes. Bump the package major version if behaviour changes.
- **Spec alignment** - Ensure `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json` and generated types match the version each barrel targets. Regenerate and diff specs when adopting new versions.

## 9. Error Handling & Telemetry

- `RequestApiError` encapsulates status code, error code, details payload, and correlation IDs. Modules should throw this error (or domain-specific subclasses) so consumers receive consistent metadata.
- Interceptors emit structured logs (operationId, method, path, duration, attempt number). Provide a `logger` hook that defaults to `console` but encourages structured loggers. The `logLevel` option (`silent`, `error`, `info`, `debug`) gates which events are emitted.
- Retry/backoff defaults to three attempts on idempotent methods (GET/HEAD/OPTIONS/PUT/DELETE) with exponential backoff + full jitter. Configuration options include `maxAttempts`, `initialDelayMs`, `maxDelayMs`, `retryOn` (status codes), and `jitter`. Errors capture retry metadata for diagnostics, and per-request overrides live under `meta.retry`.
- Telemetry events include `request:start`, `request:response` (with `ok`/`status`), `request:retry` (delay + reason), `request:error`, and `rate-limit`. Document how to attach metrics/tracing before implementation.

## 10. Build & Distribution

- **Tooling:** `tsup` orchestrates dual outputs using `tsconfig.json`, producing:
  - `dist/esm/index.js` + `dist/esm/index.d.mts` (ESM + declarations)
  - `dist/cjs/index.js` (CommonJS)
- `package.json`:
  - `"main": "./dist/cjs/index.js"`
  - `"module": "./dist/esm/index.js"`
  - `"types": "./dist/esm/index.d.mts"`
  - `"exports"` map routing `import` to ESM and `require` to CJS (subpath exports follow the same pattern as modules are implemented).
  - `"files": ["dist"]`
  - `"sideEffects": false` to enable tree‐shaking.
- Use `changesets` for release management once public.

## 11. API Specification Workflow

- The authoritative contract comes from `https://api.request.network/open-api/openapi.json`. The spec is stored in the shared contracts package at `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json` with metadata (`request-network-openapi.meta.json`) noting fetch time and headers for traceability.
- Webhook coverage is currently community-maintained. We mirrored the webhook sections of the public docs into `@marcohefti/request-network-api-contracts/specs/webhooks/request-network-webhooks.json` so generators/tests have something to lean on while we wait for an official schema. The file only includes events with published identifiers and payload details today (`payment.confirmed`, `payment.failed`, `payment.processing`, `payment.partial`, `payment.refunded`, `payment_detail.updated`, `request.recurring`, `compliance.updated`) and models the documented signature header (`x-request-network-signature`). Leave comments in PRs when Request adds official coverage so we can replace this file rather than diverge.
- `pnpm run generate:types` (via `openapi-typescript`) materializes `src/generated/openapi-types.ts`. Developers must never edit this file manually. Rerun `pnpm run prepare:spec` to refresh it.
- `pnpm run generate:zod` generates Zod parsers keyed by `operationId` and registers them in the schema registry. Parsers are emitted per group (by tag/controller) to allow lazy registration from domain barrels. The root aggregator is also generated for debugging.
- When the upstream spec changes, review the diff in the raw JSON and generated types/schemas, then update domain mappers accordingly.

Outstanding webhook schema gaps (track in issue backlog until Request publishes an official spec):

- Confirm canonical event identifiers and payload envelopes for the narrative-only notifications (“Payment Partial”, “Payment Refunded”) so we can extend the JSON spec without guessing.
- Document any additional delivery headers (timestamps, replay protection) or retry semantics once the upstream docs expose them. They are currently absent from the public material.

### Webhook Module Design Notes

- `verifyWebhookSignature` consumes the **exact raw request body** (Buffer/Uint8Array/string) plus the `x-request-network-signature` header, recomputes an HMAC-SHA256 digest, and raises `RequestWebhookSignatureError` on failure. Optional timestamp tolerance and multi-secret rotation remain on the roadmap.
- `createWebhookMiddleware` sits on top of the verifier, short-circuiting invalid signatures with 401 responses, attaching typed payloads to `req.webhook`, and dispatching to registered handlers. The middleware respects a `skipVerification` callback and the global bypass toggle exposed by `webhooks.testing` (or the `REQUEST_WEBHOOK_DISABLE_VERIFICATION` environment variable).
- `WebhookDispatcher` fans out events to handlers registered via the typed helpers under `webhooks.events.*`. Registration order is preserved, and helper predicates (`isBouncedFailure`, `isProcessingTerminalStatus`, `isPaymentDetailApproved`, `isKycComplete`, etc.) narrow payloads for ergonomics.
- Testing utilities live under `webhooks.testing`: `generateTestWebhookSignature`, `createMockWebhookRequest/Response`, `withWebhookVerificationDisabled`, and setters for the bypass flag. Unit suites in `tests/webhooks/**` consume these helpers so downstream packages can mirror the pattern.
- A parity guard (`tests/webhooks/event-parity.test.ts`) keeps `WEBHOOK_EVENT_NAMES` aligned with `@marcohefti/request-network-api-contracts/specs/webhooks/request-network-webhooks.json`. Update the spec first when introducing new events.
- `examples/webhooks/local-listener.ts` spins up an Express server that wires the middleware and dispatcher together. Run it (plus Cloudflare Tunnel) with `pnpm webhook:dev:all`. The `tunnel:webhook` script shells out to `pnpm dlx cloudflared tunnel --url http://localhost:8787` by default, honours `REQUEST_WEBHOOK_TUNNEL_HOSTNAME`, and switches to `pnpm dlx cloudflared tunnel run <name>` when `REQUEST_WEBHOOK_TUNNEL_NAME` is present. `REQUEST_WEBHOOK_PUBLIC_URL` (optional) stores the public tunnel URL alongside `REQUEST_WEBHOOK_SECRET` for operator handoffs.
  - Detailed operator checklist lives in `docs/WEBHOOKS.md`.

## 12. Testing Strategy

- **Unit tests:** Use Vitest with MSW in node mode to intercept `fetch` and replay fixtures pulled from the public docs. Every client method must have success + error cases with assertions on both data and `RequestApiError` details.
- **Integration tests:** Provide an opt-in suite that hits the Request production host (`https://api.request.network`) and, where needed, crypto-to-fiat sandbox flows (Sepolia, mock KYC). Tests only run when the shared env variables (`REQUEST_API_KEY`, `REQUEST_PAYMENT_NETWORK`, `REQUEST_PAYEE_WALLET`, `REQUEST_PAYER_WALLET`, etc.) are present. Otherwise they skip. Examples include creating requests, fetching payment routes, exercising payout endpoints, and verifying crypto-to-fiat flows. Call out in docs that contributors can point the client at proxies or partner sandboxes by setting `REQUEST_API_URL`.
- **Type tests:** Add `expectTypeOf`/`tsd` style assertions to ensure generated OpenAPI types and public exports stay stable. Compile these in CI using `tsc --noEmit`.
- **Webhook utilities:** `webhooks.testing` provides signature helpers, request/response mocks, and verification bypass toggles for unit suites.
- **Coverage:** Target ≥80 % line/function coverage using Vitest’s V8 coverage provider. Fail CI below the threshold once real code lands.
- **CI matrix:** Run lint/typecheck/unit tests on Node 20/22/24 so we cover the minimum supported runtime plus active/current releases. Integration tests run in a separate workflow guarded by sandbox secrets.
- **Base URL toggles:** Testing docs must highlight the `baseUrl` option on the client so developers can switch between production (`https://api.request.network`) or local/proxy environments (`http://127.0.0.1:8080`, custom gateways) without code changes.
  - Tests use MSW (Mock Service Worker) to intercept `fetch` and stub endpoints. A shared constant `TEST_BASE_URL` (http://localhost) anchors handlers and HTTP clients. No real server is required.

Related domain guides - docs site: [Currencies](/guide/domains/currencies), [Client IDs](/guide/domains/client-ids)

## 13. Documentation & Examples

- README: Quick start, auth examples, module usage snippets.
- `docs/endpoints.md`: Map client methods to REST endpoints with sample requests/responses.
- Example directory (future): minimal Node script + browser snippet demonstrating typical flows.
- `docs/TESTING.md`: Operational guide for unit, integration, and type tests (MSW setup, sandbox env vars, base URL overrides).

See also: [QUICK-START.md](./QUICK-START.md), [BEFORE-AFTER.md](./BEFORE-AFTER.md)

## 14. Release Workflow (Future)

- Use `changesets` to gather release notes.
- Automated publish via GitHub Actions once packages are public-ready.
- Semantic versioning: follow Request API compatibility and increment major on breaking API changes.
- Maintain the public release checklist in [`docs/PUBLISHING.md`](./PUBLISHING.md) and update it as launch requirements evolve.

## 15. Future Enhancements

- Rate limit telemetry (surfacing headers or events for observability).
- Retry policy customization (pluggable strategies).
- Optional caching layer for currency routes.
- React hooks and UI components can be built on top of this library by reusing shared modules.
- Extend webhook coverage once Request publishes the remaining event identifiers (partial/refunded lifecycle, additional headers) and update the spec/fixtures accordingly.

---

This architecture serves as the baseline for implementing the client. Update the document as decisions are finalized or architectural changes occur.
