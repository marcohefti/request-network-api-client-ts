# HTTP Client

> Works in Node 20.x-24.x (built-in `fetch`) and modern browsers/edge runtimes.

The client exposes a fetch-based HTTP client with interceptors for retry and logging.

```ts
import { createHttpClient } from '@request/request-network-api-client';

const http = createHttpClient({ baseUrl: 'https://api.request.network', apiKey: '...' });

const res = await http.request({
  path: '/v2/currencies',
  method: 'GET',
  timeoutMs: 5_000,
  meta: { operationId: 'CurrenciesV2Controller_getNetworkTokens_v2' },
});

// Shortcut verbs are available too
await http.get('/v2/currencies');
await http.post('/v2/request', body);
await http.put('/v2/request/{id}', body);
await http.delete('/v2/request/{id}');
```

- Request options:
  - `signal` / `timeoutMs` (per request) support cancellation and bounded latency.
  - `querySerializer` lets you switch between comma-joined (form, explode=false) and repeated params (explode=true) or supply a custom serializer.
  - `meta.retry` overrides the client retry policy. Defaults retry idempotent methods up to three attempts.
  - `meta.interceptors` appends per-call interceptors ahead of user/global interceptors.
  - `meta.validation` toggles runtime validation per call (`{ requests?, responses?, errors? }`). Combine with `createRequestClient({ runtimeValidation })` for global defaults.
- Logging:
  - Configure via `createHttpClient({ logger, logLevel })` (`silent`/`error`/`info`/`debug`).
  - Events: `request:start`, `request:response`, `request:retry`, `request:error`, and `rate-limit` (429 with `retryAfterMs`).
- Retry defaults honor `Retry-After` headers and emit `request:retry` with `{ attempt, delayMs, reason }` before sleeping.
- Non-2xx responses raise `RequestApiError` (see [Errors & Retries](/guide/error-retry)). Call `error.toJSON()` to capture structured metadata for logs/telemetry.

Disable retries on a single call when the upstream route already provides its own backoff logic:

```ts
await client.payments.search({ walletAddress: '0xabc' }, { meta: { retry: { maxAttempts: 1 } } });
```

Runtime validation is enabled by default for request bodies, success responses, and error envelopes. Set `runtimeValidation: false` (or a partial map) when constructing the client to opt out globally, or provide a per-call override via `meta.validation` when performance is critical and upstream data is trusted.
