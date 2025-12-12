# Request API Client – Endpoint Reference

This reference supplements the OpenAPI spec with behavioral notes, prerequisites, common use cases, and examples discovered while integrating the Request Network API through `@marcohefti/request-network-api-client`.

## Client IDs

Manage client IDs for frontend/browser authentication.

### `GET /v2/client-ids`

List all client IDs for the authenticated account.

**Common use cases:**
- Dashboard view of all client IDs
- Audit client ID usage
- Find client IDs by label

**Example:**
```typescript
const clientIds = await client.clientIds.list();
console.log(`Found ${clientIds.length} client IDs`);
```

### `POST /v2/client-ids`

Create a new client ID with allowed domains.

**Prerequisites:**
- Valid API key with client ID creation permissions
- At least one allowed domain (HTTPS only for production)

**Example:**
```typescript
const newClientId = await client.clientIds.create({
  label: 'Production Web App',
  allowedDomains: ['https://app.example.com'],
});
console.log('Client ID:', newClientId.id);
```

**Notes:**
- `allowedDomains` must be HTTPS URLs for production
- Localhost is allowed for development (http://localhost:*)

### `GET /v2/client-ids/{id}`

Get details of a specific client ID.

**Example:**
```typescript
const clientId = await client.clientIds.findOne('client_abc123');
console.log('Label:', clientId.label);
console.log('Status:', clientId.status);
console.log('Allowed domains:', clientId.allowedDomains);
```

### `PUT /v2/client-ids/{id}`

Update an existing client ID (status or allowed domains).

**Example:**
```typescript
const updated = await client.clientIds.update('client_abc123', {
  status: 'inactive',
});
console.log('Updated status:', updated.status);
```

**Notes:**
- Use `status: 'inactive'` to temporarily disable a client ID
- Use `status: 'active'` to re-enable it

### `DELETE /v2/client-ids/{id}`

Permanently revoke a client ID.

**Example:**
```typescript
await client.clientIds.revoke('client_abc123');
console.log('Client ID revoked');
```

**Notes:**
- This action is irreversible
- All requests using this client ID will fail immediately
- Consider setting `status: 'inactive'` first for testing

---

## Currencies

List supported payment currencies and conversion routes.

### `GET /v2/currencies`

Get all supported currencies, optionally filtered by network.

**Common use cases:**
- Populate payment currency dropdowns
- Validate user-selected currencies
- Check token availability on specific networks

**Example:**
```typescript
// All currencies
const allCurrencies = await client.currencies.list();

// Filter by network
const sepoliaCurrencies = await client.currencies.list({
  network: 'sepolia'
});

console.log('Sepolia tokens:', sepoliaCurrencies.length);
for (const token of sepoliaCurrencies) {
  console.log(`${token.symbol} - ${token.address}`);
}
```

**Query parameters:**
- `network`: Filter by blockchain network (e.g., 'sepolia', 'mainnet', 'matic')

### `GET /v2/currencies/{currencyId}/conversion-routes`

Get available conversion routes for a currency.

**Common use cases:**
- Show users which networks support their chosen currency
- Find optimal payment paths
- Display cross-chain payment options

**Example:**
```typescript
const routes = await client.currencies.getConversionRoutes('USDC', {
  networks: 'sepolia,mainnet',
});

console.log('Available conversion routes:');
for (const route of routes) {
  console.log(`${route.from} → ${route.to}`);
}
```

**Notes:**
- `currencyId` is typically the currency symbol (e.g., 'USDC', 'ETH')
- `networks` parameter accepts comma-separated network names

### `GET /v1/currencies` (Legacy)

Legacy endpoint with different response format.

**Migration note:** Use `/v2/currencies` for new integrations. The v1 endpoint returns a different schema and is maintained for backward compatibility only.

**Example:**
```typescript
const legacyCurrencies = await client.currencies.legacy.list({
  firstOnly: 'true',
  symbol: 'USDC',
  network: 'mainnet',
});
```

---

## Requests

Create and manage payment requests.

### `POST /v2/request`

Create a new payment request.

**Prerequisites:**
- Valid API key
- Payment currency must be supported on the specified network
- Amount in smallest currency unit (e.g., cents for USD, wei for ETH)

**Example:**
```typescript
const request = await client.requests.create({
  amount: '12.50',
  invoiceCurrency: 'USD',
  paymentCurrency: 'ETH-sepolia-sepolia',
  payee: '0xYourWalletAddress',
  payer: '0xPayerWalletAddress', // optional
  reason: 'Invoice #1234',
  dueDate: '2024-12-31',
});

console.log('Request ID:', request.requestId);
console.log('Payment Reference:', request.paymentReference);
```

**Notes:**
- `requestId` is the v2 identifier
- `paymentReference` is the legacy v1 identifier
- Both are returned and can be used interchangeably for lookups

### `GET /v2/request/{requestId}`

Get the status and details of a request.

**Example:**
```typescript
const status = await client.requests.getRequestStatus(request.requestId);

if (status.kind === 'paid') {
  console.log('Paid! Transaction:', status.txHash);
} else if (status.kind === 'pending') {
  console.log('Awaiting payment');
} else if (status.kind === 'cancelled') {
  console.log('Request cancelled');
}
```

**Response types (discriminated union):**
- `{ kind: 'pending' }` - Awaiting payment
- `{ kind: 'paid', txHash, timestamp }` - Payment confirmed
- `{ kind: 'overpaid', txHash, timestamp }` - Overpayment received
- `{ kind: 'cancelled' }` - Request cancelled

### `GET /v2/request/{requestId}/routes`

Get available payment routes for a request.

**Common use cases:**
- Show users payment options
- Display estimated gas costs
- Validate wallet can complete payment

**Example:**
```typescript
const routes = await client.requests.getPaymentRoutes(request.requestId, {
  wallet: '0xPayerWalletAddress',
  amount: '12.50', // optional, defaults to request amount
});

console.log('Available payment routes:');
for (const route of routes.routes) {
  console.log(`Chain: ${route.chain}, Gas: ${route.estimatedGas}`);
}
```

### `GET /v2/request/{requestId}/pay`

Get payment calldata or payment intent for executing the payment.

**Example:**
```typescript
const payment = await client.requests.getPaymentCalldata(request.requestId, {
  chain: 'OPTIMISM',
});

if (payment.kind === 'calldata') {
  // Direct transaction
  console.log('To:', payment.transactions[0].to);
  console.log('Data:', payment.transactions[0].data);
  console.log('Value:', payment.transactions[0].value);
} else if (payment.kind === 'paymentIntent') {
  // Requires signature
  console.log('Payment Intent ID:', payment.paymentIntentId);
  // User signs the intent, then call sendPaymentIntent
}
```

**Notes:**
- Returns discriminated union: `{ kind: 'calldata' }` or `{ kind: 'paymentIntent' }`
- Calldata can be used directly with wallet providers
- Payment intents require user signature before submission

### `POST /v2/request/payment-intents/{paymentIntentId}`

Submit a signed payment intent.

**Prerequisites:**
- Payment intent ID from `getPaymentCalldata`
- User signature from wallet

**Example:**
```typescript
await client.requests.sendPaymentIntent(payment.paymentIntentId, {
  signedPaymentIntent: {
    signature: '0xSignatureFromWallet',
    nonce: '1',
    deadline: '9999999999',
  },
});
```

### `PATCH /v2/request/{requestId}`

Update request metadata or cancel recurring requests.

**Example:**
```typescript
await client.requests.update(request.requestId, {
  action: 'cancel',
});
```

---

## Payouts

Create single, batch, or recurring payouts.

### `POST /v2/payouts`

Create a single payout.

**Example:**
```typescript
const payout = await client.payouts.create({
  payee: '0xPayeeWalletAddress',
  amount: '100.00',
  paymentCurrency: 'USDC-mainnet',
  reason: 'Contractor payment',
});

console.log('Payout ID:', payout.id);
```

### `POST /v2/payouts/batch`

Create multiple payouts in a single transaction.

**Common use cases:**
- Payroll processing
- Bulk vendor payments
- Reward distribution

**Example:**
```typescript
const batch = await client.payouts.createBatch({
  requests: [
    {
      payee: '0xPayee1',
      amount: '50.00',
      paymentCurrency: 'USDC-mainnet',
    },
    {
      payee: '0xPayee2',
      amount: '75.00',
      paymentCurrency: 'USDC-mainnet',
    },
  ],
});

console.log('Batch created with', batch.requests.length, 'payouts');
```

**Notes:**
- All payouts in a batch must use the same payment currency
- Maximum batch size varies by network

### `GET /v2/payouts/recurring/{id}`

Get status of a recurring payout.

**Example:**
```typescript
const status = await client.payouts.getRecurringStatus('rec_abc123');
console.log('Next execution:', status.nextExecutionDate);
console.log('Status:', status.status);
```

### `POST /v2/payouts/recurring/{id}`

Submit permit signature for recurring payout.

**Example:**
```typescript
await client.payouts.submitRecurringSignature('rec_abc123', {
  permitSignature: '0xSignature',
});
```

### `PATCH /v2/payouts/recurring/{id}`

Update or cancel a recurring payout.

**Example:**
```typescript
await client.payouts.updateRecurring('rec_abc123', {
  action: 'cancel',
});
```

---

## Payer & Compliance

Manage KYC compliance and payment details for crypto-to-fiat flows.

### `POST /v2/payer`

Create compliance data for a new payer.

**Prerequisites:**
- Valid API key with compliance permissions
- Complete user information

**Example:**
```typescript
await client.payer.createComplianceData({
  clientUserId: 'user-123',
  email: 'user@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  beneficiaryType: 'individual',
  dateOfBirth: '1990-01-01',
  addressLine1: '123 Main St',
  city: 'New York',
  postcode: '10001',
  country: 'US',
  nationality: 'US',
  phone: '+1234567890',
  ssn: '123-45-6789', // or tax ID
});
```

**Notes:**
- `clientUserId` must be unique per user
- `beneficiaryType` can be 'individual' or 'business'
- Required fields vary by country and beneficiary type

### `GET /v2/payer/{clientUserId}`

Get compliance status for a payer.

**Example:**
```typescript
const status = await client.payer.getComplianceStatus('user-123');

console.log('KYC Status:', status.kycStatus); // pending, approved, rejected
console.log('Agreement Status:', status.agreementStatus);
```

### `PATCH /v2/payer/{clientUserId}`

Update payer compliance status or information.

**Example:**
```typescript
await client.payer.updateComplianceStatus('user-123', {
  agreementCompleted: true,
});
```

### `POST /v2/payer/{clientUserId}/payment-details`

Add bank account details for crypto-to-fiat payouts.

**Example:**
```typescript
await client.payer.createPaymentDetails('user-123', {
  bankName: 'Chase',
  accountName: 'Jane Doe',
  beneficiaryType: 'individual',
  currency: 'USD',
  addressLine1: '123 Main St',
  city: 'New York',
  country: 'US',
  dateOfBirth: '1990-01-01',
  postalCode: '10001',
  routingNumber: '123456789',
  accountNumber: '9876543210',
});
```

### `GET /v2/payer/{clientUserId}/payment-details`

Retrieve stored payment details.

**Example:**
```typescript
const details = await client.payer.getPaymentDetails('user-123');
console.log('Bank:', details.bankName);
console.log('Status:', details.status);
```

---

## Payments

Search and retrieve payment history.

### `GET /v2/payments`

Search payments with filters.

**Common use cases:**
- Transaction history for a wallet
- Payment reconciliation
- Finding payments by reference

**Example:**
```typescript
const results = await client.payments.search({
  walletAddress: '0xYourWallet',
  page: 1,
  pageSize: 20,
});

console.log('Total payments:', results.pagination.total);
console.log('Current page:', results.pagination.page);

for (const payment of results.data) {
  console.log(`Payment ${payment.id}: ${payment.amount} ${payment.currency}`);
  console.log(`Status: ${payment.status}`);
  console.log(`Request ID: ${payment.requestId}`);
}
```

**Query parameters:**
- `walletAddress`: Filter by payer or payee wallet
- `paymentReference`: Filter by payment reference
- `requestId`: Filter by request ID
- `page`: Page number (1-indexed)
- `pageSize`: Results per page (default: 20, max: 100)

**Notes:**
- Results include pagination metadata
- Payments include nested request details
- Status can be: `pending`, `confirmed`, `failed`

---

## Pay (Legacy)

Direct payment flow without creating a request first.

### `POST /v1/pay`

Initiate a payment without pre-creating a request.

**Use case:**
- Simplified payment flow
- One-time payments where request persistence isn't needed

**Example:**
```typescript
await client.pay.payRequest({
  payee: '0xMerchantWallet',
  amount: '42.00',
  invoiceCurrency: 'USD',
  paymentCurrency: 'ETH-sepolia-sepolia',
  reason: 'Product purchase',
});
```

**Notes:**
- This is a legacy endpoint
- For new integrations, prefer creating a request first with `/v2/request`
- Provides less visibility into request lifecycle

---

## Common Patterns

### Error Handling

All endpoints can throw `RequestApiError`:

```typescript
import { isRequestApiError } from '@marcohefti/request-network-api-client';

try {
  await client.requests.create({ /* ... */ });
} catch (err) {
  if (isRequestApiError(err)) {
    console.error('Status:', err.status);
    console.error('Code:', err.code);
    console.error('Request ID:', err.requestId);

    // Handle specific errors
    if (err.status === 401) {
      console.error('Invalid API key');
    } else if (err.status === 429) {
      console.log('Rate limited, retry after', err.retryAfterMs, 'ms');
    }
  }
}
```

### Retry Behavior

The client automatically retries on:
- 408 (Request Timeout)
- 429 (Rate Limited) - respects `Retry-After` header
- 5xx (Server Errors)

Override retry policy:

```typescript
await client.currencies.list(
  { network: 'sepolia' },
  { meta: { retry: { maxAttempts: 5 } } }
);
```

### Runtime Validation

Disable validation for trusted responses:

```typescript
await client.currencies.list(
  { network: 'sepolia' },
  { meta: { validation: false } }
);
```

---

## See Also

- [DOMAINS.md](./DOMAINS.md) - Detailed domain API reference with more examples
- [HTTP-AND-ERRORS.md](./HTTP-AND-ERRORS.md) - Error handling patterns and retry configuration
- [QUICK-START.md](./QUICK-START.md) - Getting started guide
