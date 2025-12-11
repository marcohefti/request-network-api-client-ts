# Requests

Work with payment requests, payment routes, and payment intents.

```ts
const request = await client.requests.create({
  amount: '12.5',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});

// Typed union distinguishes calldata vs. intent workflows
const payment = await client.requests.getPaymentCalldata(request.requestId!, { chain: 'OPTIMISM' });
if (payment.kind === 'paymentIntent') {
  await client.requests.sendPaymentIntent(payment.paymentIntentId, {
    signedPaymentIntent: { signature: '0x...', nonce: '1', deadline: '9999999999' },
  });
}

const status = await client.requests.getRequestStatus(request.requestId!);
if (status.kind === 'paid') {
  console.log('Paid tx hash', status.txHash);
}

const routes = await client.requests.getPaymentRoutes(request.requestId!, { wallet: '0xpayer' });
```

- `create` validates request bodies before dispatch and returns `{ paymentReference, requestId }`.
- `getPaymentCalldata` returns `{ kind: 'calldata' | 'paymentIntent', ... }` so callers can switch by `kind`.
- Per-call overrides accept `{ signal, timeoutMs, validation }` for transport control.
- Legacy request endpoints remain available via `createRequestsV1Api(client.http)` or the `@marcohefti/request-network-api-client/v1/requests` barrel (includes status polling and recurrence helpers).
