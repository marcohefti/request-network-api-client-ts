# Quick Start

## Node (API key)

> Supported runtimes: Node 20.x through 24.x (the client relies on the built-in `fetch`).

```ts
import { createRequestClient, RequestEnvironment, isRequestApiError } from '@request-suite/request-api-client';

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

Runtime validation is enabled automatically. To relax checks globally:

```ts
const client = createRequestClient({
  baseUrl: RequestEnvironment.production,
  apiKey: process.env.REQUEST_API_KEY!,
  runtimeValidation: { errors: false },
});
```

Or disable per-call validation via `client.http.get(path, { meta: { validation: false } })` when hot paths already trust upstream data.

## From env

```ts
import { createRequestClientFromEnv } from '@request-suite/request-api-client';

const client = createRequestClientFromEnv();
// Looks for REQUEST_API_URL / REQUEST_API_KEY / REQUEST_CLIENT_ID first,
// then falls back to the legacy REQUEST_SDK_* variables for backwards compatibility.
```

## Backend factory (server-side)

```ts
import {
  createRequestClient,
  RequestEnvironment,
  type RequestClient,
} from '@request-suite/request-api-client';

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

## Subpath imports

```ts
import { createRequestClient } from '@request-suite/request-api-client';
import { createClientIdsApi } from '@request-suite/request-api-client/client-ids';

const client = createRequestClient({ apiKey: process.env.REQUEST_API_KEY! });
const clientIds = createClientIdsApi(client.http);
const all = await clientIds.list();
```

Root exports point at the REST v2 endpoints. Reach for versioned barrels like `@request-suite/request-api-client/v1/requests` only when you deliberately need legacy behaviour.

## Payments search & legacy pay

```ts
const results = await client.payments.search({ paymentReference: '0xabc' });
console.log(results.pagination.total);

await client.pay.payRequest({
  payee: '0xmerchant',
  amount: '12.50',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});
```
