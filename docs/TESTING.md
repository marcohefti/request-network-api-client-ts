# @request-suite/request-api-client - Testing Guide

The Vitest + MSW suites back every facade and enforce OpenAPI parity so future contributors can extend the client without guessing. Tests run in Node 20.x-24.x (matching the runtime support window).

## Test Suite Structure

| Suite | Tooling | Purpose |
| --- | --- | --- |
| Unit | Vitest + MSW (node) | Exercise every client method with mocked Request API responses (success + error). |
| Integration | Vitest (separate command) | Hit the Request Network API with real credentials (production host by default) and exercise crypto-to-fiat sandbox flows. Skips automatically when env vars are missing. |
| Type contracts | `tsc --noEmit` + `expectTypeOf`/`tsd` helpers | Ensure generated OpenAPI typings and exported module surfaces stay stable. |

## Commands

| Command | Status | Description |
| --- | --- | --- |
| `pnpm --filter "./packages/request-api-client" test` | Available | Runs unit tests. Uses MSW handlers stored alongside fixtures under `tests/msw`. |
| `pnpm --filter "./packages/request-api-client" typecheck` | Available | Runs `tsc --project tsconfig.build.json --noEmit` *and* `tsconfig.vitest.json` so source + test files stay in sync. |
| `pnpm --filter "./packages/request-api-client" test:live` | Available | Executes the live integration suite under `tests/integration/live/**`. MSW is disabled so requests hit the real API. Point the env values at Sepolia or mainnet depending on what you want to validate. |
| `pnpm --filter "./packages/request-api-client" coverage` | Available | Runs Vitest with `--coverage` and enforces thresholds (≥80 %). |
| `pnpm --filter "./packages/request-api-client" build` | Available | Bundles CJS/ESM/d.ts outputs via tsup. Mirrors the CI packaging stage. |
| `pnpm --filter "./packages/request-api-client" test:watch` | Available | Starts Vitest in watch mode (unit + integration when env vars are present). |
| `pnpm --filter "./packages/request-api-client" test:unit` | Planned | Wrapper around `vitest run` that skips integration suites. |
| `pnpm --filter "./packages/request-api-client" test:types` | Planned | Additional structural typing assertions layered on top of `pnpm typecheck`. |

When new scripts are introduced, update `package.json`, `docs/TESTING.md`, and the root `AGENTS.md` so automation stays consistent.

### Webhook suites & utilities

- Unit tests for the webhook module live under `tests/webhooks/*.test.ts`, covering signature verification, middleware behaviour, dispatcher routing, event predicates, and schema parity (`tests/webhooks/event-parity.test.ts`).
- Import helpers from `webhooks.testing` inside tests (and downstream packages) instead of reimplementing HMAC logic:
  - `generateTestWebhookSignature(payload, secret?)`
  - `createMockWebhookRequest({ payload, secret?, headerName?, headers? })`
  - `createMockWebhookResponse()`
  - `withWebhookVerificationDisabled(fn)` / `setWebhookVerificationBypass(true)` for opt-out flows (also enabled by `REQUEST_WEBHOOK_DISABLE_VERIFICATION=true`).
- Run only the webhook-focused suites during local development with:

  ```sh
  pnpm --filter "./packages/request-api-client" test -- --run tests/webhooks/*.test.ts
  ```

- Fixtures live in `@request-suite/request-client-contracts/fixtures/webhooks/**` and mirror the payloads defined in `@request-suite/request-client-contracts/specs/webhooks/request-network-webhooks.json`. Update the shared contracts package first when new events or fields land, then refresh client helpers as needed.

## Environment Variables

Integration suites read from a single env file. Copy `env/request-api-client.integration.env.example` to `env/request-api-client.local.env` (gitignored) and populate the values before running `pnpm --filter "./packages/request-api-client" test:live`.

**Required**

