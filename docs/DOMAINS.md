# Domain API Reference

This document covers all domain APIs exposed by the client: requests, payouts, payer/compliance, payments, currencies, and client IDs.

## Requests

Work with payment requests, payment routes, and payment intents.

### Create a Request

```ts
const request = await client.requests.create({
  amount: '12.5',
  invoiceCurrency: 'USD',
  paymentCurrency: 'ETH-sepolia-sepolia',
});

console.log('Request ID:', request.requestId);
console.log('Payment Reference:', request.paymentReference);
```

### Get Payment Calldata

Returns calldata or payment intent depending on the chain and Request configuration.

```ts
const payment = await client.requests.getPaymentCalldata(request.requestId!, {
  chain: 'OPTIMISM',
});

// Typed union distinguishes calldata vs intent workflows
if (payment.kind === 'paymentIntent') {
  await client.requests.sendPaymentIntent(payment.paymentIntentId, {
    signedPaymentIntent: {
      signature: '0x...',
      nonce: '1',
      deadline: '9999999999',
    },
  });
} else {
  // payment.kind === 'calldata'
  console.log('Calldata:', payment.calldata);
}
```

### Get Request Status

```ts
const status = await client.requests.getRequestStatus(request.requestId!);

if (status.kind === 'paid') {
  console.log('Paid tx hash:', status.txHash);
} else if (status.kind === 'pending') {
  console.log('Still pending payment');
}
```

### Get Payment Routes

```ts
const routes = await client.requests.getPaymentRoutes(request.requestId!, {
  wallet: '0xpayer',
});

console.log('Available routes:', routes.length);
```

### Notes

- `create` validates request bodies before dispatch and returns `{ paymentReference, requestId }`.
- `getPaymentCalldata` returns `{ kind: 'calldata' | 'paymentIntent', ... }` so callers can switch by `kind`.
- Per-call overrides accept `{ signal, timeoutMs, validation }` for transport control.
- Legacy request endpoints remain available via `createRequestsV1Api(client.http)` or the `@marcohefti/request-network-api-client/v1/requests` barrel (includes status polling and recurrence helpers).

## Payouts

Create single, batch, and recurring payouts with typed helpers.

### Create a Payout

```ts
const payout = await client.payouts.create({
  payee: '0xpayee',
  amount: '250',
  invoiceCurrency: 'USD',
  paymentCurrency: 'ETH-sepolia-sepolia',
});
```

### Batch Payouts

```ts
const batch = await client.payouts.createBatch({
  requests: [
    {
      payee: '0xpayee1',
      amount: '120',
      invoiceCurrency: 'USD',
      paymentCurrency: 'ETH-sepolia-sepolia',
    },
    {
      payee: '0xpayee2',
      amount: '80',
      invoiceCurrency: 'USD',
      paymentCurrency: 'ETH-sepolia-sepolia',
    },
  ],
});
```

### Recurring Payouts

```ts
// Get recurring payout status
const status = await client.payouts.getRecurringStatus('rec-123');

// Submit permit signature for recurring payout
await client.payouts.submitRecurringSignature('rec-123', {
  permitSignature: '0xsignature',
});

// Update recurring payout (cancel, pause, etc.)
await client.payouts.updateRecurring('rec-123', { action: 'cancel' });
```

### Notes

- `create`/`createBatch` validate payloads (recurrence, fees, metadata) before dispatch.
- Recurring helpers return typed status metadata so dashboards can display execution progress.
- Options accept `{ signal, timeoutMs, validation }` to align with HTTP client controls.

## Payer & Compliance

Manage compliance status and payout banking details for end users.

### Create Compliance Data

```ts
await client.payer.createComplianceData({
  clientUserId: 'user-1',
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  beneficiaryType: 'individual',
  dateOfBirth: '1990-01-01',
  addressLine1: '1 Main St',
  city: 'Paris',
  postcode: '75001',
  country: 'FR',
  nationality: 'FR',
  phone: '+33123456789',
  ssn: '123456789',
});
```

### Get Compliance Status

```ts
const status = await client.payer.getComplianceStatus('user-1');
console.log('KYC Status:', status.kycStatus);
console.log('Agreement Status:', status.agreementStatus);
```

### Update Compliance Status

```ts
await client.payer.updateComplianceStatus('user-1', {
  agreementCompleted: true,
});
```

### Create Payment Details

```ts
await client.payer.createPaymentDetails('user-1', {
  bankName: 'Chase',
  accountName: 'Jane Doe',
  beneficiaryType: 'individual',
  currency: 'USD',
  addressLine1: '1 Main St',
  city: 'New York',
  country: 'US',
  dateOfBirth: '1990-01-01',
  postalCode: '10001',
});
```

### Notes

- Methods accept typed payloads derived from OpenAPI schemas and validate them at runtime.
- Responses map directly to the REST envelope, exposing IDs, URLs, and status flags.
- Supply `{ signal, timeoutMs, validation }` in the optional options bag for transport overrides.
- Legacy endpoints remain available via `client.payer.legacy` or the `@marcohefti/request-network-api-client/v1/payer` barrel when older storefronts still target `/v1/payer`.

## Payments & Pay

Search historical payments and trigger the legacy pay flow directly from the API client.

