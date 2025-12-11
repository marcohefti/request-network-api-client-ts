import { createHttpClient, type CreateClientOptions } from "./core/http/client.factory";
import type { HttpClient } from "./core/http/http.types";
import { createClientIdsApi, type ClientIdsApi } from "./domains/client-ids";
import { createCurrenciesApi, type CurrenciesApi } from "./domains/currencies";
import { createPayApi, type PayApi } from "./domains/pay";
import { createPayerApi, type PayerApi } from "./domains/payer";
import { createPaymentsApi, type PaymentsApi } from "./domains/payments";
import { createPayoutsApi, type PayoutsApi } from "./domains/payouts";
import { createRequestsApi, type RequestsApi } from "./domains/requests";

export interface RequestClient {
  /** Low-level HTTP client (useful for custom modules) */
  http: HttpClient;
  /** Currency endpoints */
  currencies: CurrenciesApi;
  /** Client ID endpoints */
  clientIds: ClientIdsApi;
  /** Request & invoice endpoints */
  requests: RequestsApi;
  /** Payout endpoints */
  payouts: PayoutsApi;
  /** Payment search endpoints */
  payments: PaymentsApi;
  /** Payer/compliance endpoints */
  payer: PayerApi;
  /** Legacy pay endpoints */
  pay: PayApi;
}

/**
 * Creates a Request Network API client with typed domain facades.
 *
 * @param options - Client configuration options
 * @param options.baseUrl - API base URL (defaults to production if not provided)
 * @param options.apiKey - API key for server-side authentication
 * @param options.clientId - Client ID for browser/frontend authentication
 * @param options.runtimeValidation - Enable/disable runtime validation (default: true)
 * @param options.logLevel - Logging level: 'silent' | 'error' | 'info' | 'debug' (default: 'error')
 * @param options.logger - Custom logger function
 * @param options.userAgent - Custom user agent string
 * @param options.retry - Retry configuration
 *
 * @returns RequestClient instance with domain APIs
 *
 * @example
 * ```ts
 * import { createRequestClient, RequestEnvironment } from '@marcohefti/request-network-api-client';
 *
 * const client = createRequestClient({
 *   baseUrl: RequestEnvironment.production,
 *   apiKey: process.env.REQUEST_API_KEY,
 *   logLevel: 'info',
 * });
 *
 * const tokens = await client.currencies.list({ network: 'sepolia' });
 * ```
 */
export function createRequestClient(options?: CreateClientOptions): RequestClient {
  const http = createHttpClient(options);
  return {
    http,
    currencies: createCurrenciesApi(http),
    clientIds: createClientIdsApi(http),
    requests: createRequestsApi(http),
    payouts: createPayoutsApi(http),
    payments: createPaymentsApi(http),
    payer: createPayerApi(http),
    pay: createPayApi(http),
  };
}

export interface EnvOptions {
  env?: NodeJS.ProcessEnv;
}

/**
 * Creates a Request Network API client from environment variables.
 *
 * Reads configuration from the following environment variables (in order of preference):
 * - `REQUEST_API_URL` (or legacy `REQUEST_SDK_BASE_URL`)
 * - `REQUEST_API_KEY` (or legacy `REQUEST_SDK_API_KEY`)
 * - `REQUEST_CLIENT_ID` (or legacy `REQUEST_SDK_CLIENT_ID`)
 *
 * @param options - Optional environment override
 * @param options.env - Custom environment object (defaults to process.env)
 *
 * @returns RequestClient instance configured from environment
 *
 * @example
 * ```ts
 * import { createRequestClientFromEnv } from '@marcohefti/request-network-api-client';
 *
 * const client = createRequestClientFromEnv();
 * // Reads REQUEST_API_KEY, REQUEST_CLIENT_ID, REQUEST_API_URL from process.env
 *
 * const tokens = await client.currencies.list({ network: 'sepolia' });
 * ```
 */
export function createRequestClientFromEnv(options?: EnvOptions): RequestClient {
  const env = options?.env ?? process.env;
  // Prefer modern variable names; fall back to legacy REQUEST_SDK_* for compatibility
  const baseUrl = env.REQUEST_API_URL ?? env.REQUEST_SDK_BASE_URL;
  const apiKey = env.REQUEST_API_KEY ?? env.REQUEST_SDK_API_KEY;
  const clientId = env.REQUEST_CLIENT_ID ?? env.REQUEST_SDK_CLIENT_ID;
  return createRequestClient({ baseUrl, apiKey, clientId });
}