- `REQUEST_API_KEY` - API key from the Request API Portal. The same key can exercise testnets and mainnet flows.
- `REQUEST_PAYEE_WALLET` - Wallet address that receives payouts/requests.
- `REQUEST_PAYER_WALLET` - Wallet address used when creating payment routes/calldata.
- `REQUEST_PAYMENT_NETWORK` - Payment network slug (e.g. `erc20-sepolia`, `erc20-mainnet`).
- `REQUEST_PAYMENT_CURRENCY` - Payment currency slug (`<symbol>-<network>`, e.g. `ETH-sepolia-sepolia`).

**Optional**

- `REQUEST_CLIENT_ID` - Front-end credential for client-id authenticated flows.
- `REQUEST_CLIENT_USER_ID` - Identifier created via `POST /v2/payer`. Reserved for future crypto-to-fiat coverage (ignored by the current wallet-to-wallet live suite).
- `REQUEST_PAYMENT_DETAILS_ID` - Payer payment details identifier for off-ramp flows. Ignored unless off-ramp coverage is explicitly re-enabled.
- `REQUEST_PAYOUT_PAYEE_WALLET` - Wallet to receive payouts for off-ramp payout flows. Ignored by default.
- `REQUEST_API_URL` - Optional override for proxies or partner-managed gateways. Defaults to `https://api.request.network`.
- `REQUEST_WEBHOOK_SECRET` - Webhook signing secret for signature verification tests.
- `REQUEST_WEBHOOK_PUBLIC_URL` - (Optional) Public webhook URL issued by Cloudflare Tunnel. Helps operators keep portal + local configuration in sync.
- `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` - (Optional) Hostname to request when starting the Cloudflare tunnel. Requires `cloudflared login`.
- `REQUEST_WEBHOOK_TUNNEL_NAME` - (Optional) Name of a pre-created Cloudflare tunnel for persistent hostnames. When set, the tooling runs `cloudflared tunnel run <name>` instead of the quick tunnel flow.

When any required variable is absent, the suite is skipped automatically so local contributors can run unit tests without credentials. Choose wallet/network combinations that match the scenario you want to validate (e.g., Sepolia for dry runs, mainnet for smoke tests) and update the env file before executing the relevant suite. Off-ramp helpers stay dormant until we opt in explicitly, so populating `REQUEST_CLIENT_USER_ID` or payout env vars simply results in a notice that those flows were skipped.

The default live scenario now performs a pure wallet-to-wallet flow (create request -> inspect status/routes -> pull calldata -> search payments). Off-ramp provisioning helpers remain available in code but are disabled. Even if `REQUEST_CLIENT_USER_ID` or payout env vars are populated, the suite logs that off-ramp flows are skipped. Re-enable them only after upstream crypto-to-fiat endpoints stabilise.

> If you see `401 Unauthorized`, double-check the key value and confirm the workspace has the required capabilities (for example, crypto-to-fiat permissions).

### Webhook Recurrence Suite

Use the webhook-focused integration suite when you need to validate recurring request lifecycles end-to-end:

```sh
pnpm --filter "./packages/request-api-client" test -- --run tests/integration/live/webhooks-recurring.test.ts
```

**Extra env requirements**

- `REQUEST_WEBHOOK_SECRET` – Signing secret copied from the Request portal.
- `REQUEST_WEBHOOK_PUBLIC_URL` – Public listener URL registered in the portal (named tunnels should point their CNAME here).
- `REQUEST_WEBHOOK_TUNNEL_NAME` / `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` – Optional but recommended. When present the suite spawns `pnpm run tunnel:webhook` so Cloudflare routes traffic to the in-process harness. Set `REQUEST_WEBHOOK_TUNNEL_AUTO=0` to skip auto-spawn if you manage the tunnel yourself.

**What happens during the run**

