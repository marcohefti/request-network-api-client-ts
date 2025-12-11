# Payments & Pay

Search historical payments and trigger the legacy pay flow directly from the API client.

```ts
const results = await client.payments.search({ walletAddress: '0xSender' });
console.log('Payments found:', results.pagination.total);

await client.pay.payRequest({
  payee: '0xmerchant',
  amount: '42',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});
```

- `client.payments.search` returns typed payment records with pagination metadata, fee breakdowns, and nested request/customer details. Override retries per call via `meta.retry` when handling 429 responses from the API.
- `client.pay.payRequest` wraps the legacy `/v1/pay` endpoint so storefronts can initiate payments without creating a request first. The `/pay` barrel exposes the same facade along with `.legacy` helpers for tree-shaking.
- Tree-shake individual facades with `@request/request-network-api-client/payments` and `@request/request-network-api-client/pay` (and `@request/request-network-api-client/v1/pay` for the versioned factory).
