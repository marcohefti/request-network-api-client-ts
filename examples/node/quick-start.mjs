// Minimal Node example: list currencies
import { createRequestClientFromEnv, isRequestApiError } from '@marcohefti/request-network-api-client';

async function main() {
  const client = createRequestClientFromEnv();
  try {
    const tokens = await client.currencies.list({ network: 'sepolia' });
    console.log('Currencies:', tokens.length);

    const [legacy] = await client.currencies.legacy.list({ firstOnly: 'true', symbol: 'USDC', network: 'mainnet' });
    console.log('Legacy currency sample:', legacy?.id ?? 'none');

    const payments = await client.payments.search({ walletAddress: '0x0000000000000000000000000000000000000000' });
    console.log('Payments found:', payments.pagination.total);
  } catch (err) {
    if (isRequestApiError(err)) {
      console.error('API error', err.status, err.code, err.requestId, err.toJSON());
    } else {
      console.error(err);
    }
    process.exitCode = 1;
  }
}

main();
