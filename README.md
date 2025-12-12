# Request Network API Client (TypeScript)

[![npm version](https://img.shields.io/npm/v/@marcohefti/request-network-api-client.svg)](https://www.npmjs.com/package/@marcohefti/request-network-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/marcohefti/request-network-api-client-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/marcohefti/request-network-api-client-ts/actions/workflows/ci.yml)

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

### Common Issues

#### API Key Problems

**Error: 401 Unauthorized**
- Ensure `REQUEST_API_KEY` is set correctly in your environment
- Verify your API key is active in the Request API Portal
- Test with a simple call: `await client.currencies.list({ network: 'sepolia' })`
- Check for extra whitespace or quotes in your environment variable

```bash
# Verify your API key is set
echo $REQUEST_API_KEY

# Test with a simple command
node -e "import('@marcohefti/request-network-api-client').then(m => m.createRequestClient({apiKey: process.env.REQUEST_API_KEY}).currencies.list()).then(console.log)"
```

#### CORS Errors (Browser)

**Error: CORS policy blocks request**
- Ensure you're using a Client ID, not an API key (API keys are server-only)
- Verify your domain is in the `allowedDomains` list for your Client ID
- Check the domain matches exactly (including protocol and port)
- For localhost development, use `http://localhost:3000` format

```typescript
// ❌ Wrong - Using API key in browser
const client = createRequestClient({
  apiKey: 'rk_live_...'  // This will fail with CORS
});

// ✅ Correct - Using Client ID in browser
const client = createRequestClient({
  clientId: 'client_live_...'
});
```

#### Module Not Found Errors

**Error: Cannot find module '@marcohefti/request-network-api-client'**
- Run `pnpm install` or `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check package.json includes the dependency
- For local development, run `pnpm build` in the package directory

**Error: Cannot find module '@marcohefti/request-network-api-client/requests'**
- Ensure you're using the correct import path
- Check package.json `exports` field matches your import
- Update to the latest version: `pnpm update @marcohefti/request-network-api-client`

#### Type Errors

**Error: Property does not exist on type**
- Ensure you're using the latest version of the client
- Run `pnpm update @marcohefti/request-network-api-client`
- Check your TypeScript version is >= 5.0
- Clear TypeScript cache: `rm -rf node_modules/.cache`

#### Runtime Validation Errors

**Error: ValidationError - Response validation failed**
- The API response didn't match the expected schema
- This usually means the API has changed or there's a bug
- Update to the latest client version: `pnpm update @marcohefti/request-network-api-client`
- Temporarily disable validation to debug: `runtimeValidation: false`
- Report the issue with the full error message

```typescript
// Debug validation errors
const client = createRequestClient({
  apiKey: process.env.REQUEST_API_KEY,
  runtimeValidation: false,  // Temporarily disable
});
```

#### Timeout Issues

**Error: Request timeout / AbortError**
- Increase timeout for slow operations: `{ timeoutMs: 30_000 }`
- Check your network connection
- Verify the API is accessible: `curl https://api.request.network/v2/currencies`
- Try with a different network/endpoint

```typescript
// Increase timeout for slow endpoints
await client.requests.create(
  { /* ... */ },
  { timeoutMs: 30_000 }  // 30 seconds
);
```

#### Rate Limiting (429)

**Error: Rate limit exceeded**
- The client auto-retries with exponential backoff
- Check `err.retryAfterMs` for when to retry
- Reduce request frequency in your application
- Consider caching responses for repeated queries

```typescript
try {
  await client.currencies.list();
} catch (err) {
  if (isRequestApiError(err) && err.status === 429) {
    console.log(`Rate limited. Retry after ${err.retryAfterMs}ms`);
    // Client will automatically retry
  }
}
```

#### Network/Connection Errors

**Error: fetch failed / ECONNREFUSED**
- Check your internet connection
- Verify API endpoint is accessible
- Check for proxy/firewall blocking requests
- Try setting a custom base URL: `baseUrl: 'https://api.request.network'`

### Getting Help

If you're still stuck:

1. Check the [examples](examples/) directory for working code
2. Review [HTTP-AND-ERRORS.md](docs/HTTP-AND-ERRORS.md) for detailed error handling
3. Search [existing issues](https://github.com/marcohefti/request-network-api-client-ts/issues)
4. Create a new issue with:
   - Client version (`@marcohefti/request-network-api-client@x.x.x`)
   - Node.js version (`node --version`)
   - Minimal code sample that reproduces the issue
   - Full error message and stack trace
   - Request ID from error (if available)

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