1. A lightweight Express app wires `createWebhookMiddleware`, records verified deliveries in memory, and serves `/healthz` for readiness checks.
2. The Cloudflare tunnel script runs against the harness port so the existing portal registration reaches the test listener.
3. The client creates a recurring request (daily cadence) and waits for the first `request.recurring` webhook to arrive.
4. The legacy `stopRecurrence` endpoint is invoked and the suite polls `GET /v2/request/{id}` until `isRecurrenceStopped` becomes `true`, demonstrating the recurrence pause.

If any prerequisite env var is missing the spec self-skips. Because the scheduler is asynchronous, budget several minutes for the first webhook delivery.

### Live Webhook Setup (Cloudflare Tunnel)

> Quick reference - the full walkthrough lives in [`docs/WEBHOOKS.md`](./WEBHOOKS.md).

Follow these steps whenever you need a real webhook secret or want to replay live deliveries locally:

1. **Install Cloudflare Tunnel.**  
   - macOS: `brew install cloudflared`  
   - npm: `pnpm dlx cloudflared --help` (prints install instructions)  
   See [Cloudflare’s docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/) for additional platforms.
2. **Start the listener + tunnel together** (stop with `Ctrl+C` when you are finished):  
   ```sh
   pnpm --filter "./packages/request-api-client" webhook:dev:all
   ```  
   The listener binds to `http://localhost:8787/webhook` and the tunnel shells out to `pnpm dlx cloudflared tunnel --url http://localhost:8787`. Both processes stream logs and exit together.
   - Run the pieces separately with `pnpm --filter "./packages/request-api-client" dev:webhook` and `pnpm --filter "./packages/request-api-client" tunnel:webhook` when you need to restart one side.
   - Set `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` to request a specific hostname (requires `cloudflared login`). Provide `REQUEST_WEBHOOK_TUNNEL_NAME` to run an existing named tunnel via `cloudflared tunnel run <name>` for a persistent URL.
   - Missing `REQUEST_WEBHOOK_SECRET`? The listener automatically enters verification-bypass mode with a placeholder secret so you can create the webhook. Update the env and restart once you copy the real secret from the portal.
   - The scripts load `env/request-api-client.local.env` automatically. No manual `export` step is required.
3. **Grab the public URL from the tunnel logs** (for example, `https://purple-bird.trycloudflare.com`). Copy the value (including the `/webhook` suffix) and, if you want to track it in your env file, set `REQUEST_WEBHOOK_PUBLIC_URL`.
   - To keep a stable hostname, authenticate with `cloudflared login`, create a named tunnel, and map it to a CNAME you control. Cloudflare still routes traffic through the same edge network while giving you a predictable URL.
4. **Register the webhook:** open the Request API Portal -> Webhooks, create a webhook pointing at the Cloudflare URL, and copy the generated secret into `REQUEST_WEBHOOK_SECRET`. Restart the local listener so it re-reads the env file.
5. **Verify deliveries:** trigger events (e.g., pay a Sepolia request). The listener logs each delivery plus any registered dispatcher handlers. Use the same secret for automated tests or downstream services.

## Test Placement & Shared Utilities

- **Co-locate specs**: Place test files next to the code they cover (e.g., `src/modules/requests/requests.facade.test.ts`). Match the dot-suffix naming pattern (`*.test.ts`, `*.int.test.ts`, `*.types.test.ts`).
- **Shared resources**: Reserve the top-level `tests/` directory for reusable assets only:
  - `tests/fixtures/<domain>/<scenario>.json` - canonical payloads sourced from docs/OpenAPI.
  - `tests/msw/handlers.server.ts` - shared MSW server setup.
- `tests/utils/env.utils.ts` - helpers for gating the live integration suite.
  - `tests/types/` - type assertion suites (`*.types.test.ts`), compiled with `tsc --noEmit`.
- **Regeneration**: When the OpenAPI spec changes, refresh fixtures and MSW handlers to mirror updated payloads.

### Using the Schema Registry

- Prefer `parseWithRegistry({ key: { operationId, kind: 'response', status }, value })` in domain facades so parsers line up with OpenAPI operation IDs.
- Until a generator emits concrete Zod schemas, you may register placeholder schemas in `<domain>.schemas.ts` and import them into the facade. Replace with generated schemas once available.

