# Payouts

Create single, batch, and recurring payouts with typed helpers.

```ts
const payout = await client.payouts.create({
  payee: '0xpayee',
  amount: '250',
  invoiceCurrency: 'USD',
  paymentCurrency: 'USDC-sepolia',
});

const batch = await client.payouts.createBatch({
  requests: [
    { payee: '0xpayee', amount: '120', invoiceCurrency: 'USD', paymentCurrency: 'USDC-sepolia' },
  ],
});

const status = await client.payouts.getRecurringStatus('rec-123');
await client.payouts.submitRecurringSignature('rec-123', { permitSignature: '0xsignature' });
await client.payouts.updateRecurring('rec-123', { action: 'cancel' });
```

- `create`/`createBatch` validate payloads (recurrence, fees, metadata) before dispatch.
- Recurring helpers return typed status metadata so dashboards can display execution progress.
- Options accept `{ signal, timeoutMs, validation }` to align with HTTP client controls.
