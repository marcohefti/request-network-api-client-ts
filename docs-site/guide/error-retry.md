# Errors & Retries

All HTTP failures are converted to `RequestApiError` with `status`, `code`, `detail`, `errors[]`, and correlation IDs. Call `error.toJSON()` for a structured snapshot that is safe to log or send to monitoring systems.

```ts
import { isRequestApiError } from '@request-suite/request-api-client';

try {
  await client.currencies.list();
} catch (err) {
  if (isRequestApiError(err)) {
    console.log(err.status, err.code, err.requestId, err.retryAfterMs);
    console.error('request-api', err.toJSON());
  }
}
```

The retry policy now defaults to three attempts on idempotent methods (`GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`) and retries on [408, 425, 429, 5xx]. `Retry-After` headers are honoured automatically. Override `retry` globally when creating the client or per request via `meta.retry`.

```ts
await client.payments.search({ paymentReference: '0xref' }, {
  meta: { retry: { maxAttempts: 1 } },
});
```

When a retry is scheduled the HTTP client emits `request:retry` with `{ attempt, delayMs, reason }`. 429 responses also trigger a `rate-limit` event containing `retryAfterMs`, making backpressure easy to observe.

Error payloads are validated against a normalized envelope (`status`, `code`, `message`, optional `errors[]`, `requestId`, `correlationId`). If the upstream API responds with an unexpected shape the client throws a `ClientValidationError` before mapping it, preventing partially populated `RequestApiError` instances. Disable this guard with `runtimeValidation: { errors: false }` when trust has been established or performance outweighs safety.