## Mandatory Scenarios

- **Success + failure** - For every public facade, author tests that assert the happy path and each significant failure class: 400-series validation errors, 401/403 auth failures, 404 lookups, and 429/5xx retry scenarios. Verify the returned `RequestApiError` contains status, code, details, and correlation metadata.
- **Retry policy** - When the retry interceptor lands, add explicit coverage for `Retry-After` handling, max-attempt cut-offs, and jitter configuration. Include per‑attempt retry logging assertions (a `request:retry` event for each attempt with `attempt`, `delayMs`, and `reason`).
- **Type assertions** - When adding new inputs/outputs, update the corresponding `tests/types/*.types.test.ts` suites so TypeScript enforces the contract.
- **Spec parity** - `tests/validation/openapi-parity.test.ts` compares operation IDs in source code against the OpenAPI spec. The allowlist is empty. New endpoints must ship with facades/tests so the parity guard stays green.

## Integration Suite Gating Helpers

- `tests/utils/env.utils.ts` exposes `ensureLiveSuite` (plus the shared `ensureSuite`). Each helper prints a warning listing missing env vars, registers a skipped `describe`, and returns `undefined` so the spec can short-circuit early.
- Live specs follow this pattern:
  ```ts
  const suiteEnv = ensureLiveSuite();

  if (!suiteEnv) {
    // Suite skipped.
  } else {
    const client = createClientFromEnv(suiteEnv);
    // …tests…
  }
  ```
- The helpers accept overrides (e.g., `requireClientId: true`) when a flow demands a client ID. Logging happens exactly once per suite, keeping CI noise low while giving contributors clear setup guidance.

## Webhook Helpers

A tiny helper module will generate mock webhook payloads and signatures for tests. Unit tests for this helper ensure downstream consumers can faithfully reproduce webhook verification logic.

## Coverage Targets

Vitest’s V8 coverage reporter enforces ≥80 % line/function thresholds (branches target 70 %). Coverage runs on every pull request and fails when thresholds are not met.

## CI Expectations

| Check | Details |
| --- | --- |
| Lint | CI runs `pnpm --filter "./packages/request-api-client" lint` on Node 20/22/24. |
| Typecheck | `pnpm --filter "./packages/request-api-client" typecheck` executes on the same Node matrix. |
| Unit tests + coverage | `pnpm --filter "./packages/request-api-client" test` enforces coverage thresholds on Node 20/22/24. |
| Packaging guard | Node 20 job builds, then runs `pnpm --filter "./packages/request-api-client" pack --pack-destination tmp/pack --json`. |
| OpenAPI regen | Guard job runs `pnpm --filter "./packages/request-api-client" generate:types` + `generate:zod` and fails on `git diff --exit-code`. |
| Integration tests | Separate workflow triggered manually or on release branches. Uses the sandbox env vars above. |

## Reason Step Checklist

Before writing tests or implementation, capture answers (in PR description or task log):

1. Change type (new feature, bug fix, refactor)?
2. Which layers move (HTTP pipeline, module facade, shared helpers)?
3. Which suites must be updated (unit, integration, types, webhook helper)?
4. Does the OpenAPI contract change (regenerate spec/types)?
5. Any new fixtures or MSW handlers required?

## Manual Smoke (Optional)

Once the client exposes its first feature slice, maintain a minimal smoke script (`examples/smoke.mjs`) that:

1. Builds the package (`pnpm --filter "./packages/request-api-client" build`).
2. Imports the built bundle from `dist/` using Node 20 (rerun with Node 24 when testing new runtime features).
3. Instantiates a `RequestClient` with sandbox credentials and performs a simple request (e.g., list currencies).

Record smoke run results in task logs when touching critical flows or before publishing prereleases.

Update this document whenever new suites or tooling are introduced. EOF
