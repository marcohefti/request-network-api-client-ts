# Quick Start

Get started with the Request Network API client in under 5 minutes.

## Installation

Install via npm, pnpm, or yarn:

```bash
# npm
npm install @marcohefti/request-network-api-client

# pnpm
pnpm add @marcohefti/request-network-api-client

# yarn
yarn add @marcohefti/request-network-api-client
```

## Prerequisites

- Node.js 20.x, 22.x, or 24.x (the client uses the built-in `fetch`)
- A Request Network API key (for server-side) or Client ID (for browser/frontend)

## Basic Usage

### Node (API key)

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

### Environment-based Configuration

```ts
import { createRequestClientFromEnv } from '@marcohefti/request-network-api-client';

const client = createRequestClientFromEnv();
// Reads REQUEST_API_URL, REQUEST_API_KEY, REQUEST_CLIENT_ID
// Falls back to legacy REQUEST_SDK_* variables for backwards compatibility
```

Required environment variables:

```dotenv
REQUEST_API_KEY=your-api-key
REQUEST_CLIENT_ID=your-client-id  # optional, for frontend auth
REQUEST_API_URL=https://api.request.network  # optional, defaults to production
```

## Runtime Validation

Runtime validation is enabled by default. To relax checks globally:

```ts
const client = createRequestClient({
  baseUrl: RequestEnvironment.production,
  apiKey: process.env.REQUEST_API_KEY!,
  runtimeValidation: { errors: false },
});
```

Disable validation per call for hot paths that trust upstream data:

```ts
await client.http.get('/v2/currencies', {
  meta: { validation: false },
});
```

## Common Recipes

### Backend Factory (Server-Side)

```ts
import {
  createRequestClient,
  RequestEnvironment,
  type RequestClient,
} from '@marcohefti/request-network-api-client';

type RequestClientFactoryOptions = {
  clientId?: string;
};

export function createRequestApiClient(
  apiKey: string,
  options: RequestClientFactoryOptions = {},
): RequestClient {
  if (!apiKey) {
    throw new Error('REQUEST_API_KEY is required to create the Request client');
  }

  const logger = (event: string, meta?: Record<string, unknown>) => {
    // Replace with your logging framework
    console.debug('[request-api]', event, meta);
  };

  return createRequestClient({
    baseUrl: RequestEnvironment.production,
    apiKey,
    clientId: options.clientId,
    runtimeValidation: true,
    logLevel: 'info',
    logger,
    userAgent: 'my-service/1.0.0',
  });
}
```

### Subpath Imports

Tree-shake individual domains by importing from subpaths:

```ts
import { createRequestClient } from '@marcohefti/request-network-api-client';
import { createClientIdsApi } from '@marcohefti/request-network-api-client/client-ids';

const client = createRequestClient({ apiKey: process.env.REQUEST_API_KEY! });
const clientIds = createClientIdsApi(client.http);
const all = await clientIds.list();
```

Root exports (`@marcohefti/request-network-api-client`) point at REST v2 endpoints. Use versioned barrels like `@marcohefti/request-network-api-client/v1/requests` only when you deliberately need legacy behavior.

### Creating a Request

```ts
const request = await client.requests.create({
  amount: '12.5',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});
console.log('Request ID:', request.requestId);
```

### Searching Payments

```ts
const results = await client.payments.search({ paymentReference: '0xabc' });
console.log('Total payments:', results.pagination.total);
```

### Legacy Pay Flow

```ts
await client.pay.payRequest({
  payee: '0xmerchant',
  amount: '42',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});
```

## Next Steps

- **Domains**: See [DOMAINS.md](./DOMAINS.md) for detailed API reference for requests, payouts, payer, payments, currencies, and client IDs.
- **HTTP & Errors**: See [HTTP-AND-ERRORS.md](./HTTP-AND-ERRORS.md) for HTTP client configuration, error handling, and retry behavior.
- **Webhooks**: See [WEBHOOKS.md](./WEBHOOKS.md) for signature verification, middleware, and event handlers.
- **When to Use**: See [SCOPE.md](./SCOPE.md) for decision rules on when to use this client vs the protocol SDK.
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design and internal structure.
- **Testing**: See [TESTING.md](./TESTING.md) for test strategy and commands.

## Troubleshooting

### API Key Not Working

Ensure your `REQUEST_API_KEY` is set correctly and has the necessary permissions. Test with a simple currencies list call:

```ts
const tokens = await client.currencies.list({ network: 'sepolia' });
```

### Runtime Validation Errors

If you see `ValidationError`, the API response didn't match the expected schema. Check if you're using the latest version of the client and that the API hasn't changed.

Disable validation temporarily to debug:

```ts
const client = createRequestClient({
  apiKey: process.env.REQUEST_API_KEY!,
  runtimeValidation: false,
});
```

### Timeout Issues

Set a custom timeout per request:

```ts
await client.currencies.list(
  { network: 'sepolia' },
  { timeoutMs: 10_000 }
);
```

### Rate Limiting (429)

The client automatically retries with exponential backoff. To override:

```ts
await client.payments.search(
  { walletAddress: '0xabc' },
  { meta: { retry: { maxAttempts: 5 } } }
);
```

## Support

- Report bugs or request features via [GitHub issues](https://github.com/marcohefti/request-network-api-client-ts/issues)
- See [SECURITY.md](../SECURITY.md) for security disclosures
