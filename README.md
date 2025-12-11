# Request Network API Client (TypeScript)

TypeScript client for the Request Network hosted REST API. It provides typed, ergonomic
helpers for core API domains such as requests, payouts, payer/compliance, client IDs,
currencies, and payments, with runtime validation and webhook utilities built in.

This package targets the hosted REST API, not the protocol SDK.

## Installation

Install via npm or pnpm:

```bash
# npm
npm install @marcohefti/request-network-api-client

# pnpm
pnpm add @marcohefti/request-network-api-client
```

## Quick start

Node (API key) – tested on Node 20.x–24.x with the built‑in `fetch`:

```ts
import {
  createRequestClient,
  RequestEnvironment,
  isRequestApiError,
} from '@marcohefti/request-network-api-client';

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

From env:

```ts
import { createRequestClientFromEnv } from '@marcohefti/request-network-api-client';

const client = createRequestClientFromEnv();
// Reads REQUEST_API_URL, REQUEST_API_KEY, REQUEST_CLIENT_ID (with legacy REQUEST_SDK_* fallbacks)
```

## What this client covers

- REST v2 domains: requests, payouts, payer/compliance, payments, client IDs, currencies.
- Legacy v1 routes where needed (via `client.<domain>.legacy` or versioned barrels).
- Webhook helpers: signature verification, parser, dispatcher, and testing utilities.
- Runtime validation via Zod schemas generated from the Request OpenAPI spec.

For deeper details (HTTP client options, domain facades, webhooks, error model), see:

- Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Endpoints & behaviour notes: [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md)
- Testing & live suites: [`docs/TESTING.md`](docs/TESTING.md)
- Publishing checklist: [`docs/PUBLISHING.md`](docs/PUBLISHING.md)
- Docs site (VitePress): `docs-site/` (see `pnpm docs:dev` and `pnpm docs:build`)

## Compatibility

- Node.js: 20 / 22 / 24
- Package manager: pnpm 10.17.1 (recommended via `corepack enable pnpm@10.17.1`)

## Development

Common commands:

- `pnpm lint` – lint the source and tests.
- `pnpm typecheck` – run TypeScript diagnostics (`tsc`).
- `pnpm test` – run the Vitest suite (MSW + OpenAPI parity guards).
- `pnpm build` – build CJS/ESM + types into `dist/`.

See [`docs/TESTING.md`](docs/TESTING.md) for the full test/coverage matrix and live integration setup, and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the HTTP pipeline and domain layout.

