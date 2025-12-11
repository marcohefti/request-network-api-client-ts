# Payer & Compliance

Manage compliance status and payout banking details for end users.

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

const status = await client.payer.getComplianceStatus('user-1');
await client.payer.updateComplianceStatus('user-1', { agreementCompleted: true });

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

- Methods accept typed payloads derived from OpenAPI schemas and validate them at runtime.
- Responses map directly to the REST envelope, exposing IDs, URLs, and status flags.
- Supply `{ signal, timeoutMs, validation }` in the optional options bag for transport overrides.
- Legacy endpoints remain available via `client.payer.legacy` or the `@request/request-network-api-client/v1/payer` barrel when older storefronts still target `/v1/payer`.
