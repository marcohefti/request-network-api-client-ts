# HTTP Client & Error Handling

This document covers HTTP client configuration, error handling patterns, and retry behavior.

## HTTP Client

The client exposes a fetch-based HTTP client with interceptors for retry and logging. Works in Node 20.x-24.x (built-in `fetch`) and modern browsers/edge runtimes.

### Basic Usage

```ts
import { createHttpClient } from '@marcohefti/request-network-api-client';

const http = createHttpClient({
  baseUrl: 'https://api.request.network',
  apiKey: '...',
});

const res = await http.request({
  path: '/v2/currencies',
  method: 'GET',
  timeoutMs: 5_000,
  meta: { operationId: 'CurrenciesV2Controller_getNetworkTokens_v2' },
});
```

### Shortcut Methods

```ts
await http.get('/v2/currencies');
await http.post('/v2/request', body);
await http.put('/v2/request/{id}', body);
await http.delete('/v2/request/{id}');
```

## Request Options

### Signal & Timeout

```ts
const controller = new AbortController();

await http.get('/v2/currencies', {
  signal: controller.signal,  // AbortSignal for cancellation
  timeoutMs: 10_000,          // Per-request timeout in milliseconds
});

// Cancel the request
controller.abort();
```

### Query Serialization

```ts
await http.get('/v2/currencies', {
  querySerializer: 'comma',  // form, explode=false (default)
});

await http.get('/v2/currencies', {
  querySerializer: 'repeat',  // explode=true (repeated params)
});

// Custom serializer
await http.get('/v2/currencies', {
  querySerializer: (params) => new URLSearchParams(params).toString(),
});
```

### Retry Policy Override

```ts
await http.get('/v2/payments', {
  meta: {
    retry: {
      maxAttempts: 5,       // Default: 3
      baseDelayMs: 1000,    // Default: 500
      maxDelayMs: 30000,    // Default: 10000
    },
  },
});

// Disable retries for a single call
await http.post('/v2/request', body, {
  meta: { retry: { maxAttempts: 1 } },
});
```

### Runtime Validation Override

```ts
// Disable validation per call (for hot paths that trust upstream data)
await http.get('/v2/currencies', {
  meta: {
    validation: false,  // Disable all validation
  },
});

// Granular control
await http.post('/v2/request', body, {
  meta: {
    validation: {
      requests: true,   // Validate request body
      responses: false, // Skip response validation
      errors: true,     // Validate error envelopes
    },
  },
});
```

### Custom Interceptors

```ts
await http.get('/v2/currencies', {
  meta: {
    interceptors: [
      {
        onRequest: async (config) => {
          console.log('Request:', config.path);
          return config;
        },
        onResponse: async (response) => {
          console.log('Response:', response.status);
          return response;
        },
      },
    ],
  },
});
```

## Logging

Configure logging behavior when creating the HTTP client:

```ts
const http = createHttpClient({
  baseUrl: 'https://api.request.network',
  apiKey: '...',
  logLevel: 'debug',  // silent | error | info | debug
  logger: (event, meta) => {
    console.log(`[request-api] ${event}`, meta);
  },
});
```

### Log Events

The logger receives these events:

- `request:start` - Request initiated
- `request:response` - Response received
- `request:retry` - Retry scheduled with `{ attempt, delayMs, reason }`
- `request:error` - Request failed
- `rate-limit` - 429 response with `retryAfterMs`

### Example Custom Logger

```ts
const http = createHttpClient({
  baseUrl: 'https://api.request.network',
  apiKey: '...',
  logger: (event, meta) => {
    switch (event) {
      case 'request:start':
        console.log(`→ ${meta.method} ${meta.path}`);
        break;
      case 'request:response':
        console.log(`← ${meta.status} ${meta.path}`);
        break;
      case 'request:retry':
        console.warn(`⟳ Retry ${meta.attempt} after ${meta.delayMs}ms: ${meta.reason}`);
        break;
      case 'request:error':
        console.error(`✗ ${meta.path}:`, meta.error);
        break;
      case 'rate-limit':
        console.warn(`⚠ Rate limited, retry after ${meta.retryAfterMs}ms`);
        break;
    }
  },
});
```

## Error Handling

All HTTP failures are converted to `RequestApiError` with structured metadata.

### Error Properties

```ts
interface RequestApiError extends Error {
  status: number;           // HTTP status code
  code: string;            // Error code from API
  detail?: string;         // Human-readable detail
  errors?: Array<{         // Validation errors
    field: string;
    message: string;
  }>;
  requestId?: string;      // Request correlation ID
  correlationId?: string;  // Correlation ID for tracing
  retryAfterMs?: number;   // Milliseconds to wait before retry (429 only)
  meta?: Record<string, unknown>; // Optional extra metadata (debugging/logging)
  toJSON(): object;        // Structured snapshot for logging
}
```

### Basic Error Handling

```ts
import { isRequestApiError } from '@marcohefti/request-network-api-client';

try {
  await client.currencies.list();
} catch (err) {
  if (isRequestApiError(err)) {
    console.log('Status:', err.status);
    console.log('Code:', err.code);
    console.log('Request ID:', err.requestId);
    console.log('Retry After:', err.retryAfterMs);

    // Structured logging
    console.error('request-api', err.toJSON());
  } else {
    // Network error, timeout, or other non-API error
    console.error('Unexpected error:', err);
  }
}
```

