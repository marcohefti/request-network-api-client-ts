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

export function createRequestClientFromEnv(options?: EnvOptions): RequestClient {
  const env = options?.env ?? process.env;
  // Prefer modern variable names; fall back to legacy REQUEST_SDK_* for compatibility
  const baseUrl = env.REQUEST_API_URL ?? env.REQUEST_SDK_BASE_URL;
  const apiKey = env.REQUEST_API_KEY ?? env.REQUEST_SDK_API_KEY;
  const clientId = env.REQUEST_CLIENT_ID ?? env.REQUEST_SDK_CLIENT_ID;
  return createRequestClient({ baseUrl, apiKey, clientId });
}
