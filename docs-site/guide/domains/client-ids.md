# Client IDs

Manage client IDs for frontend authentication.

```ts
// List client IDs
const items = await client.clientIds.list();

// Create
const created = await client.clientIds.create({
  label: 'My App',
  allowedDomains: ['https://example.com'],
});

// Get one
const one = await client.clientIds.findOne(created.id!);

// Update
const updated = await client.clientIds.update(created.id!, { status: 'inactive' });

// Revoke
await client.clientIds.revoke(created.id!);
```

- Uses type-safe inputs from the OpenAPI types
- Validates responses using operationId‑mapped Zod schemas