### Capturing HTTP Context (Debugging)

Sometimes you need the exact upstream response body/headers to report an intermittent API issue. You can opt in per call:

```ts
try {
  await client.currencies.list(undefined, {
    meta: { captureErrorContext: true },
  });
} catch (err) {
  if (isRequestApiError(err)) {
    // Includes request method/url + redacted headers, plus response status/headers/body (truncated)
    console.error(err.meta);
  }
}
```

Notes:
- `captureErrorContext` is **off by default**.
- Sensitive headers are redacted (e.g. `x-api-key`, `authorization`).
- Response bodies are truncated to keep logs bounded.

### Handling Specific Error Codes

```ts
try {
  await client.requests.create({ /* ... */ });
} catch (err) {
  if (isRequestApiError(err)) {
    switch (err.code) {
      case 'INVALID_REQUEST':
        console.error('Invalid request payload:', err.errors);
        break;
      case 'UNAUTHORIZED':
        console.error('API key is invalid or expired');
        break;
      case 'RATE_LIMITED':
        console.warn(`Rate limited, retry after ${err.retryAfterMs}ms`);
        break;
      case 'NOT_FOUND':
        console.error('Resource not found');
        break;
      default:
        console.error('API error:', err.code, err.detail);
    }
  }
}
```

### Validation Errors

When the API returns validation errors, they're available in the `errors` array:

```ts
try {
  await client.payer.createComplianceData({ /* incomplete data */ });
} catch (err) {
  if (isRequestApiError(err) && err.errors) {
    for (const validationError of err.errors) {
      console.error(`${validationError.field}: ${validationError.message}`);
    }
  }
}
```

## Retry Behavior

The retry policy defaults to three attempts on idempotent methods (`GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`) and retries on `[408, 425, 429, 5xx]` status codes.

### Default Retry Logic

- **Max attempts**: 3
- **Base delay**: 500ms
- **Max delay**: 10,000ms
- **Exponential backoff**: delay = min(baseDelay * 2^attempt, maxDelay)
- **Retry-After header**: Honored automatically for 429 responses

### Retryable Status Codes

- `408` - Request Timeout
- `425` - Too Early
- `429` - Too Many Requests (rate limited)
- `5xx` - Server errors

### Non-Retryable Methods

By default, `POST` and `PATCH` are not retried automatically (they're not idempotent). Override this per-request if needed:

```ts
await http.post('/v2/request', body, {
  meta: {
    retry: {
      maxAttempts: 3,
      retryMethods: ['POST'],  // Enable retries for POST
    },
  },
});
```

### Retry Events

Monitor retries via the logger:

```ts
const http = createHttpClient({
  baseUrl: 'https://api.request.network',
  apiKey: '...',
  logger: (event, meta) => {
    if (event === 'request:retry') {
      console.warn(`Retry attempt ${meta.attempt} after ${meta.delayMs}ms: ${meta.reason}`);
    }
  },
});
```

### Disabling Retries

```ts
// Globally
const http = createHttpClient({
  baseUrl: 'https://api.request.network',
  apiKey: '...',
  retry: { maxAttempts: 1 },
});

// Per request
await http.get('/v2/currencies', {
  meta: { retry: { maxAttempts: 1 } },
});
```

### Custom Retry Logic

```ts
const http = createHttpClient({
  baseUrl: 'https://api.request.network',
  apiKey: '...',
  retry: {
    maxAttempts: 5,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    retryableStatusCodes: [408, 429, 503],
    retryMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
```

## Runtime Validation

Runtime validation is enabled by default for request bodies, success responses, and error envelopes. The client uses Zod schemas generated from the OpenAPI spec.

### Global Configuration

```ts
// Disable all validation
const client = createRequestClient({
  apiKey: '...',
  runtimeValidation: false,
});

// Granular control
const client = createRequestClient({
  apiKey: '...',
  runtimeValidation: {
    requests: true,   // Validate request bodies (default: true)
    responses: true,  // Validate success responses (default: true)
    errors: false,    // Skip error envelope validation
  },
});
```

### Per-Request Override

```ts
// Disable validation for a hot path
await client.currencies.list(
  { network: 'sepolia' },
  { meta: { validation: false } }
);

// Enable only request validation
await client.requests.create(
  { /* ... */ },
  {
    meta: {
      validation: {
        requests: true,
        responses: false,
        errors: false,
      },
    },
  }
);
```

### Validation Errors

When validation fails, the client throws a `ClientValidationError`:

```ts
import { isClientValidationError } from '@marcohefti/request-network-api-client';

try {
  await client.currencies.list();
} catch (err) {
  if (isClientValidationError(err)) {
    console.error('Response validation failed:', err.issues);
  }
}
```

## User Agent

Set a custom user agent to identify your application:

```ts
const client = createRequestClient({
  apiKey: '...',
  userAgent: 'my-app/1.0.0',
});
```

## See Also

- [QUICK-START.md](./QUICK-START.md) - Installation and basic usage
- [DOMAINS.md](./DOMAINS.md) - Domain API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - HTTP pipeline internals
