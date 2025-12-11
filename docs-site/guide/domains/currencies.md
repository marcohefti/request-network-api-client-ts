# Currencies

List currencies and fetch conversion routes.

```ts
const tokens = await client.currencies.list({ network: 'sepolia' });
const routes = await client.currencies.getConversionRoutes('USDC', { networks: 'sepolia,mainnet' });
```

- Legacy v1 endpoints remain available via `client.currencies.legacy` or the `@request/request-network-api-client/v1/currencies` barrel:

  ```ts
  const [token] = await client.currencies.legacy.list({ firstOnly: 'true', symbol: 'USDC', network: 'mainnet' });
  const legacyRoutes = await client.currencies.legacy.getConversionRoutes('USD', { network: 'mainnet' });
  ```

- Validated responses via schema registry (operationId keyed)
- Per-request retry and logging via HTTP client meta