### Search Payments

```ts
const results = await client.payments.search({
  walletAddress: '0xSender',
});

console.log('Payments found:', results.pagination.total);

// Iterate through results
for (const payment of results.data) {
  console.log('Payment ID:', payment.id);
  console.log('Amount:', payment.amount);
  console.log('Status:', payment.status);
}
```

### Legacy Pay Request

```ts
await client.pay.payRequest({
  payee: '0xmerchant',
  amount: '42',
  invoiceCurrency: 'USD',
  paymentCurrency: 'ETH-sepolia-sepolia',
});
```

### Notes

- `client.payments.search` returns typed payment records with pagination metadata, fee breakdowns, and nested request/customer details.
- Override retries per call via `meta.retry` when handling 429 responses from the API.
- `client.pay.payRequest` wraps the legacy `/v1/pay` endpoint so storefronts can initiate payments without creating a request first.
- The `/pay` barrel exposes the same facade along with `.legacy` helpers for tree-shaking.
- Tree-shake individual facades with `@marcohefti/request-network-api-client/payments` and `@marcohefti/request-network-api-client/pay` (and `@marcohefti/request-network-api-client/v1/pay` for the versioned factory).

## Currencies

List currencies and fetch conversion routes.

### List Currencies

```ts
const tokens = await client.currencies.list({ network: 'sepolia' });

for (const token of tokens) {
  console.log('Symbol:', token.symbol);
  console.log('Address:', token.address);
  console.log('Network:', token.network);
}
```

### Get Conversion Routes

```ts
const routes = await client.currencies.getConversionRoutes('USDC', {
  networks: 'sepolia,mainnet',
});

console.log('Conversion routes:', routes.length);
```

### Legacy Endpoints

Legacy v1 endpoints remain available via `client.currencies.legacy` or the `@marcohefti/request-network-api-client/v1/currencies` barrel:

```ts
const [token] = await client.currencies.legacy.list({
  firstOnly: 'true',
  symbol: 'USDC',
  network: 'mainnet',
});

const legacyRoutes = await client.currencies.legacy.getConversionRoutes('USD', {
  network: 'mainnet',
});
```

### Notes

- Validated responses via schema registry (operationId keyed).
- Per-request retry and logging via HTTP client meta.

## Client IDs

Manage client IDs for frontend authentication.

### List Client IDs

```ts
const items = await client.clientIds.list();

for (const item of items) {
  console.log('ID:', item.id);
  console.log('Label:', item.label);
  console.log('Status:', item.status);
}
```

### Create Client ID

```ts
const created = await client.clientIds.create({
  label: 'My App',
  allowedDomains: ['https://example.com'],
});

console.log('Created Client ID:', created.id);
```

### Get One Client ID

```ts
const one = await client.clientIds.findOne(created.id!);
console.log('Client ID:', one.id);
console.log('Allowed Domains:', one.allowedDomains);
```

### Update Client ID

```ts
const updated = await client.clientIds.update(created.id!, {
  status: 'inactive',
});

console.log('Updated status:', updated.status);
```

### Revoke Client ID

```ts
await client.clientIds.revoke(created.id!);
```

### Notes

- Uses type-safe inputs from the OpenAPI types.
- Validates responses using operationId-mapped Zod schemas.

## Transport Overrides

All domain methods accept an optional second parameter for transport control:

```ts
await client.currencies.list(
  { network: 'sepolia' },
  {
    signal: abortController.signal,  // AbortSignal for cancellation
    timeoutMs: 10_000,                // Per-request timeout
    meta: {
      retry: { maxAttempts: 5 },      // Override retry policy
      validation: false,               // Disable runtime validation
    },
  }
);
```

## Tree-Shaking with Subpath Imports

Import individual domain APIs to reduce bundle size:

```ts
import { createRequestsApi } from '@marcohefti/request-network-api-client/requests';
import { createPayoutsApi } from '@marcohefti/request-network-api-client/payouts';
import { createCurrenciesApi } from '@marcohefti/request-network-api-client/currencies';

const http = createHttpClient({ apiKey: '...' });
const requests = createRequestsApi(http);
const payouts = createPayoutsApi(http);
const currencies = createCurrenciesApi(http);
```

## Legacy API Access

Access legacy v1 endpoints via `.legacy` properties or versioned barrels:

```ts
// Via .legacy property
const legacyRequests = client.requests.legacy;
const legacyPayer = client.payer.legacy;
const legacyCurrencies = client.currencies.legacy;

// Via versioned barrels
import { createRequestsV1Api } from '@marcohefti/request-network-api-client/v1/requests';
import { createPayerV1Api } from '@marcohefti/request-network-api-client/v1/payer';
import { createCurrenciesV1Api } from '@marcohefti/request-network-api-client/v1/currencies';
```

## See Also

- [QUICK-START.md](./QUICK-START.md) - Installation and basic usage
- [HTTP-AND-ERRORS.md](./HTTP-AND-ERRORS.md) - HTTP client configuration and error handling
- [WEBHOOKS.md](./WEBHOOKS.md) - Webhook signature verification and event handlers
- [ENDPOINTS.md](./ENDPOINTS.md) - Full API endpoint reference
