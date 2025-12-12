export {
  RequestApiError,
  buildRequestApiError,
  isRequestApiError,
  type RequestErrorDetail,
  type RequestErrorMetadata,
  type BuildRequestApiErrorOptions,
} from "./core/errors/request-api.error";
export {
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
  type RetryDecision,
  type RetryDecisionInput,
  type RetryResponseLike,
  type RetryJitter,
  computeRetryDelay,
  shouldRetryRequest,
} from "./core/http/retry.policy";
export { schemaRegistry, SchemaRegistry, type SchemaKey, type SchemaKind } from "./validation/schema.registry";
export {
  parseWithSchema,
  parseWithRegistry,
  type ParseResult,
  type ParseWithSchemaOptions,
  type ParseRegistryOptions,
  ValidationError,
  type SchemaOutput,
} from "./validation/zod.helpers";

export { createHttpClient, type CreateClientOptions } from "./core/http/client.factory";
export type {
  HttpClient,
  HttpMethod,
  RequestOptions,
  Interceptor,
  HttpAdapter,
  RuntimeValidationConfig,
  RuntimeValidationOption,
} from "./core/http/http.types";
export { nodeFetchAdapter } from "./core/http/adapters/node-fetch.adapter";
export { browserFetchAdapter } from "./core/http/adapters/browser-fetch.adapter";
export { createRequestClient, type RequestClient } from "./request.client";
export * as currencies from "./domains/currencies";
export * as currenciesV1 from "./domains/currencies/v1";
export * as clientIds from "./domains/client-ids";
export * as requests from "./domains/requests";
export * as requestsV1 from "./domains/requests/v1";
export * as payouts from "./domains/payouts";
export * as payments from "./domains/payments";
export * as pay from "./domains/pay";
export * as payV1 from "./domains/pay/v1";
export * as payer from "./domains/payer";
export * as payerV1 from "./domains/payer/v1";
export * as payerV2 from "./domains/payer/v2";
export * as webhooks from "./webhooks";

export type {
  PaymentCalldataResult,
  GetPaymentCalldataOptions,
  PaymentRoutesResponse,
  PaymentRoute,
  RequestStatusResult,
} from "./domains/requests";
export type { CurrencyToken } from "./domains/currencies";
export type { ClientIdResponse } from "./domains/client-ids";
