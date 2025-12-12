# Request Network API Client (TypeScript)

TypeScript client for the Request Network hosted REST API. Provides typed, ergonomic helpers for requests, payouts, payer/compliance, client IDs, currencies, and payments, with runtime validation and webhook utilities built in.

**Note**: This targets the hosted REST API, not the protocol SDK. See [SCOPE.md](docs/SCOPE.md) for when to use which.

## Installation

```bash
npm install @marcohefti/request-network-api-client
# or
pnpm add @marcohefti/request-network-api-client
# or
yarn add @marcohefti/request-network-api-client
```

## Features

- **Typed API**: Full TypeScript support with types generated from OpenAPI spec
- **Runtime Validation**: Zod schemas validate requests/responses (configurable)
- **Webhook Helpers**: Signature verification, middleware, and event dispatchers
- **Error Handling**: Consistent error model with retry/backoff
- **Tree-Shakable**: Subpath exports for minimal bundle size
- **Universal**: Works in Node 20+, browsers, and edge runtimes

## Quick Start

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

// Create a request
const request = await client.requests.create({
  amount: '12.5',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});

// List currencies
const tokens = await client.currencies.list({ network: 'sepolia' });

// Error handling
try {
  await client.payments.search({ walletAddress: '0xabc' });
} catch (err) {
  if (isRequestApiError(err)) {
    console.error('API error', err.status, err.code, err.requestId);
  }
}
```

## Documentation

- **[Quick Start](docs/QUICK-START.md)** - Installation, environment setup, common recipes
- **[Domains](docs/DOMAINS.md)** - API reference for all domains (requests, payouts, payer, payments, currencies, client IDs)
- **[HTTP & Errors](docs/HTTP-AND-ERRORS.md)** - HTTP client configuration, error handling, retry behavior
- **[Webhooks](docs/WEBHOOKS.md)** - Signature verification, middleware, event handlers, local dev setup
- **[Scope](docs/SCOPE.md)** - When to use this client vs the protocol SDK
- **[Architecture](docs/ARCHITECTURE.md)** - System design and internals
- **[Testing](docs/TESTING.md)** - Test strategy, commands, and coverage
- **[Publishing](docs/PUBLISHING.md)** - Release checklist
- **[Endpoints](docs/ENDPOINTS.md)** - API endpoint reference

## Compatibility

| Runtime | Versions |
|---------|----------|
| Node.js | 20.x, 22.x, 24.x |
| Browsers | Modern browsers with Fetch API |
| Edge Runtimes | Cloudflare Workers, Vercel Edge, Deno, Bun |

**Package Manager**: pnpm 10.17.1 recommended (`corepack enable pnpm@10.17.1`)

## Versioning

This package follows SemVer. While on `0.x`, minor/patch releases may include breaking changes as the API surface stabilizes. Once `1.0.0` is reached, breaking changes will require a major version bump.

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Troubleshooting

**API Key Issues**
- Ensure `REQUEST_API_KEY` is set and has necessary permissions
- Test with a simple call: `await client.currencies.list({ network: 'sepolia' })`

**Runtime Validation Errors**
- The API response didn't match the expected schema
- Check you're using the latest client version
- Temporarily disable validation to debug: `runtimeValidation: false`

**Timeout Issues**
- Set custom timeout: `await client.currencies.list({ network: 'sepolia' }, { timeoutMs: 10_000 })`

**Rate Limiting (429)**
- The client auto-retries with exponential backoff
- Override retry policy: `meta: { retry: { maxAttempts: 5 } }`

See [HTTP-AND-ERRORS.md](docs/HTTP-AND-ERRORS.md) for detailed error handling patterns.

## Support & Security

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/marcohefti/request-network-api-client-ts/issues)
- **Security**: See [SECURITY.md](SECURITY.md) for disclosure policy
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## Development

**Prerequisites**: Node 20/22/24, pnpm 10.17.1

```bash
# Install dependencies
pnpm install

# Type-check
pnpm typecheck

# Lint
pnpm lint

# Run tests
pnpm test

# Build
pnpm build
```

**Full validation** (before submitting PRs):

```bash
pnpm coverage:matrix  # Node 20/22/24 coverage matrix
pnpm build            # Verify packaging
```

See [TESTING.md](docs/TESTING.md) for test strategy and [CONTRIBUTING.md](CONTRIBUTING.md) for coding guidelines.

## License

MIT - See [LICENSE](LICENSE) for details.
