# Request API Flows - Before vs After

This guide shows how common Request Network hosted REST API flows look with manual fetch/axios versus using this client library.

## 1. Create Payout (Browser, Client ID)

### Before (No Client)

```ts
const resp = await fetch(`${RN_API_URL}/v2/payouts`, {
  method: 'POST',
  headers: {
    'x-client-id': rnApiClientId,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount,
    payerWallet,
    payee: recipientWallet,
    invoiceCurrency: 'USD',
    paymentCurrency,
    customerInfo,
    reference,
  }),
});

if (!resp.ok) {
  let message = `HTTP ${resp.status}`;
  try {
    const err = await resp.json();
    message = err?.message ?? message;
  } catch {}
  throw new Error(message);
}

const payout = await resp.json(); // { transactions: [...], requestId, ... }
// normalize values, send each tx, wait for receipts...
```

### After (With Client)

```ts
import { createRequestClient, isRequestApiError } from '@marcohefti/request-network-api-client';

const client = createRequestClient({
  baseUrl: process.env.NEXT_PUBLIC_REQUEST_API_URL,
  clientId: rnApiClientId,
});

try {
  const payout = await client.payouts.create({
    amount,
    payerWallet,
    payee: recipientWallet,
    invoiceCurrency: 'USD',
    paymentCurrency,
    customerInfo,
    reference,
  });
  // Typed response with full validation
} catch (err) {
  if (isRequestApiError(err)) {
    console.error(err.status, err.code, err.requestId, err.retryAfterMs);
    console.error(err.toJSON()); // Structured logging
  }
  throw err;
}
```

---

## 2. Payment Routes (Server, API Key)

### Before (No Client)

```ts
let url = `/v2/request/${requestId}/routes?wallet=${wallet}`;
if (process.env.FEE_PERCENTAGE && process.env.FEE_ADDRESS) {
  url += `&feePercentage=${process.env.FEE_PERCENTAGE}&feeAddress=${process.env.FEE_ADDRESS}`;
}
const res = await axios.get(url);
if (res.status !== 200) throw new Error('Failed to get payment routes');
const { routes, platformFee } = res.data;
```

### After (With Client)

```ts
import { createRequestClient } from '@marcohefti/request-network-api-client';

const client = createRequestClient({
  baseUrl: process.env.REQUEST_API_URL,
  apiKey: process.env.REQUEST_API_KEY!,
});

const { routes, platformFee } = await client.requests.getPaymentRoutes(requestId, {
  wallet,
  feePercentage: process.env.FEE_PERCENTAGE,
  feeAddress: process.env.FEE_ADDRESS,
});
```

---

## 3. Compliance (Server, API Key)

### Before (No Client)

```ts
// Submit compliance data
await axios.post('/v2/payer', formData);

// Get status (404 -> manual default)
try {
  const res = await axios.get(`/v2/payer/${encodeURIComponent(clientUserId)}`);
  status = res.data;
} catch (e) {
  if (axios.isAxiosError(e) && e.response?.status === 404) {
    status = {
      kycStatus: 'not_started',
      agreementStatus: 'not_started',
      isCompliant: false
    };
  } else {
    throw e;
  }
}

// Update agreement
await axios.patch(`/v2/payer/${encodeURIComponent(clientUserId)}`, {
  agreementCompleted: true
});
```

### After (With Client)

```ts
await client.payer.createComplianceData(formData);

const status = await client.payer.getComplianceStatus(clientUserId);

await client.payer.updateComplianceStatus(clientUserId, {
  agreementCompleted: true
});
```

---

## 4. Conversion Routes (Browser, Client ID)

### Before (No Client)

```ts
const resp = await fetch(`${RN_API_URL}/v2/currencies/USD/conversion-routes`, {
  headers: {
    'x-client-id': rnApiClientId,
    'Content-Type': 'application/json'
  },
});
if (!resp.ok) throw new Error('Failed to fetch conversion routes');
const data = await resp.json();
const routes = data.conversionRoutes;
```

### After (With Client)

