import { createHttpClient, type CreateClientOptions } from "./core/http/client.factory";
import type { HttpClient } from "./core/http/http.types";
import { createClientIdsApi, type ClientIdsApi } from "./domains/client-ids";
import { createCurrenciesApi, type CurrenciesApi } from "./domains/currencies";
import { createPayApi, type PayApi } from "./domains/pay";
import {
  createPayeeDestinationApi,
  type PayeeDestinationApi,
} from "./domains/payee-destination";
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
  /** Payee destination endpoints */
  payeeDestination: PayeeDestinationApi;
  /** Legacy pay endpoints */
  pay: PayApi;
}

/**
 * Creates a Request Network API client with typed domain facades.
 *
 * @param options - Client configuration options
 * @param options.baseUrl - API base URL (defaults to https://api.request.network)
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
 * import { createRequestClient } from '@marcohefti/request-network-api-client';
 *
 * const client = createRequestClient({
 *   apiKey: process.env.REQUEST_API_KEY,
 * });
 *
 * const request = await client.requests.create({
 *   amount: '0.01',
 *   paymentNetwork: 'erc20-sepolia',
 *   paymentCurrency: 'ETH-sepolia-sepolia',
 * });
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
    payeeDestination: createPayeeDestinationApi(http),
    pay: createPayApi(http),
  };
}
