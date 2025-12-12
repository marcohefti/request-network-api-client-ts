// Minimal Node example: list currencies
import { createRequestClient, RequestEnvironment, isRequestApiError } from '@marcohefti/request-network-api-client';

async function main() {
  const client = createRequestClient({
    baseUrl: process.env.REQUEST_API_URL || RequestEnvironment.production,
    apiKey: process.env.REQUEST_API_KEY,
    clientId: process.env.REQUEST_CLIENT_ID,
  });
  try {
    const tokens = await client.currencies.list({ network: 'sepolia' });
    console.log('Currencies:', tokens.length);

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