```ts
const routes = await client.currencies.getConversionRoutes('USD', {
  networks: 'sepolia'
});
```

---

## 5. Create Request / Invoice (Server, API Key)

### Before (No Client)

```ts
const response = await axios.post('/v2/request', {
  amount: totalAmount.toString(),
  payee, // undefined when crypto-to-fiat
  invoiceCurrency: input.invoiceCurrency,
  paymentCurrency: input.paymentCurrency,
  isCryptoToFiatAvailable: input.isCryptoToFiatAvailable,
  ...(input.isRecurring && {
    recurrence: {
      startDate: input.startDate,
      frequency: input.frequency
    }
  }),
});

if (response.status !== 200 && response.status !== 201) {
  throw new Error(`Failed to create invoice: ${response.data.message}`);
}
```

### After (With Client)

```ts
const created = await client.requests.create({
  amount: totalAmount.toString(),
  payee,
  invoiceCurrency: input.invoiceCurrency,
  paymentCurrency: input.paymentCurrency,
  isCryptoToFiatAvailable: input.isCryptoToFiatAvailable,
  recurrence: input.isRecurring ? {
    startDate: input.startDate,
    frequency: input.frequency
  } : undefined,
});
// created.requestId, created.paymentReference (fully typed)
```

---

## 6. Get Payment Calldata / Intent (Server, API Key)

### Before (No Client)

```ts
const params = new URLSearchParams();
if (input.wallet) params.append('wallet', input.wallet);
if (invoice.paymentDetails) params.append('clientUserId', invoice.clientEmail);
if (paymentDetailsPayers) params.append('paymentDetailsId', paymentDetailsPayers.externalPaymentDetailId);
if (input.chain) params.append('chain', input.chain);
if (input.token) params.append('token', input.token);
if (process.env.FEE_PERCENTAGE_FOR_PAYMENT) params.append('feePercentage', process.env.FEE_PERCENTAGE_FOR_PAYMENT);
if (process.env.FEE_ADDRESS_FOR_PAYMENT) params.append('feeAddress', process.env.FEE_ADDRESS_FOR_PAYMENT);

const endpoint = `/v2/request/${invoice.requestId}/pay?${params.toString()}`;
const res = await axios.get(endpoint);
if (res.status !== 200) throw new Error('Failed to get payment calldata');
return res.data;
```

### After (With Client)

```ts
const data = await client.requests.getPaymentCalldata(invoice.requestId, {
  wallet: input.wallet,
  clientUserId: invoice.paymentDetails ? invoice.clientEmail : undefined,
  paymentDetailsId: paymentDetailsPayers?.externalPaymentDetailId,
  chain: input.chain,
  token: input.token,
  feePercentage: process.env.FEE_PERCENTAGE_FOR_PAYMENT,
  feeAddress: process.env.FEE_ADDRESS_FOR_PAYMENT,
});
```

---

## 7. Send Payment Intent (Server, API Key)

### Before (No Client)

```ts
await axios.post(`/v2/request/payment-intents/${paymentIntent}`, payload);
```

### After (With Client)

```ts
await client.requests.sendPaymentIntent(paymentIntent, payload);
```

---

## 8. Stop Recurring Request (Server, API Key)

### Before (No Client)

```ts
const res = await axios.patch(`/v2/request/${requestId}`, {
  isRecurrenceStopped: true
});
if (res.status !== 200) throw new Error('Failed to stop recurrence');
```

### After (With Client)

```ts
await client.requests.update(requestId, {
  isRecurrenceStopped: true
});
```

---

## 9. Create Payment Details for Payer (Server, API Key)

### Before (No Client)

```ts
const cleaned = sanitize(paymentDetailsFromDb);
const resp = await axios.post(
  `/v2/payer/${encodeURIComponent(payerEmail)}/payment-details`,
  cleaned
);
const externalId = resp.data?.payment_detail?.id;
```

### After (With Client)

```ts
const detail = await client.payer.createPaymentDetails(
  payerEmail,
  paymentDetailsFromDb
);
// detail.id is fully typed
```