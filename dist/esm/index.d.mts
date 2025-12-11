/// <reference types="node" />
import { R as RetryConfig, L as LogLevel, H as HttpAdapter, I as Interceptor, Q as QuerySerializer, a as RuntimeValidationOption, b as HttpClient, o as operations, c as RequestOptions } from './openapi-types-CtUFCrk4.mjs';
export { D as DEFAULT_RETRY_CONFIG, i as HttpMethod, d as RetryDecision, e as RetryDecisionInput, g as RetryJitter, f as RetryResponseLike, j as RuntimeValidationConfig, h as computeRetryDelay, s as shouldRetryRequest } from './openapi-types-CtUFCrk4.mjs';
import { ZodTypeAny, z } from 'zod';
import { C as ClientIdsApi } from './index-CNK36ZX5.mjs';
export { a as ClientIdResponse, i as clientIds } from './index-CNK36ZX5.mjs';
import { C as CurrenciesV1Api, a as CurrencyV1RequestOptions, G as GetConversionRoutesV1Query, L as ListCurrenciesV1Query, c as createCurrenciesV1Api, b as CurrenciesApi } from './index-ziziGrHN.mjs';
export { d as CurrencyToken, i as currencies } from './index-ziziGrHN.mjs';
import { P as PayerV1Api, a as PayerV1OperationOptions, c as createPayerV1Api, b as PayerV2Api, d as PayerV2OperationOptions, e as createPayerV2Api, f as PayerApi } from './index-Q2g0D7V8.mjs';
export { i as payer } from './index-Q2g0D7V8.mjs';
import { P as PayoutsApi } from './index-Cd7x0Hv-.mjs';
export { i as payouts } from './index-Cd7x0Hv-.mjs';
import { R as RequestsApi, L as LegacyRequestStatusResult } from './index-BmWmfcnn.mjs';
export { G as GetPaymentCalldataOptions, P as PaymentCalldataResult, b as PaymentRoute, a as PaymentRoutesResponse, c as RequestStatusResult, i as requests } from './index-BmWmfcnn.mjs';
import { SendOptions } from 'send';
import { EventEmitter } from 'events';
import * as http from 'http';
import { ParsedQs } from 'qs';
import { Options, Ranges, Result } from 'range-parser';

interface RequestErrorSource {
    pointer?: string;
    parameter?: string;
}
interface RequestErrorDetail {
    message: string;
    code?: string;
    field?: string;
    source?: RequestErrorSource;
    meta?: Record<string, unknown>;
}
interface RequestErrorMetadata {
    status: number;
    code: string;
    message: string;
    detail?: unknown;
    errors?: RequestErrorDetail[];
    requestId?: string;
    correlationId?: string;
    retryAfterMs?: number;
    headers?: Record<string, string | undefined>;
    meta?: Record<string, unknown>;
    cause?: unknown;
}
declare class RequestApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly detail?: unknown;
    readonly errors?: RequestErrorDetail[];
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly retryAfterMs?: number;
    readonly headers?: Record<string, string | undefined>;
    readonly meta?: Record<string, unknown>;
    constructor(metadata: RequestErrorMetadata);
    toJSON(): Record<string, unknown>;
}
interface ErrorHeaderLookup {
    get(name: string): string | undefined;
}
type HeaderLike = Record<string, string | undefined> | ErrorHeaderLookup | undefined;
interface ErrorPayloadLike {
    status?: number;
    code?: string;
    message?: string;
    detail?: unknown;
    errors?: unknown;
    [key: string]: unknown;
}
interface BuildRequestApiErrorOptions {
    payload?: ErrorPayloadLike | null;
    status: number;
    headers?: HeaderLike;
    fallbackMessage?: string;
    meta?: Record<string, unknown>;
    cause?: unknown;
}
declare function buildRequestApiError(options: BuildRequestApiErrorOptions): RequestApiError;
declare function isRequestApiError(error: unknown): error is RequestApiError;

type SchemaKind = "request" | "response" | "webhook";
interface SchemaKey {
    operationId: string;
    kind: SchemaKind;
    variant?: string;
    status?: number;
}
interface SchemaEntry<TSchema extends ZodTypeAny = ZodTypeAny> {
    key: SchemaKey;
    schema: TSchema;
}
/**
 * Lightweight registry that associates OpenAPI operation IDs with validation schemas.
 * Generators can populate this map while domain modules retrieve the schemas at runtime.
 */
declare class SchemaRegistry {
    private readonly store;
    register(entry: SchemaEntry): void;
    get(key: SchemaKey): ZodTypeAny | undefined;
    /**
     * Removes every registered schema — primarily useful in tests.
     */
    clear(): void;
}
declare const schemaRegistry: SchemaRegistry;

type SchemaOutput<TSchema extends ZodTypeAny> = TSchema["_output"];
interface ParseWithSchemaOptions<TSchema extends ZodTypeAny> {
    schema: TSchema;
    value: unknown;
    description?: string;
}
interface ParseRegistryOptions {
    key: SchemaKey;
    value: unknown;
    description?: string;
    skipOnMissingSchema?: boolean;
}
interface ParseResult<T> {
    success: boolean;
    data?: T;
    error?: unknown;
}
declare class ValidationError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
declare function parseWithSchema<TSchema extends ZodTypeAny>(options: ParseWithSchemaOptions<TSchema>): ParseResult<SchemaOutput<TSchema>>;
declare function parseWithRegistry<TSchema extends ZodTypeAny>(options: ParseRegistryOptions): ParseResult<SchemaOutput<TSchema>>;

interface RetryInterceptorOptions {
    config?: Partial<RetryConfig>;
    logger?: (event: string, meta?: Record<string, unknown>) => void;
    logLevel?: LogLevel;
}

interface CreateClientOptions {
    baseUrl?: string;
    apiKey?: string;
    clientId?: string;
    origin?: string;
    headers?: Record<string, string>;
    adapter?: HttpAdapter;
    interceptors?: Interceptor[];
    logger?: (event: string, meta?: Record<string, unknown>) => void;
    retry?: RetryInterceptorOptions;
    querySerializer?: QuerySerializer;
    userAgent?: string;
    sdkInfo?: {
        name: string;
        version?: string;
    };
    logLevel?: LogLevel;
    runtimeValidation?: RuntimeValidationOption;
}
declare function createHttpClient(options?: CreateClientOptions): HttpClient;

declare const nodeFetchAdapter: HttpAdapter;

declare const browserFetchAdapter: HttpAdapter;

declare const index$8_CurrenciesV1Api: typeof CurrenciesV1Api;
declare const index$8_CurrencyV1RequestOptions: typeof CurrencyV1RequestOptions;
declare const index$8_GetConversionRoutesV1Query: typeof GetConversionRoutesV1Query;
declare const index$8_ListCurrenciesV1Query: typeof ListCurrenciesV1Query;
declare const index$8_createCurrenciesV1Api: typeof createCurrenciesV1Api;
declare namespace index$8 {
  export { index$8_CurrenciesV1Api as CurrenciesV1Api, index$8_CurrencyV1RequestOptions as CurrencyV1RequestOptions, index$8_GetConversionRoutesV1Query as GetConversionRoutesV1Query, index$8_ListCurrenciesV1Query as ListCurrenciesV1Query, index$8_createCurrenciesV1Api as createCurrenciesV1Api };
}

declare const OP_PAY_REQUEST: "PayV1Controller_payRequest_v1";
type PayRequestBody = operations[typeof OP_PAY_REQUEST]["requestBody"]["content"]["application/json"];
type PayRequestResponse = operations[typeof OP_PAY_REQUEST]["responses"][201]["content"]["application/json"];
interface PayV1OperationOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
interface PayV1Api {
    payRequest(body: PayRequestBody, options?: PayV1OperationOptions): Promise<PayRequestResponse>;
}
declare function createPayV1Api(http: HttpClient): PayV1Api;

type index$7_PayV1Api = PayV1Api;
type index$7_PayV1OperationOptions = PayV1OperationOptions;
declare const index$7_createPayV1Api: typeof createPayV1Api;
declare namespace index$7 {
  export { type index$7_PayV1Api as PayV1Api, type index$7_PayV1OperationOptions as PayV1OperationOptions, index$7_createPayV1Api as createPayV1Api };
}

type PayOperationOptions = PayV1OperationOptions;
interface PayApi extends PayV1Api {
    legacy: PayV1Api;
}

declare function createPayApi(http: HttpClient): PayApi;

type index$6_PayApi = PayApi;
type index$6_PayOperationOptions = PayOperationOptions;
type index$6_PayV1Api = PayV1Api;
type index$6_PayV1OperationOptions = PayV1OperationOptions;
declare const index$6_createPayApi: typeof createPayApi;
declare const index$6_createPayV1Api: typeof createPayV1Api;
declare namespace index$6 {
  export { type index$6_PayApi as PayApi, type index$6_PayOperationOptions as PayOperationOptions, type index$6_PayV1Api as PayV1Api, type index$6_PayV1OperationOptions as PayV1OperationOptions, index$6_createPayApi as createPayApi, index$6_createPayV1Api as createPayV1Api };
}

declare const index$5_PayerV1Api: typeof PayerV1Api;
declare const index$5_PayerV1OperationOptions: typeof PayerV1OperationOptions;
declare const index$5_createPayerV1Api: typeof createPayerV1Api;
declare namespace index$5 {
  export { index$5_PayerV1Api as PayerV1Api, index$5_PayerV1OperationOptions as PayerV1OperationOptions, index$5_createPayerV1Api as createPayerV1Api };
}

declare const index$4_PayerV2Api: typeof PayerV2Api;
declare const index$4_PayerV2OperationOptions: typeof PayerV2OperationOptions;
declare const index$4_createPayerV2Api: typeof createPayerV2Api;
declare namespace index$4 {
  export { index$4_PayerV2Api as PayerV2Api, index$4_PayerV2OperationOptions as PayerV2OperationOptions, index$4_createPayerV2Api as createPayerV2Api };
}

declare const OP_SEARCH_PAYMENTS = "PaymentV2Controller_searchPayments_v2";
declare const PaymentRecordSchema: z.ZodObject<{
    id: z.ZodString;
    amount: z.ZodString;
    sourceNetwork: z.ZodString;
    destinationNetwork: z.ZodString;
    sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timestamp: z.ZodString;
    type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
    conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currency: z.ZodString;
    paymentCurrency: z.ZodString;
    fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
    recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
    request: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    amount: z.ZodString;
    sourceNetwork: z.ZodString;
    destinationNetwork: z.ZodString;
    sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timestamp: z.ZodString;
    type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
    conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currency: z.ZodString;
    paymentCurrency: z.ZodString;
    fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
    recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
    request: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    amount: z.ZodString;
    sourceNetwork: z.ZodString;
    destinationNetwork: z.ZodString;
    sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timestamp: z.ZodString;
    type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
    conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currency: z.ZodString;
    paymentCurrency: z.ZodString;
    fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
        stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
        provider: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        amountInUSD: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        receiverAddress: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        rateProvider: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">>>;
    recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
    request: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        requestId: z.ZodOptional<z.ZodString>;
        paymentReference: z.ZodOptional<z.ZodString>;
        hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
        customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodObject<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                street: z.ZodOptional<z.ZodString>;
                city: z.ZodOptional<z.ZodString>;
                state: z.ZodOptional<z.ZodString>;
                postalCode: z.ZodOptional<z.ZodString>;
                country: z.ZodOptional<z.ZodString>;
            }, z.ZodTypeAny, "passthrough">>>;
        }, z.ZodTypeAny, "passthrough">>>>;
        reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">>;
declare const PaginationSchema: z.ZodObject<{
    total: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    total: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    total: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, z.ZodTypeAny, "passthrough">>;
declare const PaymentSearchResponseSchema: z.ZodObject<{
    payments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.ZodTypeAny, "passthrough">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    payments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.ZodTypeAny, "passthrough">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    payments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        amount: z.ZodString;
        sourceNetwork: z.ZodString;
        destinationNetwork: z.ZodString;
        sourceTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        destinationTxHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timestamp: z.ZodString;
        type: z.ZodEnum<["direct", "conversion", "crosschain", "recurring"]>;
        conversionRateSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        conversionRateDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        convertedAmountDestination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currency: z.ZodString;
        paymentCurrency: z.ZodString;
        fees: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodOptional<z.ZodEnum<["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]>>;
            stage: z.ZodOptional<z.ZodEnum<["sending", "receiving", "proxying", "refunding"]>>;
            provider: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodString>;
            amountInUSD: z.ZodOptional<z.ZodString>;
            currency: z.ZodOptional<z.ZodString>;
            receiverAddress: z.ZodOptional<z.ZodString>;
            network: z.ZodOptional<z.ZodString>;
            rateProvider: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>, "many">>>;
        recurringPaymentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        rateProvider: z.ZodOptional<z.ZodNullable<z.ZodEnum<["lifi", "chainlink", "coingecko", "unknown"]>>>;
        request: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            requestId: z.ZodOptional<z.ZodString>;
            paymentReference: z.ZodOptional<z.ZodString>;
            hasBeenPaid: z.ZodOptional<z.ZodBoolean>;
            customerInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                firstName: z.ZodOptional<z.ZodString>;
                lastName: z.ZodOptional<z.ZodString>;
                email: z.ZodOptional<z.ZodString>;
                address: z.ZodOptional<z.ZodObject<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
                    street: z.ZodOptional<z.ZodString>;
                    city: z.ZodOptional<z.ZodString>;
                    state: z.ZodOptional<z.ZodString>;
                    postalCode: z.ZodOptional<z.ZodString>;
                    country: z.ZodOptional<z.ZodString>;
                }, z.ZodTypeAny, "passthrough">>>;
            }, z.ZodTypeAny, "passthrough">>>>;
            reference: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.ZodTypeAny, "passthrough">>;
}, z.ZodTypeAny, "passthrough">>;
type PaymentRecord = z.infer<typeof PaymentRecordSchema>;
type PaymentSearchResponse = z.infer<typeof PaymentSearchResponseSchema>;
type PaymentSearchPagination = z.infer<typeof PaginationSchema>;

type PaymentSearchQuery = operations[typeof OP_SEARCH_PAYMENTS]["parameters"]["query"];
interface PaymentSearchOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
type PaymentSearchResult = PaymentSearchResponse;
interface PaymentsApi {
    search(query: PaymentSearchQuery, options?: PaymentSearchOptions): Promise<PaymentSearchResult>;
}
declare function createPaymentsApi(http: HttpClient): PaymentsApi;

type index$3_PaymentRecord = PaymentRecord;
type index$3_PaymentSearchOptions = PaymentSearchOptions;
type index$3_PaymentSearchPagination = PaymentSearchPagination;
type index$3_PaymentSearchQuery = PaymentSearchQuery;
type index$3_PaymentSearchResult = PaymentSearchResult;
type index$3_PaymentsApi = PaymentsApi;
declare const index$3_createPaymentsApi: typeof createPaymentsApi;
declare namespace index$3 {
  export { type index$3_PaymentRecord as PaymentRecord, type index$3_PaymentSearchOptions as PaymentSearchOptions, type index$3_PaymentSearchPagination as PaymentSearchPagination, type index$3_PaymentSearchQuery as PaymentSearchQuery, type index$3_PaymentSearchResult as PaymentSearchResult, type index$3_PaymentsApi as PaymentsApi, index$3_createPaymentsApi as createPaymentsApi };
}

interface RequestClient {
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
declare function createRequestClient(options?: CreateClientOptions): RequestClient;
interface EnvOptions {
    env?: NodeJS.ProcessEnv;
}
declare function createRequestClientFromEnv(options?: EnvOptions): RequestClient;

declare const RequestEnvironment: {
    readonly production: "https://api.request.network";
    readonly staging: "https://api.stage.request.network";
    readonly local: "http://127.0.0.1:8080";
};
type RequestEnvironmentName = keyof typeof RequestEnvironment;

declare const OP_CREATE: "RequestControllerV1_createRequest_v1";
declare const OP_PAYMENT_ROUTES: "RequestControllerV1_getRequestPaymentRoutes_v1";
declare const OP_PAYMENT_CALLDATA: "RequestControllerV1_getPaymentCalldata_v1";
declare const OP_SEND_PAYMENT_INTENT: "RequestControllerV1_sendPaymentIntent_v1";
type CreateRequestBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreateRequestResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];
type PaymentRoutesResponse = operations[typeof OP_PAYMENT_ROUTES]["responses"][200]["content"]["application/json"];
type PaymentRoutesQuery = operations[typeof OP_PAYMENT_ROUTES]["parameters"]["query"];
type PaymentCalldataQuery = NonNullable<operations[typeof OP_PAYMENT_CALLDATA]["parameters"]["query"]>;
type RawPaymentCalldata = operations[typeof OP_PAYMENT_CALLDATA]["responses"][200]["content"]["application/json"];
type PaymentIntentPayload = Extract<RawPaymentCalldata, {
    paymentIntentId: string;
}>;
type CalldataPayload = Extract<RawPaymentCalldata, {
    transactions: unknown;
}>;
interface RequestV1OperationOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
type GetPaymentRoutesOptions = RequestV1OperationOptions & {
    wallet: PaymentRoutesQuery["wallet"];
} & Partial<Omit<PaymentRoutesQuery, "wallet">>;
type GetPaymentCalldataOptions = RequestV1OperationOptions & Partial<PaymentCalldataQuery>;
type RequestStatusResult = LegacyRequestStatusResult;
type SendPaymentIntentBody = operations[typeof OP_SEND_PAYMENT_INTENT]["requestBody"]["content"]["application/json"];
interface RequestsV1Api {
    create(body: CreateRequestBody, options?: RequestV1OperationOptions): Promise<CreateRequestResponse>;
    getPaymentRoutes(paymentReference: string, options: GetPaymentRoutesOptions): Promise<PaymentRoutesResponse>;
    getPaymentCalldata(paymentReference: string, options?: GetPaymentCalldataOptions): Promise<({
        kind: "calldata";
    } & CalldataPayload) | ({
        kind: "paymentIntent";
    } & PaymentIntentPayload)>;
    getRequestStatus(paymentReference: string, options?: RequestV1OperationOptions): Promise<RequestStatusResult>;
    sendPaymentIntent(paymentIntentId: string, body: SendPaymentIntentBody, options?: RequestV1OperationOptions): Promise<void>;
    stopRecurrence(paymentReference: string, options?: RequestV1OperationOptions): Promise<void>;
}
declare function createRequestsV1Api(http: HttpClient): RequestsV1Api;

type index$2_GetPaymentCalldataOptions = GetPaymentCalldataOptions;
type index$2_GetPaymentRoutesOptions = GetPaymentRoutesOptions;
type index$2_RequestStatusResult = RequestStatusResult;
type index$2_RequestV1OperationOptions = RequestV1OperationOptions;
type index$2_RequestsV1Api = RequestsV1Api;
type index$2_SendPaymentIntentBody = SendPaymentIntentBody;
declare const index$2_createRequestsV1Api: typeof createRequestsV1Api;
declare namespace index$2 {
  export { type index$2_GetPaymentCalldataOptions as GetPaymentCalldataOptions, type index$2_GetPaymentRoutesOptions as GetPaymentRoutesOptions, type index$2_RequestStatusResult as RequestStatusResult, type index$2_RequestV1OperationOptions as RequestV1OperationOptions, type index$2_RequestsV1Api as RequestsV1Api, type index$2_SendPaymentIntentBody as SendPaymentIntentBody, index$2_createRequestsV1Api as createRequestsV1Api };
}

type HeaderValue = string | number | boolean | null | undefined | string[];
type HeaderRecord = Record<string, HeaderValue>;
type WebhookHeaders = HeaderRecord | Headers;
type NormalisedHeaders = Record<string, string>;

declare const DEFAULT_SIGNATURE_HEADER = "x-request-network-signature";
declare const DEFAULT_SIGNATURE_ALGORITHM = "sha256";
interface VerifyWebhookSignatureOptions {
    readonly rawBody: ArrayBuffer | ArrayBufferView | string;
    readonly secret: string | readonly string[];
    readonly headers?: WebhookHeaders;
    readonly signature?: string;
    readonly headerName?: string;
    readonly toleranceMs?: number;
    readonly timestamp?: number;
    readonly timestampHeader?: string;
    readonly now?: () => number;
}
interface VerifyWebhookSignatureResult {
    /**
     * Normalised (lowercase hex) signature taken from the request.
     */
    signature: string;
    /**
     * Secret that successfully matched the signature. Useful for rotation.
     */
    matchedSecret: string;
    /**
     * Parsed timestamp in milliseconds (when provided).
     */
    timestamp: number | null;
    /**
     * Headers used during verification, normalised to lowercase keys.
     */
    headers: NormalisedHeaders;
}
declare function verifyWebhookSignature(options: VerifyWebhookSignatureOptions): VerifyWebhookSignatureResult;

var openapi = "3.1.0";
var info = {
	title: "Request Network Webhooks",
	version: "0.1.0",
	description: "Webhook events sent by the Request Network API to subscribed endpoints. Each request is signed with an HMAC-SHA256 hex digest in the `x-request-network-signature` header (computed over the raw JSON body using your webhook secret). This community-maintained spec currently models the documented events (`payment.confirmed`, `payment.failed`, `payment.processing`, `payment_detail.updated`, `compliance.updated`). Additional payment lifecycle events such as \"Payment Partial\" or \"Payment Refunded\" are not yet included because the official docs do not publish canonical identifiers or payload schemas for them."
};
var webhooks = {
	"payment.confirmed": {
		post: {
			summary: "Payment fully settled",
			description: "Sent when a payment is fully settled. In crypto-to-fiat flows, this follows a final `payment.processing` with `subStatus: fiat_sent`.",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaymentConfirmedEvent"
						},
						examples: {
							paymentConfirmed: {
								$ref: "#/components/examples/payment_confirmed"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"payment.failed": {
		post: {
			summary: "Payment or offramp failed",
			description: "Sent when a payment or crypto-to-fiat offramp fails.",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaymentFailedEvent"
						},
						examples: {
							paymentFailed: {
								$ref: "#/components/examples/payment_failed"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"payment.processing": {
		post: {
			summary: "Offramp in progress",
			description: "Sent as the crypto-to-fiat offramp progresses. The `subStatus` field indicates the current stage.",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaymentProcessingEvent"
						},
						examples: {
							paymentProcessing: {
								$ref: "#/components/examples/payment_processing"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"payment_detail.updated": {
		post: {
			summary: "Payment detail (bank account) status update",
			description: "Sent when payee payment details used for crypto-to-fiat are updated (approved/failed/pending).",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaymentDetailUpdatedEvent"
						},
						examples: {
							paymentDetailUpdated: {
								$ref: "#/components/examples/payment_detail_updated"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"compliance.updated": {
		post: {
			summary: "KYC/Agreement status update",
			description: "Sent when payer compliance statuses change (KYC or agreement).",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ComplianceUpdatedEvent"
						},
						examples: {
							complianceUpdated: {
								$ref: "#/components/examples/compliance_updated"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"payment.partial": {
		post: {
			summary: "Partial payment applied",
			description: "Sent when a request receives a partial payment.",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaymentPartialEvent"
						},
						examples: {
							payment_partial: {
								$ref: "#/components/examples/payment_partial"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"payment.refunded": {
		post: {
			summary: "Payment refunded",
			description: "Sent when Request issues a refund for a payment.",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaymentRefundedEvent"
						},
						examples: {
							payment_refunded: {
								$ref: "#/components/examples/payment_refunded"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	},
	"request.recurring": {
		post: {
			summary: "Recurring request created",
			description: "Sent when a new recurring request is generated from an existing request.",
			parameters: [
				{
					$ref: "#/components/parameters/XRequestNetworkSignature"
				}
			],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/RequestRecurringEvent"
						},
						examples: {
							request_recurring: {
								$ref: "#/components/examples/request_recurring"
							}
						}
					}
				}
			},
			responses: {
				"200": {
					description: "Acknowledged"
				},
				"401": {
					description: "Signature verification failed"
				}
			},
			security: [
				{
					RequestSignatureHMAC: [
					]
				}
			]
		}
	}
};
var components = {
	securitySchemes: {
		RequestSignatureHMAC: {
			type: "apiKey",
			"in": "header",
			name: "x-request-network-signature",
			description: "HMAC-SHA256 hex digest of the raw request body, generated with your webhook secret. Verify by recomputing the digest over the exact raw body and comparing in constant time."
		}
	},
	parameters: {
		XRequestNetworkSignature: {
			name: "x-request-network-signature",
			"in": "header",
			required: true,
			description: "HMAC-SHA256 signature of the raw JSON request body using your webhook secret. Hex-encoded.",
			schema: {
				type: "string"
			}
		}
	},
	schemas: {
		WebhookFeeItem: {
			type: "object",
			additionalProperties: false,
			properties: {
				type: {
					type: "string",
					description: "Fee type as provided in the webhook (example: \"network\")."
				},
				amount: {
					type: "string",
					description: "Human-readable amount as a string."
				},
				currency: {
					type: "string",
					description: "Currency code/symbol as provided (e.g., \"ETH\")."
				}
			},
			required: [
				"type",
				"amount",
				"currency"
			]
		},
		WebhookBase: {
			type: "object",
			additionalProperties: true,
			description: "Common fields observed in webhook payloads. Presence may vary by event.",
			properties: {
				event: {
					type: "string",
					description: "Event identifier string."
				},
				requestId: {
					type: "string",
					description: "Request identifier when applicable."
				},
				requestID: {
					type: "string",
					description: "Alias of requestId that may appear in some payloads."
				},
				paymentReference: {
					type: "string",
					description: "Opaque reference used to link blockchain transactions."
				},
				explorer: {
					type: "string",
					format: "uri",
					description: "Explorer URL for the request."
				},
				amount: {
					type: "string",
					description: "Paid amount (human-readable string)."
				},
				totalAmountPaid: {
					type: "string",
					description: "Total amount paid to date (human-readable string)."
				},
				expectedAmount: {
					type: "string",
					description: "Expected amount for the request (human-readable string)."
				},
				timestamp: {
					type: "string",
					format: "date-time",
					description: "RFC 3339 timestamp of the event."
				},
				txHash: {
					type: "string",
					description: "Blockchain transaction hash (if applicable)."
				},
				network: {
					type: "string",
					description: "Blockchain/network name (e.g., \"ethereum\")."
				},
				currency: {
					type: "string",
					description: "Invoice/request currency code."
				},
				paymentCurrency: {
					type: "string",
					description: "Currency actually used for payment."
				},
				isCryptoToFiat: {
					type: "boolean",
					description: "True if the payment used the crypto-to-fiat flow."
				},
				subStatus: {
					type: "string",
					description: "Additional state qualifier for some events."
				},
				paymentProcessor: {
					type: "string",
					description: "Payment processor identifier (example: \"request-network\")."
				},
				fees: {
					type: "array",
					items: {
						$ref: "#/components/schemas/WebhookFeeItem"
					}
				},
				rawPayload: {
					type: "object",
					description: "Raw provider payload forwarded by Request (structure varies per provider).",
					additionalProperties: true
				},
				clientUserId: {
					type: "string",
					description: "Client user identifier associated with the webhook when available."
				}
			},
			required: [
				"event"
			]
		},
		PaymentConfirmedEvent: {
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					additionalProperties: true,
					properties: {
						event: {
							"const": "payment.confirmed"
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Payment fully settled (fiat delivered for crypto-to-fiat)."
		},
		PaymentFailedEvent: {
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					additionalProperties: true,
					properties: {
						event: {
							"const": "payment.failed"
						},
						subStatus: {
							type: "string",
							"enum": [
								"failed",
								"bounced",
								"insufficient_funds"
							],
							description: "Additional failure detail when provided."
						},
						failureReason: {
							type: "string",
							description: "Human-readable reason explaining why the payment failed when provided."
						},
						retryAfter: {
							type: "string",
							description: "Suggested retry window (ISO timestamp or duration hint) when the failure is recoverable."
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Payment or offramp failed."
		},
		PaymentProcessingEvent: {
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					additionalProperties: true,
					properties: {
						event: {
							"const": "payment.processing"
						},
						subStatus: {
							type: "string",
							"enum": [
								"initiated",
								"pending_internal_assessment",
								"ongoing_checks",
								"sending_fiat",
								"fiat_sent",
								"bounced",
								"retry_required",
								"processing"
							],
							description: "Offramp processing stage."
						},
						rawPayload: {
							type: "object",
							additionalProperties: true,
							description: "Provider-specific payload describing the processing state."
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Offramp in progress; see subStatus for stage."
		},
		PaymentDetailUpdatedEvent: {
			type: "object",
			additionalProperties: true,
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					properties: {
						event: {
							"const": "payment_detail.updated"
						},
						status: {
							type: "string",
							"enum": [
								"approved",
								"failed",
								"pending",
								"verified"
							],
							description: "Status of the payment details (bank account) used for off-ramp."
						},
						paymentAccountId: {
							type: "string",
							description: "Identifier of the payment account whose status changed."
						},
						rejectionMessage: {
							type: "string",
							description: "Optional rejection message supplied when status is failed."
						},
						paymentDetailsId: {
							type: "string",
							description: "Identifier of the payment details record whose status changed."
						},
						rawPayload: {
							type: "object",
							additionalProperties: true,
							description: "Provider-specific payload attached to the event."
						}
					},
					required: [
						"event",
						"status"
					]
				}
			],
			description: "Payment detail (bank account) approval state change."
		},
		ComplianceUpdatedEvent: {
			type: "object",
			additionalProperties: true,
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					properties: {
						event: {
							"const": "compliance.updated"
						},
						kycStatus: {
							type: "string",
							"enum": [
								"initiated",
								"pending",
								"approved",
								"rejected",
								"failed"
							],
							description: "KYC review status (when applicable)."
						},
						agreementStatus: {
							type: "string",
							"enum": [
								"not_started",
								"pending",
								"completed",
								"rejected",
								"failed",
								"signed"
							],
							description: "Compliance agreement status (when applicable)."
						},
						clientUserId: {
							type: "string",
							description: "Platform-defined payer identifier referenced by `/payer` endpoints."
						},
						isCompliant: {
							type: "boolean",
							description: "True when the user currently satisfies compliance requirements."
						},
						rawPayload: {
							type: "object",
							additionalProperties: true,
							description: "Provider-specific compliance payload when forwarded by Request."
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Compliance (KYC/Agreement) update for a payer."
		},
		PaymentPartialEvent: {
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					additionalProperties: true,
					properties: {
						event: {
							"const": "payment.partial"
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Partial payment recorded for the request."
		},
		PaymentRefundedEvent: {
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					additionalProperties: true,
					properties: {
						event: {
							"const": "payment.refunded"
						},
						refundedTo: {
							type: "string",
							description: "Destination account or address that received the refund."
						},
						refundAmount: {
							type: "string",
							description: "Amount refunded (human-readable string)."
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Refund issued back to a sender or alternate destination."
		},
		RequestRecurringEvent: {
			allOf: [
				{
					$ref: "#/components/schemas/WebhookBase"
				},
				{
					type: "object",
					additionalProperties: true,
					properties: {
						event: {
							"const": "request.recurring"
						},
						originalRequestId: {
							type: "string",
							description: "Identifier of the original request that triggered the recurring event."
						},
						originalRequestPaymentReference: {
							type: "string",
							description: "Payment reference from the original request."
						}
					},
					required: [
						"event"
					]
				}
			],
			description: "Recurring request generated from an existing request."
		}
	},
	examples: {
		payment_confirmed: {
			summary: "Example from docs",
			value: {
				event: "payment.confirmed",
				requestId: "req_test123456789abcdef",
				requestID: "req_test123456789abcdef",
				paymentReference: "0x1234567890abcdef1234567890abcdef12345678",
				explorer: "https://scan.request.network/request/req_test123456789abcdef",
				amount: "100.0",
				totalAmountPaid: "100.0",
				expectedAmount: "100.0",
				timestamp: "2025-08-28T12:25:45.995Z",
				txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
				network: "ethereum",
				currency: "USDC",
				paymentCurrency: "USDC",
				isCryptoToFiat: false,
				paymentProcessor: "request-network",
				fees: [
					{
						type: "network",
						amount: "0.02",
						currency: "ETH"
					}
				]
			}
		},
		payment_failed: {
			summary: "Minimal failure example (fields vary by flow)",
			value: {
				event: "payment.failed",
				requestId: "01e273ecc29d4b526df3a0f1f05ffc59372af8752c2b678096e49ac270416a7cdb",
				subStatus: "failed",
				timestamp: "2025-10-10T12:34:56Z"
			}
		},
		payment_processing: {
			summary: "Offramp stage example",
			value: {
				event: "payment.processing",
				requestId: "01e273ecc29d4b526df3a0f1f05ffc59372af8752c2b678096e49ac270416a7cdb",
				subStatus: "processing",
				timestamp: "2025-10-10T12:35:10Z",
				isCryptoToFiat: true,
				rawPayload: {
					status: "processing"
				}
			}
		},
		payment_detail_updated: {
			summary: "Payment details approved",
			value: {
				event: "payment_detail.updated",
				status: "verified",
				timestamp: "2025-10-10T12:00:00Z",
				clientUserId: "user-123",
				paymentDetailsId: "pd_example",
				rawPayload: {
					bankAccount: "verified"
				}
			}
		},
		compliance_updated: {
			summary: "KYC and agreement status update",
			value: {
				event: "compliance.updated",
				clientUserId: "user-123",
				kycStatus: "approved",
				agreementStatus: "signed",
				timestamp: "2025-10-10T12:00:00Z",
				isCompliant: true
			}
		},
		payment_partial: {
			summary: "Partial payment received",
			value: {
				event: "payment.partial",
				requestId: "req_test123456789abcdef",
				paymentReference: "0x1234567890abcdef1234567890abcdef12345678",
				amount: "50.0",
				totalAmountPaid: "50.0",
				expectedAmount: "100.0",
				timestamp: "2025-11-04T05:19:59.380Z",
				paymentProcessor: "request-network",
				fees: [
				]
			}
		},
		payment_refunded: {
			summary: "Payment refunded",
			value: {
				event: "payment.refunded",
				requestId: "req_test123456789abcdef",
				paymentReference: "0x1234567890abcdef1234567890abcdef12345678",
				refundedTo: "0x742d35Cc6634C0532925a3b8D78Ecf23Ee6d63D4",
				refundAmount: "100.0",
				currency: "USDC",
				paymentProcessor: "request-network"
			}
		},
		request_recurring: {
			summary: "Recurring request created",
			value: {
				event: "request.recurring",
				requestId: "req_new123456789abcdef",
				paymentReference: "0x9876543210fedcba9876543210fedcba98765432",
				originalRequestId: "req_test123456789abcdef",
				originalRequestPaymentReference: "0x1234567890abcdef1234567890abcdef12345678",
				timestamp: "2025-11-04T05:21:22.149Z",
				paymentProcessor: "request-network"
			}
		}
	}
};
var requestNetworkWebhooks = {
	openapi: openapi,
	info: info,
	webhooks: webhooks,
	components: components
};

declare const _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_components: typeof components;
declare const _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_info: typeof info;
declare const _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_openapi: typeof openapi;
declare const _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_webhooks: typeof webhooks;
declare namespace _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json {
  export { _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_components as components, requestNetworkWebhooks as default, _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_info as info, _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_openapi as openapi, _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json_webhooks as webhooks };
}

type WebhookSpec = typeof _request_suite_request_client_contracts_specs_webhooks_request_network_webhooks_json;
type WebhookEventName = Extract<keyof WebhookSpec["webhooks"], string>;
declare const webhookEventSchemas: {
    readonly "payment.confirmed": z.ZodObject<{} & {
        event: z.ZodLiteral<"payment.confirmed">;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"payment.confirmed">;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"payment.confirmed">;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "payment.failed": z.ZodObject<{} & {
        event: z.ZodLiteral<"payment.failed">;
        subStatus: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        failureReason: z.ZodOptional<z.ZodString>;
        retryAfter: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"payment.failed">;
        subStatus: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        failureReason: z.ZodOptional<z.ZodString>;
        retryAfter: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"payment.failed">;
        subStatus: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        failureReason: z.ZodOptional<z.ZodString>;
        retryAfter: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "payment.processing": z.ZodObject<{} & {
        event: z.ZodLiteral<"payment.processing">;
        subStatus: z.ZodEnum<[string, ...string[]]>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"payment.processing">;
        subStatus: z.ZodEnum<[string, ...string[]]>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"payment.processing">;
        subStatus: z.ZodEnum<[string, ...string[]]>;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "payment_detail.updated": z.ZodObject<{} & {
        event: z.ZodLiteral<"payment_detail.updated">;
        status: z.ZodEnum<[string, ...string[]]>;
        paymentDetailsId: z.ZodOptional<z.ZodString>;
        paymentAccountId: z.ZodOptional<z.ZodString>;
        rejectionMessage: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"payment_detail.updated">;
        status: z.ZodEnum<[string, ...string[]]>;
        paymentDetailsId: z.ZodOptional<z.ZodString>;
        paymentAccountId: z.ZodOptional<z.ZodString>;
        rejectionMessage: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"payment_detail.updated">;
        status: z.ZodEnum<[string, ...string[]]>;
        paymentDetailsId: z.ZodOptional<z.ZodString>;
        paymentAccountId: z.ZodOptional<z.ZodString>;
        rejectionMessage: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "compliance.updated": z.ZodObject<{} & {
        event: z.ZodLiteral<"compliance.updated">;
        kycStatus: z.ZodOptional<z.ZodEnum<["not_started" | "pending" | "completed" | "initiated" | "failed" | "approved" | "rejected", ...("not_started" | "pending" | "completed" | "initiated" | "failed" | "approved" | "rejected")[]]>>;
        agreementStatus: z.ZodOptional<z.ZodEnum<["not_started" | "pending" | "signed" | "completed" | "failed" | "rejected", ...("not_started" | "pending" | "signed" | "completed" | "failed" | "rejected")[]]>>;
        isCompliant: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"compliance.updated">;
        kycStatus: z.ZodOptional<z.ZodEnum<["not_started" | "pending" | "completed" | "initiated" | "failed" | "approved" | "rejected", ...("not_started" | "pending" | "completed" | "initiated" | "failed" | "approved" | "rejected")[]]>>;
        agreementStatus: z.ZodOptional<z.ZodEnum<["not_started" | "pending" | "signed" | "completed" | "failed" | "rejected", ...("not_started" | "pending" | "signed" | "completed" | "failed" | "rejected")[]]>>;
        isCompliant: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"compliance.updated">;
        kycStatus: z.ZodOptional<z.ZodEnum<["not_started" | "pending" | "completed" | "initiated" | "failed" | "approved" | "rejected", ...("not_started" | "pending" | "completed" | "initiated" | "failed" | "approved" | "rejected")[]]>>;
        agreementStatus: z.ZodOptional<z.ZodEnum<["not_started" | "pending" | "signed" | "completed" | "failed" | "rejected", ...("not_started" | "pending" | "signed" | "completed" | "failed" | "rejected")[]]>>;
        isCompliant: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "payment.partial": z.ZodObject<{} & {
        event: z.ZodLiteral<"payment.partial">;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"payment.partial">;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"payment.partial">;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "payment.refunded": z.ZodObject<{} & {
        event: z.ZodLiteral<"payment.refunded">;
        refundedTo: z.ZodString;
        refundAmount: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"payment.refunded">;
        refundedTo: z.ZodString;
        refundAmount: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"payment.refunded">;
        refundedTo: z.ZodString;
        refundAmount: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
    readonly "request.recurring": z.ZodObject<{} & {
        event: z.ZodLiteral<"request.recurring">;
        originalRequestId: z.ZodString;
        originalRequestPaymentReference: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{} & {
        event: z.ZodLiteral<"request.recurring">;
        originalRequestId: z.ZodString;
        originalRequestPaymentReference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{} & {
        event: z.ZodLiteral<"request.recurring">;
        originalRequestId: z.ZodString;
        originalRequestPaymentReference: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
};
type WebhookEventSchemaMap = typeof webhookEventSchemas;
type WebhookEventSchema<E extends WebhookEventName = WebhookEventName> = WebhookEventSchemaMap[E];
type WebhookPayloadMap = {
    [E in WebhookEventName]: z.infer<WebhookEventSchema<E>>;
};
type WebhookPayload<E extends WebhookEventName = WebhookEventName> = WebhookPayloadMap[E];
declare const WEBHOOK_EVENT_NAMES: readonly WebhookEventName[];
declare function getWebhookSchema<E extends WebhookEventName>(event: E): WebhookEventSchema<E> | undefined;

interface ParseWebhookEventOptions {
    readonly rawBody: ArrayBuffer | ArrayBufferView | string;
    readonly headers: WebhookHeaders;
    readonly secret: string | readonly string[];
    readonly headerName?: string;
    readonly signature?: string;
    readonly toleranceMs?: number;
    readonly timestampHeader?: string;
    readonly now?: () => number;
    readonly skipSignatureVerification?: boolean;
}
interface ParsedWebhookEvent<E extends WebhookEventName = WebhookEventName> {
    readonly event: E;
    readonly payload: WebhookPayload<E>;
    readonly signature: string | null;
    readonly matchedSecret: string | null;
    readonly timestamp: number | null;
    readonly rawBody: Uint8Array;
    readonly headers: NormalisedHeaders;
}
declare function parseWebhookEvent<E extends WebhookEventName = WebhookEventName>(options: ParseWebhookEventOptions): ParsedWebhookEvent<E>;

type WebhookSignatureErrorReason = "missing_signature" | "invalid_format" | "invalid_signature" | "tolerance_exceeded";
interface RequestWebhookSignatureErrorOptions {
    readonly headerName: string;
    readonly signature?: string | null;
    readonly timestamp?: number | null;
    readonly reason: WebhookSignatureErrorReason;
    readonly cause?: unknown;
}
/**
 * Error thrown when webhook signature verification fails.
 * Consumers can narrow on this error to differentiate between auth failures
 * and downstream application exceptions.
 */
declare class RequestWebhookSignatureError extends Error {
    static readonly code = "ERR_REQUEST_WEBHOOK_SIGNATURE_VERIFICATION_FAILED";
    readonly code = "ERR_REQUEST_WEBHOOK_SIGNATURE_VERIFICATION_FAILED";
    readonly statusCode = 401;
    readonly headerName: string;
    readonly signature?: string | null;
    readonly timestamp?: number | null;
    readonly reason: WebhookSignatureErrorReason;
    constructor(message: string, options: RequestWebhookSignatureErrorOptions);
}
declare function isRequestWebhookSignatureError(error: unknown): error is RequestWebhookSignatureError;

type WebhookDispatchContext = Record<string, unknown>;
type WebhookHandler<E extends WebhookEventName = WebhookEventName> = (event: ParsedWebhookEvent<E>, context: WebhookDispatchContext) => void | Promise<void>;
declare class WebhookDispatcher {
    private readonly handlers;
    on<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): () => void;
    once<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): () => void;
    off<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): void;
    clear(): void;
    handlerCount(event?: WebhookEventName): number;
    dispatch<E extends WebhookEventName>(event: ParsedWebhookEvent<E>, context?: WebhookDispatchContext): Promise<void>;
    /**
     * Syntactic sugar for strongly typed handler registration that returns the original handler for chaining.
     */
    register<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): WebhookHandler<E>;
}
declare function createWebhookDispatcher(): WebhookDispatcher;
type InferDispatcherPayload<T extends WebhookEventName> = WebhookPayload<T>;

// This extracts the core definitions from express to prevent a circular dependency between express and serve-static



declare global {
    namespace Express {
        // These open interfaces may be extended in an application-specific manner via declaration merging.
        // See for example method-override.d.ts (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
        interface Request {}
        interface Response {}
        interface Locals {}
        interface Application {}
    }
}


interface NextFunction {
    (err?: any): void;
    /**
     * "Break-out" of a router by calling {next('router')};
     * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.router}
     */
    (deferToNext: "router"): void;
    /**
     * "Break-out" of a route by calling {next('route')};
     * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.application}
     */
    (deferToNext: "route"): void;
}

interface ParamsDictionary {
    [key: string]: string;
}

interface Locals extends Express.Locals {}

interface RequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> {
    // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2)
    (
        req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
        res: Response<ResBody, LocalsObj>,
        next: NextFunction,
    ): void;
}

type ErrorRequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> = (
    err: any,
    req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
    res: Response<ResBody, LocalsObj>,
    next: NextFunction,
) => void;

type PathParams = string | RegExp | Array<string | RegExp>;

type RequestHandlerParams<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> =
    | RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>
    | ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>
    | Array<RequestHandler<P> | ErrorRequestHandler<P>>;

type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;
type GetRouteParameter<S extends string> = RemoveTail<
    RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
    `.${string}`
>;

// prettier-ignore
type RouteParameters<Route extends string> = string extends Route ? ParamsDictionary
    : Route extends `${string}(${string}` ? ParamsDictionary // TODO: handling for regex parameters
    : Route extends `${string}:${infer Rest}` ?
            & (
                GetRouteParameter<Rest> extends never ? ParamsDictionary
                    : GetRouteParameter<Rest> extends `${infer ParamName}?` ? { [P in ParamName]?: string }
                    : { [P in GetRouteParameter<Rest>]: string }
            )
            & (Rest extends `${GetRouteParameter<Rest>}${infer Next}` ? RouteParameters<Next> : unknown)
    : {};

/* eslint-disable @definitelytyped/no-unnecessary-generics */
interface IRouterMatcher<
    T,
    Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
> {
    <
        Route extends string,
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (it's used as the default type parameter for P)
        path: Route,
        // (This generic is meant to be passed explicitly.)
        ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        Path extends string,
        P = RouteParameters<Path>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (it's used as the default type parameter for P)
        path: Path,
        // (This generic is meant to be passed explicitly.)
        ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        path: PathParams,
        // (This generic is meant to be passed explicitly.)
        ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        path: PathParams,
        // (This generic is meant to be passed explicitly.)
        ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    (path: PathParams, subApplication: Application): T;
}

interface IRouterHandler<T, Route extends string = string> {
    (...handlers: Array<RequestHandler<RouteParameters<Route>>>): T;
    (...handlers: Array<RequestHandlerParams<RouteParameters<Route>>>): T;
    <
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (This generic is meant to be passed explicitly.)
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (This generic is meant to be passed explicitly.)
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (This generic is meant to be passed explicitly.)
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (This generic is meant to be passed explicitly.)
        // eslint-disable-next-line @definitelytyped/no-unnecessary-generics
        ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
}
/* eslint-enable @definitelytyped/no-unnecessary-generics */

interface IRouter extends RequestHandler {
    /**
     * Map the given param placeholder `name`(s) to the given callback(s).
     *
     * Parameter mapping is used to provide pre-conditions to routes
     * which use normalized placeholders. For example a _:user_id_ parameter
     * could automatically load a user's information from the database without
     * any additional code,
     *
     * The callback uses the samesignature as middleware, the only differencing
     * being that the value of the placeholder is passed, in this case the _id_
     * of the user. Once the `next()` function is invoked, just like middleware
     * it will continue on to execute the route, or subsequent parameter functions.
     *
     *      app.param('user_id', function(req, res, next, id){
     *        User.find(id, function(err, user){
     *          if (err) {
     *            next(err);
     *          } else if (user) {
     *            req.user = user;
     *            next();
     *          } else {
     *            next(new Error('failed to load user'));
     *          }
     *        });
     *      });
     */
    param(name: string, handler: RequestParamHandler): this;

    /**
     * Alternatively, you can pass only a callback, in which case you have the opportunity to alter the app.param()
     *
     * @deprecated since version 4.11
     */
    param(callback: (name: string, matcher: RegExp) => RequestParamHandler): this;

    /**
     * Special-cased "all" method, applying the given route `path`,
     * middleware, and callback to _every_ HTTP method.
     */
    all: IRouterMatcher<this, "all">;
    get: IRouterMatcher<this, "get">;
    post: IRouterMatcher<this, "post">;
    put: IRouterMatcher<this, "put">;
    delete: IRouterMatcher<this, "delete">;
    patch: IRouterMatcher<this, "patch">;
    options: IRouterMatcher<this, "options">;
    head: IRouterMatcher<this, "head">;

    checkout: IRouterMatcher<this>;
    connect: IRouterMatcher<this>;
    copy: IRouterMatcher<this>;
    lock: IRouterMatcher<this>;
    merge: IRouterMatcher<this>;
    mkactivity: IRouterMatcher<this>;
    mkcol: IRouterMatcher<this>;
    move: IRouterMatcher<this>;
    "m-search": IRouterMatcher<this>;
    notify: IRouterMatcher<this>;
    propfind: IRouterMatcher<this>;
    proppatch: IRouterMatcher<this>;
    purge: IRouterMatcher<this>;
    report: IRouterMatcher<this>;
    search: IRouterMatcher<this>;
    subscribe: IRouterMatcher<this>;
    trace: IRouterMatcher<this>;
    unlock: IRouterMatcher<this>;
    unsubscribe: IRouterMatcher<this>;
    link: IRouterMatcher<this>;
    unlink: IRouterMatcher<this>;

    use: IRouterHandler<this> & IRouterMatcher<this>;

    route<T extends string>(prefix: T): IRoute<T>;
    route(prefix: PathParams): IRoute;
    /**
     * Stack of configured routes
     */
    stack: ILayer[];
}

interface ILayer {
    route?: IRoute;
    name: string | "<anonymous>";
    params?: Record<string, any>;
    keys: string[];
    path?: string;
    method: string;
    regexp: RegExp;
    handle: (req: Request, res: Response, next: NextFunction) => any;
}

interface IRoute<Route extends string = string> {
    path: string;
    stack: ILayer[];
    all: IRouterHandler<this, Route>;
    get: IRouterHandler<this, Route>;
    post: IRouterHandler<this, Route>;
    put: IRouterHandler<this, Route>;
    delete: IRouterHandler<this, Route>;
    patch: IRouterHandler<this, Route>;
    options: IRouterHandler<this, Route>;
    head: IRouterHandler<this, Route>;

    checkout: IRouterHandler<this, Route>;
    copy: IRouterHandler<this, Route>;
    lock: IRouterHandler<this, Route>;
    merge: IRouterHandler<this, Route>;
    mkactivity: IRouterHandler<this, Route>;
    mkcol: IRouterHandler<this, Route>;
    move: IRouterHandler<this, Route>;
    "m-search": IRouterHandler<this, Route>;
    notify: IRouterHandler<this, Route>;
    purge: IRouterHandler<this, Route>;
    report: IRouterHandler<this, Route>;
    search: IRouterHandler<this, Route>;
    subscribe: IRouterHandler<this, Route>;
    trace: IRouterHandler<this, Route>;
    unlock: IRouterHandler<this, Route>;
    unsubscribe: IRouterHandler<this, Route>;
}

/**
 * Options passed down into `res.cookie`
 * @link https://expressjs.com/en/api.html#res.cookie
 */
interface CookieOptions {
    /** Convenient option for setting the expiry time relative to the current time in **milliseconds**. */
    maxAge?: number | undefined;
    /** Indicates if the cookie should be signed. */
    signed?: boolean | undefined;
    /** Expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie. */
    expires?: Date | undefined;
    /** Flags the cookie to be accessible only by the web server. */
    httpOnly?: boolean | undefined;
    /** Path for the cookie. Defaults to “/”. */
    path?: string | undefined;
    /** Domain name for the cookie. Defaults to the domain name of the app. */
    domain?: string | undefined;
    /** Marks the cookie to be used with HTTPS only. */
    secure?: boolean | undefined;
    /** A synchronous function used for cookie value encoding. Defaults to encodeURIComponent. */
    encode?: ((val: string) => string) | undefined;
    /**
     * Value of the “SameSite” Set-Cookie attribute.
     * @link https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1.
     */
    sameSite?: boolean | "lax" | "strict" | "none" | undefined;
    /**
     * Value of the “Priority” Set-Cookie attribute.
     * @link https://datatracker.ietf.org/doc/html/draft-west-cookie-priority-00#section-4.3
     */
    priority?: "low" | "medium" | "high";
    /** Marks the cookie to use partioned storage. */
    partitioned?: boolean | undefined;
}

type Errback = (err: Error) => void;

/**
 * @param P  For most requests, this should be `ParamsDictionary`, but if you're
 * using this in a route handler for a route that uses a `RegExp` or a wildcard
 * `string` path (e.g. `'/user/*'`), then `req.params` will be an array, in
 * which case you should use `ParamsArray` instead.
 *
 * @see https://expressjs.com/en/api.html#req.params
 *
 * @example
 *     app.get('/user/:id', (req, res) => res.send(req.params.id)); // implicitly `ParamsDictionary`
 *     app.get<ParamsArray>(/user\/(.*)/, (req, res) => res.send(req.params[0]));
 *     app.get<ParamsArray>('/user/*', (req, res) => res.send(req.params[0]));
 */
interface Request<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> extends http.IncomingMessage, Express.Request {
    /**
     * Return request header.
     *
     * The `Referrer` header field is special-cased,
     * both `Referrer` and `Referer` are interchangeable.
     *
     * Examples:
     *
     *     req.get('Content-Type');
     *     // => "text/plain"
     *
     *     req.get('content-type');
     *     // => "text/plain"
     *
     *     req.get('Something');
     *     // => undefined
     *
     * Aliased as `req.header()`.
     */
    get(name: "set-cookie"): string[] | undefined;
    get(name: string): string | undefined;

    header(name: "set-cookie"): string[] | undefined;
    header(name: string): string | undefined;

    /**
     * Check if the given `type(s)` is acceptable, returning
     * the best match when true, otherwise `undefined`, in which
     * case you should respond with 406 "Not Acceptable".
     *
     * The `type` value may be a single mime type string
     * such as "application/json", the extension name
     * such as "json", a comma-delimted list such as "json, html, text/plain",
     * or an array `["json", "html", "text/plain"]`. When a list
     * or array is given the _best_ match, if any is returned.
     *
     * Examples:
     *
     *     // Accept: text/html
     *     req.accepts('html');
     *     // => "html"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('html');
     *     // => "html"
     *     req.accepts('text/html');
     *     // => "text/html"
     *     req.accepts('json, text');
     *     // => "json"
     *     req.accepts('application/json');
     *     // => "application/json"
     *
     *     // Accept: text/*, application/json
     *     req.accepts('image/png');
     *     req.accepts('png');
     *     // => false
     *
     *     // Accept: text/*;q=.5, application/json
     *     req.accepts(['html', 'json']);
     *     req.accepts('html, json');
     *     // => "json"
     */
    accepts(): string[];
    accepts(type: string): string | false;
    accepts(type: string[]): string | false;
    accepts(...type: string[]): string | false;

    /**
     * Returns the first accepted charset of the specified character sets,
     * based on the request's Accept-Charset HTTP header field.
     * If none of the specified charsets is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    acceptsCharsets(): string[];
    acceptsCharsets(charset: string): string | false;
    acceptsCharsets(charset: string[]): string | false;
    acceptsCharsets(...charset: string[]): string | false;

    /**
     * Returns the first accepted encoding of the specified encodings,
     * based on the request's Accept-Encoding HTTP header field.
     * If none of the specified encodings is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    acceptsEncodings(): string[];
    acceptsEncodings(encoding: string): string | false;
    acceptsEncodings(encoding: string[]): string | false;
    acceptsEncodings(...encoding: string[]): string | false;

    /**
     * Returns the first accepted language of the specified languages,
     * based on the request's Accept-Language HTTP header field.
     * If none of the specified languages is accepted, returns false.
     *
     * For more information, or if you have issues or concerns, see accepts.
     */
    acceptsLanguages(): string[];
    acceptsLanguages(lang: string): string | false;
    acceptsLanguages(lang: string[]): string | false;
    acceptsLanguages(...lang: string[]): string | false;

    /**
     * Parse Range header field, capping to the given `size`.
     *
     * Unspecified ranges such as "0-" require knowledge of your resource length. In
     * the case of a byte range this is of course the total number of bytes.
     * If the Range header field is not given `undefined` is returned.
     * If the Range header field is given, return value is a result of range-parser.
     * See more ./types/range-parser/index.d.ts
     *
     * NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
     * should respond with 4 users when available, not 3.
     */
    range(size: number, options?: Options): Ranges | Result | undefined;

    /**
     * Return an array of Accepted media types
     * ordered from highest quality to lowest.
     */
    accepted: MediaType[];

    /**
     * @deprecated since 4.11 Use either req.params, req.body or req.query, as applicable.
     *
     * Return the value of param `name` when present or `defaultValue`.
     *
     *  - Checks route placeholders, ex: _/user/:id_
     *  - Checks body params, ex: id=12, {"id":12}
     *  - Checks query string params, ex: ?id=12
     *
     * To utilize request bodies, `req.body`
     * should be an object. This can be done by using
     * the `connect.bodyParser()` middleware.
     */
    param(name: string, defaultValue?: any): string;

    /**
     * Check if the incoming request contains the "Content-Type"
     * header field, and it contains the give mime `type`.
     *
     * Examples:
     *
     *      // With Content-Type: text/html; charset=utf-8
     *      req.is('html');
     *      req.is('text/html');
     *      req.is('text/*');
     *      // => true
     *
     *      // When Content-Type is application/json
     *      req.is('json');
     *      req.is('application/json');
     *      req.is('application/*');
     *      // => true
     *
     *      req.is('html');
     *      // => false
     */
    is(type: string | string[]): string | false | null;

    /**
     * Return the protocol string "http" or "https"
     * when requested with TLS. When the "trust proxy"
     * setting is enabled the "X-Forwarded-Proto" header
     * field will be trusted. If you're running behind
     * a reverse proxy that supplies https for you this
     * may be enabled.
     */
    readonly protocol: string;

    /**
     * Short-hand for:
     *
     *    req.protocol == 'https'
     */
    readonly secure: boolean;

    /**
     * Return the remote address, or when
     * "trust proxy" is `true` return
     * the upstream addr.
     *
     * Value may be undefined if the `req.socket` is destroyed
     * (for example, if the client disconnected).
     */
    readonly ip: string | undefined;

    /**
     * When "trust proxy" is `true`, parse
     * the "X-Forwarded-For" ip address list.
     *
     * For example if the value were "client, proxy1, proxy2"
     * you would receive the array `["client", "proxy1", "proxy2"]`
     * where "proxy2" is the furthest down-stream.
     */
    readonly ips: string[];

    /**
     * Return subdomains as an array.
     *
     * Subdomains are the dot-separated parts of the host before the main domain of
     * the app. By default, the domain of the app is assumed to be the last two
     * parts of the host. This can be changed by setting "subdomain offset".
     *
     * For example, if the domain is "tobi.ferrets.example.com":
     * If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
     * If "subdomain offset" is 3, req.subdomains is `["tobi"]`.
     */
    readonly subdomains: string[];

    /**
     * Short-hand for `url.parse(req.url).pathname`.
     */
    readonly path: string;

    /**
     * Parse the "Host" header field hostname.
     */
    readonly hostname: string;

    /**
     * @deprecated Use hostname instead.
     */
    readonly host: string;

    /**
     * Check if the request is fresh, aka
     * Last-Modified and/or the ETag
     * still match.
     */
    readonly fresh: boolean;

    /**
     * Check if the request is stale, aka
     * "Last-Modified" and / or the "ETag" for the
     * resource has changed.
     */
    readonly stale: boolean;

    /**
     * Check if the request was an _XMLHttpRequest_.
     */
    readonly xhr: boolean;

    // body: { username: string; password: string; remember: boolean; title: string; };
    body: ReqBody;

    // cookies: { string; remember: boolean; };
    cookies: any;

    method: string;

    params: P;

    query: ReqQuery;

    route: any;

    signedCookies: any;

    originalUrl: string;

    url: string;

    baseUrl: string;

    app: Application;

    /**
     * After middleware.init executed, Request will contain res and next properties
     * See: express/lib/middleware/init.js
     */
    res?: Response<ResBody, LocalsObj> | undefined;
    next?: NextFunction | undefined;
}

interface MediaType {
    value: string;
    quality: number;
    type: string;
    subtype: string;
}

type Send<ResBody = any, T = Response<ResBody>> = (body?: ResBody) => T;

interface SendFileOptions extends SendOptions {
    /** Object containing HTTP headers to serve with the file. */
    headers?: Record<string, unknown>;
}

interface DownloadOptions extends SendOptions {
    /** Object containing HTTP headers to serve with the file. The header `Content-Disposition` will be overridden by the filename argument. */
    headers?: Record<string, unknown>;
}

interface Response<
    ResBody = any,
    LocalsObj extends Record<string, any> = Record<string, any>,
    StatusCode extends number = number,
> extends http.ServerResponse, Express.Response {
    /**
     * Set status `code`.
     */
    status(code: StatusCode): this;

    /**
     * Set the response HTTP status code to `statusCode` and send its string representation as the response body.
     * @link http://expressjs.com/4x/api.html#res.sendStatus
     *
     * Examples:
     *
     *    res.sendStatus(200); // equivalent to res.status(200).send('OK')
     *    res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
     *    res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
     *    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
     */
    sendStatus(code: StatusCode): this;

    /**
     * Set Link header field with the given `links`.
     *
     * Examples:
     *
     *    res.links({
     *      next: 'http://api.example.com/users?page=2',
     *      last: 'http://api.example.com/users?page=5'
     *    });
     */
    links(links: any): this;

    /**
     * Send a response.
     *
     * Examples:
     *
     *     res.send(new Buffer('wahoo'));
     *     res.send({ some: 'json' });
     *     res.send('<p>some html</p>');
     *     res.status(404).send('Sorry, cant find that');
     */
    send: Send<ResBody, this>;

    /**
     * Send JSON response.
     *
     * Examples:
     *
     *     res.json(null);
     *     res.json({ user: 'tj' });
     *     res.status(500).json('oh noes!');
     *     res.status(404).json('I dont have that');
     */
    json: Send<ResBody, this>;

    /**
     * Send JSON response with JSONP callback support.
     *
     * Examples:
     *
     *     res.jsonp(null);
     *     res.jsonp({ user: 'tj' });
     *     res.status(500).jsonp('oh noes!');
     *     res.status(404).jsonp('I dont have that');
     */
    jsonp: Send<ResBody, this>;

    /**
     * Transfer the file at the given `path`.
     *
     * Automatically sets the _Content-Type_ response header field.
     * The callback `fn(err)` is invoked when the transfer is complete
     * or when an error occurs. Be sure to check `res.headersSent`
     * if you wish to attempt responding, as the header and some data
     * may have already been transferred.
     *
     * Options:
     *
     *   - `maxAge`   defaulting to 0 (can be string converted by `ms`)
     *   - `root`     root directory for relative filenames
     *   - `headers`  object of headers to serve with file
     *   - `dotfiles` serve dotfiles, defaulting to false; can be `"allow"` to send them
     *
     * Other options are passed along to `send`.
     *
     * Examples:
     *
     *  The following example illustrates how `res.sendFile()` may
     *  be used as an alternative for the `static()` middleware for
     *  dynamic situations. The code backing `res.sendFile()` is actually
     *  the same code, so HTTP cache support etc is identical.
     *
     *     app.get('/user/:uid/photos/:file', function(req, res){
     *       var uid = req.params.uid
     *         , file = req.params.file;
     *
     *       req.user.mayViewFilesFrom(uid, function(yes){
     *         if (yes) {
     *           res.sendFile('/uploads/' + uid + '/' + file);
     *         } else {
     *           res.send(403, 'Sorry! you cant see that.');
     *         }
     *       });
     *     });
     *
     * @api public
     */
    sendFile(path: string, fn?: Errback): void;
    sendFile(path: string, options: SendFileOptions, fn?: Errback): void;

    /**
     * @deprecated Use sendFile instead.
     */
    sendfile(path: string): void;
    /**
     * @deprecated Use sendFile instead.
     */
    sendfile(path: string, options: SendFileOptions): void;
    /**
     * @deprecated Use sendFile instead.
     */
    sendfile(path: string, fn: Errback): void;
    /**
     * @deprecated Use sendFile instead.
     */
    sendfile(path: string, options: SendFileOptions, fn: Errback): void;

    /**
     * Transfer the file at the given `path` as an attachment.
     *
     * Optionally providing an alternate attachment `filename`,
     * and optional callback `fn(err)`. The callback is invoked
     * when the data transfer is complete, or when an error has
     * ocurred. Be sure to check `res.headersSent` if you plan to respond.
     *
     * The optional options argument passes through to the underlying
     * res.sendFile() call, and takes the exact same parameters.
     *
     * This method uses `res.sendfile()`.
     */
    download(path: string, fn?: Errback): void;
    download(path: string, filename: string, fn?: Errback): void;
    download(path: string, filename: string, options: DownloadOptions, fn?: Errback): void;

    /**
     * Set _Content-Type_ response header with `type` through `mime.lookup()`
     * when it does not contain "/", or set the Content-Type to `type` otherwise.
     *
     * Examples:
     *
     *     res.type('.html');
     *     res.type('html');
     *     res.type('json');
     *     res.type('application/json');
     *     res.type('png');
     */
    contentType(type: string): this;

    /**
     * Set _Content-Type_ response header with `type` through `mime.lookup()`
     * when it does not contain "/", or set the Content-Type to `type` otherwise.
     *
     * Examples:
     *
     *     res.type('.html');
     *     res.type('html');
     *     res.type('json');
     *     res.type('application/json');
     *     res.type('png');
     */
    type(type: string): this;

    /**
     * Respond to the Acceptable formats using an `obj`
     * of mime-type callbacks.
     *
     * This method uses `req.accepted`, an array of
     * acceptable types ordered by their quality values.
     * When "Accept" is not present the _first_ callback
     * is invoked, otherwise the first match is used. When
     * no match is performed the server responds with
     * 406 "Not Acceptable".
     *
     * Content-Type is set for you, however if you choose
     * you may alter this within the callback using `res.type()`
     * or `res.set('Content-Type', ...)`.
     *
     *    res.format({
     *      'text/plain': function(){
     *        res.send('hey');
     *      },
     *
     *      'text/html': function(){
     *        res.send('<p>hey</p>');
     *      },
     *
     *      'appliation/json': function(){
     *        res.send({ message: 'hey' });
     *      }
     *    });
     *
     * In addition to canonicalized MIME types you may
     * also use extnames mapped to these types:
     *
     *    res.format({
     *      text: function(){
     *        res.send('hey');
     *      },
     *
     *      html: function(){
     *        res.send('<p>hey</p>');
     *      },
     *
     *      json: function(){
     *        res.send({ message: 'hey' });
     *      }
     *    });
     *
     * By default Express passes an `Error`
     * with a `.status` of 406 to `next(err)`
     * if a match is not made. If you provide
     * a `.default` callback it will be invoked
     * instead.
     */
    format(obj: any): this;

    /**
     * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
     */
    attachment(filename?: string): this;

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    res.set('Foo', ['bar', 'baz']);
     *    res.set('Accept', 'application/json');
     *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * Aliased as `res.header()`.
     */
    set(field: any): this;
    set(field: string, value?: string | string[]): this;

    header(field: any): this;
    header(field: string, value?: string | string[]): this;

    // Property indicating if HTTP headers has been sent for the response.
    headersSent: boolean;

    /** Get value for header `field`. */
    get(field: string): string | undefined;

    /** Clear cookie `name`. */
    clearCookie(name: string, options?: CookieOptions): this;

    /**
     * Set cookie `name` to `val`, with the given `options`.
     *
     * Options:
     *
     *    - `maxAge`   max-age in milliseconds, converted to `expires`
     *    - `signed`   sign the cookie
     *    - `path`     defaults to "/"
     *
     * Examples:
     *
     *    // "Remember Me" for 15 minutes
     *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
     *
     *    // save as above
     *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
     */
    cookie(name: string, val: string, options: CookieOptions): this;
    cookie(name: string, val: any, options: CookieOptions): this;
    cookie(name: string, val: any): this;

    /**
     * Set the location header to `url`.
     *
     * The given `url` can also be the name of a mapped url, for
     * example by default express supports "back" which redirects
     * to the _Referrer_ or _Referer_ headers or "/".
     *
     * Examples:
     *
     *    res.location('/foo/bar').;
     *    res.location('http://example.com');
     *    res.location('../login'); // /blog/post/1 -> /blog/login
     *
     * Mounting:
     *
     *   When an application is mounted and `res.location()`
     *   is given a path that does _not_ lead with "/" it becomes
     *   relative to the mount-point. For example if the application
     *   is mounted at "/blog", the following would become "/blog/login".
     *
     *      res.location('login');
     *
     *   While the leading slash would result in a location of "/login":
     *
     *      res.location('/login');
     */
    location(url: string): this;

    /**
     * Redirect to the given `url` with optional response `status`
     * defaulting to 302.
     *
     * The resulting `url` is determined by `res.location()`, so
     * it will play nicely with mounted apps, relative paths,
     * `"back"` etc.
     *
     * Examples:
     *
     *    res.redirect('back');
     *    res.redirect('/foo/bar');
     *    res.redirect('http://example.com');
     *    res.redirect(301, 'http://example.com');
     *    res.redirect('http://example.com', 301);
     *    res.redirect('../login'); // /blog/post/1 -> /blog/login
     */
    redirect(url: string): void;
    redirect(status: number, url: string): void;
    /** @deprecated use res.redirect(status, url) instead */
    redirect(url: string, status: number): void;

    /**
     * Render `view` with the given `options` and optional callback `fn`.
     * When a callback function is given a response will _not_ be made
     * automatically, otherwise a response of _200_ and _text/html_ is given.
     *
     * Options:
     *
     *  - `cache`     boolean hinting to the engine it should cache
     *  - `filename`  filename of the view being rendered
     */
    render(view: string, options?: object, callback?: (err: Error, html: string) => void): void;
    render(view: string, callback?: (err: Error, html: string) => void): void;

    locals: LocalsObj & Locals;

    charset: string;

    /**
     * Adds the field to the Vary response header, if it is not there already.
     * Examples:
     *
     *     res.vary('User-Agent').render('docs');
     */
    vary(field: string): this;

    app: Application;

    /**
     * Appends the specified value to the HTTP response header field.
     * If the header is not already set, it creates the header with the specified value.
     * The value parameter can be a string or an array.
     *
     * Note: calling res.set() after res.append() will reset the previously-set header value.
     *
     * @since 4.11.0
     */
    append(field: string, value?: string[] | string): this;

    /**
     * After middleware.init executed, Response will contain req property
     * See: express/lib/middleware/init.js
     */
    req: Request;
}

type RequestParamHandler = (req: Request, res: Response, next: NextFunction, value: any, name: string) => any;

type ApplicationRequestHandler<T> =
    & IRouterHandler<T>
    & IRouterMatcher<T>
    & ((...handlers: RequestHandlerParams[]) => T);

interface Application<
    LocalsObj extends Record<string, any> = Record<string, any>,
> extends EventEmitter, IRouter, Express.Application {
    /**
     * Express instance itself is a request handler, which could be invoked without
     * third argument.
     */
    (req: Request | http.IncomingMessage, res: Response | http.ServerResponse): any;

    /**
     * Initialize the server.
     *
     *   - setup default configuration
     *   - setup default middleware
     *   - setup route reflection methods
     */
    init(): void;

    /**
     * Initialize application configuration.
     */
    defaultConfiguration(): void;

    /**
     * Register the given template engine callback `fn`
     * as `ext`.
     *
     * By default will `require()` the engine based on the
     * file extension. For example if you try to render
     * a "foo.jade" file Express will invoke the following internally:
     *
     *     app.engine('jade', require('jade').__express);
     *
     * For engines that do not provide `.__express` out of the box,
     * or if you wish to "map" a different extension to the template engine
     * you may use this method. For example mapping the EJS template engine to
     * ".html" files:
     *
     *     app.engine('html', require('ejs').renderFile);
     *
     * In this case EJS provides a `.renderFile()` method with
     * the same signature that Express expects: `(path, options, callback)`,
     * though note that it aliases this method as `ejs.__express` internally
     * so if you're using ".ejs" extensions you dont need to do anything.
     *
     * Some template engines do not follow this convention, the
     * [Consolidate.js](https://github.com/visionmedia/consolidate.js)
     * library was created to map all of node's popular template
     * engines to follow this convention, thus allowing them to
     * work seamlessly within Express.
     */
    engine(
        ext: string,
        fn: (path: string, options: object, callback: (e: any, rendered?: string) => void) => void,
    ): this;

    /**
     * Assign `setting` to `val`, or return `setting`'s value.
     *
     *    app.set('foo', 'bar');
     *    app.get('foo');
     *    // => "bar"
     *    app.set('foo', ['bar', 'baz']);
     *    app.get('foo');
     *    // => ["bar", "baz"]
     *
     * Mounted servers inherit their parent server's settings.
     */
    set(setting: string, val: any): this;
    get: ((name: string) => any) & IRouterMatcher<this>;

    param(name: string | string[], handler: RequestParamHandler): this;

    /**
     * Alternatively, you can pass only a callback, in which case you have the opportunity to alter the app.param()
     *
     * @deprecated since version 4.11
     */
    param(callback: (name: string, matcher: RegExp) => RequestParamHandler): this;

    /**
     * Return the app's absolute pathname
     * based on the parent(s) that have
     * mounted it.
     *
     * For example if the application was
     * mounted as "/admin", which itself
     * was mounted as "/blog" then the
     * return value would be "/blog/admin".
     */
    path(): string;

    /**
     * Check if `setting` is enabled (truthy).
     *
     *    app.enabled('foo')
     *    // => false
     *
     *    app.enable('foo')
     *    app.enabled('foo')
     *    // => true
     */
    enabled(setting: string): boolean;

    /**
     * Check if `setting` is disabled.
     *
     *    app.disabled('foo')
     *    // => true
     *
     *    app.enable('foo')
     *    app.disabled('foo')
     *    // => false
     */
    disabled(setting: string): boolean;

    /** Enable `setting`. */
    enable(setting: string): this;

    /** Disable `setting`. */
    disable(setting: string): this;

    /**
     * Render the given view `name` name with `options`
     * and a callback accepting an error and the
     * rendered template string.
     *
     * Example:
     *
     *    app.render('email', { name: 'Tobi' }, function(err, html){
     *      // ...
     *    })
     */
    render(name: string, options?: object, callback?: (err: Error, html: string) => void): void;
    render(name: string, callback: (err: Error, html: string) => void): void;

    /**
     * Listen for connections.
     *
     * A node `http.Server` is returned, with this
     * application (which is a `Function`) as its
     * callback. If you wish to create both an HTTP
     * and HTTPS server you may do so with the "http"
     * and "https" modules as shown here:
     *
     *    var http = require('http')
     *      , https = require('https')
     *      , express = require('express')
     *      , app = express();
     *
     *    http.createServer(app).listen(80);
     *    https.createServer({ ... }, app).listen(443);
     */
    listen(port: number, hostname: string, backlog: number, callback?: () => void): http.Server;
    listen(port: number, hostname: string, callback?: () => void): http.Server;
    listen(port: number, callback?: () => void): http.Server;
    listen(callback?: () => void): http.Server;
    listen(path: string, callback?: () => void): http.Server;
    listen(handle: any, listeningListener?: () => void): http.Server;

    router: string;

    settings: any;

    resource: any;

    map: any;

    locals: LocalsObj & Locals;

    /**
     * The app.routes object houses all of the routes defined mapped by the
     * associated HTTP verb. This object may be used for introspection
     * capabilities, for example Express uses this internally not only for
     * routing but to provide default OPTIONS behaviour unless app.options()
     * is used. Your application or framework may also remove routes by
     * simply by removing them from this object.
     */
    routes: any;

    /**
     * Used to get all registered routes in Express Application
     */
    _router: any;

    use: ApplicationRequestHandler<this>;

    /**
     * The mount event is fired on a sub-app, when it is mounted on a parent app.
     * The parent app is passed to the callback function.
     *
     * NOTE:
     * Sub-apps will:
     *  - Not inherit the value of settings that have a default value. You must set the value in the sub-app.
     *  - Inherit the value of settings with no default value.
     */
    on: (event: "mount", callback: (parent: Application) => void) => this;

    /**
     * The app.mountpath property contains one or more path patterns on which a sub-app was mounted.
     */
    mountpath: string | string[];
}

interface Express extends Application {
    request: Request;
    response: Response;
}

type BinaryLike = ArrayBuffer | ArrayBufferView | string;
interface WebhookLogger {
    debug?(message: string, context?: Record<string, unknown>): void;
    info?(message: string, context?: Record<string, unknown>): void;
    warn?(message: string, context?: Record<string, unknown>): void;
    error?(message: string, context?: Record<string, unknown>): void;
}
interface BuildDispatchContext {
    (req: Request, res: Response, event: ParsedWebhookEvent): WebhookDispatchContext;
}
type ShouldSkipVerification = (req: Request) => boolean;
type GetRawBody = (req: Request) => BinaryLike | null | undefined;
interface CreateWebhookMiddlewareOptions {
    readonly secret: string | readonly string[];
    readonly headerName?: string;
    readonly timestampHeader?: string;
    readonly toleranceMs?: number;
    readonly dispatcher?: WebhookDispatcher;
    readonly onEvent?: (event: ParsedWebhookEvent, req: Request, res: Response) => void | Promise<void>;
    readonly onError?: (error: unknown, req: Request, res: Response) => void | Promise<void>;
    readonly logger?: WebhookLogger;
    readonly getRawBody?: GetRawBody;
    readonly skipVerification?: ShouldSkipVerification;
    readonly attachProperty?: string;
    readonly buildDispatchContext?: BuildDispatchContext;
    readonly autoNext?: boolean;
}
declare function createWebhookMiddleware(options: CreateWebhookMiddlewareOptions): RequestHandler;
type WebhookRequest<E extends WebhookEventName = WebhookEventName> = Request & {
    webhook?: ParsedWebhookEvent<E>;
};

interface WebhookEventHandlerContext<E extends WebhookEventName> {
    event: ParsedWebhookEvent<E>;
    dispatchContext: WebhookDispatchContext;
}
type WebhookEventHandler<E extends WebhookEventName> = (payload: WebhookPayload<E>, context: WebhookEventHandlerContext<E>) => void | Promise<void>;
declare function registerEventHandler<E extends WebhookEventName>(dispatcher: WebhookDispatcher, event: E, handler: WebhookEventHandler<E>): () => void;
declare function createEventPredicate<E extends WebhookEventName>(event: E): (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<E>;

declare const PAYMENT_CONFIRMED_EVENT: "payment.confirmed";
type PaymentConfirmedEventName = typeof PAYMENT_CONFIRMED_EVENT;
type PaymentConfirmedPayload = WebhookPayload<PaymentConfirmedEventName>;
type PaymentConfirmedContext = WebhookEventHandlerContext<PaymentConfirmedEventName>;
type PaymentConfirmedHandler = WebhookEventHandler<PaymentConfirmedEventName>;
declare const isPaymentConfirmedEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"payment.confirmed">;
declare function onPaymentConfirmed(dispatcher: WebhookDispatcher, handler: PaymentConfirmedHandler): () => void;
declare function assertPaymentConfirmedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentConfirmedEventName>;

declare const PAYMENT_FAILED_EVENT: "payment.failed";
type PaymentFailedEventName = typeof PAYMENT_FAILED_EVENT;
type PaymentFailedPayload = WebhookPayload<PaymentFailedEventName>;
type PaymentFailedContext = WebhookEventHandlerContext<PaymentFailedEventName>;
type PaymentFailedHandler = WebhookEventHandler<PaymentFailedEventName>;
type PaymentFailedSubStatus = NonNullable<PaymentFailedPayload["subStatus"]>;
declare const isPaymentFailedEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"payment.failed">;
declare function onPaymentFailed(dispatcher: WebhookDispatcher, handler: PaymentFailedHandler): () => void;
declare function assertPaymentFailedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentFailedEventName>;
declare function isBouncedFailure(payload: Pick<PaymentFailedPayload, "subStatus">): payload is PaymentFailedPayload & {
    subStatus: Extract<PaymentFailedSubStatus, "bounced">;
};
declare function isInsufficientFundsFailure(payload: Pick<PaymentFailedPayload, "subStatus">): payload is PaymentFailedPayload & {
    subStatus: Extract<PaymentFailedSubStatus, "insufficient_funds">;
};

declare const PAYMENT_PROCESSING_EVENT: "payment.processing";
type PaymentProcessingEventName = typeof PAYMENT_PROCESSING_EVENT;
type PaymentProcessingPayload = WebhookPayload<PaymentProcessingEventName>;
type PaymentProcessingContext = WebhookEventHandlerContext<PaymentProcessingEventName>;
type PaymentProcessingHandler = WebhookEventHandler<PaymentProcessingEventName>;
type PaymentProcessingStage = PaymentProcessingPayload["subStatus"];
declare const PAYMENT_PROCESSING_STAGES: readonly ["initiated", "pending_internal_assessment", "ongoing_checks", "processing", "sending_fiat", "fiat_sent", "bounced", "retry_required"];
declare const isPaymentProcessingEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"payment.processing">;
declare function onPaymentProcessing(dispatcher: WebhookDispatcher, handler: PaymentProcessingHandler): () => void;
declare function assertPaymentProcessingEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentProcessingEventName>;
declare function isProcessingTerminalStatus(stage: PaymentProcessingStage): boolean;
declare function processingStageLabel(stage: PaymentProcessingStage): string;
declare function isRetryRequired(stage: PaymentProcessingStage): boolean;

declare const PAYMENT_DETAIL_UPDATED_EVENT: "payment_detail.updated";
type PaymentDetailUpdatedEventName = typeof PAYMENT_DETAIL_UPDATED_EVENT;
type PaymentDetailUpdatedPayload = WebhookPayload<PaymentDetailUpdatedEventName>;
type PaymentDetailUpdatedContext = WebhookEventHandlerContext<PaymentDetailUpdatedEventName>;
type PaymentDetailUpdatedHandler = WebhookEventHandler<PaymentDetailUpdatedEventName>;
type PaymentDetailStatus = PaymentDetailUpdatedPayload["status"];
declare const PAYMENT_DETAIL_STATUSES: readonly ["approved", "failed", "pending", "verified"];
declare const isPaymentDetailUpdatedEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"payment_detail.updated">;
declare function onPaymentDetailUpdated(dispatcher: WebhookDispatcher, handler: PaymentDetailUpdatedHandler): () => void;
declare function assertPaymentDetailUpdatedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentDetailUpdatedEventName>;
declare function isPaymentDetailApproved(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
    status: "approved";
};
declare function isPaymentDetailRejected(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
    status: "failed";
};
declare function isPaymentDetailPending(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
    status: "pending";
};
declare function isPaymentDetailVerified(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
    status: "verified";
};

declare const COMPLIANCE_UPDATED_EVENT: "compliance.updated";
type ComplianceUpdatedEventName = typeof COMPLIANCE_UPDATED_EVENT;
type ComplianceUpdatedPayload = WebhookPayload<ComplianceUpdatedEventName>;
type ComplianceUpdatedContext = WebhookEventHandlerContext<ComplianceUpdatedEventName>;
type ComplianceUpdatedHandler = WebhookEventHandler<ComplianceUpdatedEventName>;
type ComplianceKycStatus = NonNullable<ComplianceUpdatedPayload["kycStatus"]>;
type ComplianceAgreementStatus = NonNullable<ComplianceUpdatedPayload["agreementStatus"]>;
declare const COMPLIANCE_KYC_STATUSES: readonly ["initiated", "pending", "approved", "rejected", "failed"];
declare const COMPLIANCE_AGREEMENT_STATUSES: readonly ["not_started", "pending", "completed", "rejected", "failed", "signed"];
declare const isComplianceUpdatedEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"compliance.updated">;
declare function onComplianceUpdated(dispatcher: WebhookDispatcher, handler: ComplianceUpdatedHandler): () => void;
declare function assertComplianceUpdatedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<ComplianceUpdatedEventName>;
declare function isKycComplete(payload: ComplianceUpdatedPayload): boolean;
declare function isAgreementRejected(payload: ComplianceUpdatedPayload): boolean;
declare function complianceStatusSummary(payload: ComplianceUpdatedPayload): string;

declare const PAYMENT_PARTIAL_EVENT: "payment.partial";
type PaymentPartialEventName = typeof PAYMENT_PARTIAL_EVENT;
type PaymentPartialPayload = WebhookPayload<PaymentPartialEventName>;
type PaymentPartialContext = WebhookEventHandlerContext<PaymentPartialEventName>;
type PaymentPartialHandler = WebhookEventHandler<PaymentPartialEventName>;
declare const isPaymentPartialEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"payment.partial">;
declare function onPaymentPartial(dispatcher: WebhookDispatcher, handler: PaymentPartialHandler): () => void;
declare function assertPaymentPartialEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentPartialEventName>;

declare const PAYMENT_REFUNDED_EVENT: "payment.refunded";
type PaymentRefundedEventName = typeof PAYMENT_REFUNDED_EVENT;
type PaymentRefundedPayload = WebhookPayload<PaymentRefundedEventName>;
type PaymentRefundedContext = WebhookEventHandlerContext<PaymentRefundedEventName>;
type PaymentRefundedHandler = WebhookEventHandler<PaymentRefundedEventName>;
declare const isPaymentRefundedEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"payment.refunded">;
declare function onPaymentRefunded(dispatcher: WebhookDispatcher, handler: PaymentRefundedHandler): () => void;
declare function assertPaymentRefundedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentRefundedEventName>;

declare const REQUEST_RECURRING_EVENT: "request.recurring";
type RequestRecurringEventName = typeof REQUEST_RECURRING_EVENT;
type RequestRecurringPayload = WebhookPayload<RequestRecurringEventName>;
type RequestRecurringContext = WebhookEventHandlerContext<RequestRecurringEventName>;
type RequestRecurringHandler = WebhookEventHandler<RequestRecurringEventName>;
declare const isRequestRecurringEvent: (parsed: ParsedWebhookEvent) => parsed is ParsedWebhookEvent<"request.recurring">;
declare function onRequestRecurring(dispatcher: WebhookDispatcher, handler: RequestRecurringHandler): () => void;
declare function assertRequestRecurringEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<RequestRecurringEventName>;

declare const index$1_COMPLIANCE_AGREEMENT_STATUSES: typeof COMPLIANCE_AGREEMENT_STATUSES;
declare const index$1_COMPLIANCE_KYC_STATUSES: typeof COMPLIANCE_KYC_STATUSES;
declare const index$1_COMPLIANCE_UPDATED_EVENT: typeof COMPLIANCE_UPDATED_EVENT;
type index$1_ComplianceAgreementStatus = ComplianceAgreementStatus;
type index$1_ComplianceKycStatus = ComplianceKycStatus;
type index$1_ComplianceUpdatedContext = ComplianceUpdatedContext;
type index$1_ComplianceUpdatedEventName = ComplianceUpdatedEventName;
type index$1_ComplianceUpdatedHandler = ComplianceUpdatedHandler;
type index$1_ComplianceUpdatedPayload = ComplianceUpdatedPayload;
declare const index$1_PAYMENT_CONFIRMED_EVENT: typeof PAYMENT_CONFIRMED_EVENT;
declare const index$1_PAYMENT_DETAIL_STATUSES: typeof PAYMENT_DETAIL_STATUSES;
declare const index$1_PAYMENT_DETAIL_UPDATED_EVENT: typeof PAYMENT_DETAIL_UPDATED_EVENT;
declare const index$1_PAYMENT_FAILED_EVENT: typeof PAYMENT_FAILED_EVENT;
declare const index$1_PAYMENT_PARTIAL_EVENT: typeof PAYMENT_PARTIAL_EVENT;
declare const index$1_PAYMENT_PROCESSING_EVENT: typeof PAYMENT_PROCESSING_EVENT;
declare const index$1_PAYMENT_PROCESSING_STAGES: typeof PAYMENT_PROCESSING_STAGES;
declare const index$1_PAYMENT_REFUNDED_EVENT: typeof PAYMENT_REFUNDED_EVENT;
type index$1_PaymentConfirmedContext = PaymentConfirmedContext;
type index$1_PaymentConfirmedEventName = PaymentConfirmedEventName;
type index$1_PaymentConfirmedHandler = PaymentConfirmedHandler;
type index$1_PaymentConfirmedPayload = PaymentConfirmedPayload;
type index$1_PaymentDetailStatus = PaymentDetailStatus;
type index$1_PaymentDetailUpdatedContext = PaymentDetailUpdatedContext;
type index$1_PaymentDetailUpdatedEventName = PaymentDetailUpdatedEventName;
type index$1_PaymentDetailUpdatedHandler = PaymentDetailUpdatedHandler;
type index$1_PaymentDetailUpdatedPayload = PaymentDetailUpdatedPayload;
type index$1_PaymentFailedContext = PaymentFailedContext;
type index$1_PaymentFailedEventName = PaymentFailedEventName;
type index$1_PaymentFailedHandler = PaymentFailedHandler;
type index$1_PaymentFailedPayload = PaymentFailedPayload;
type index$1_PaymentFailedSubStatus = PaymentFailedSubStatus;
type index$1_PaymentPartialContext = PaymentPartialContext;
type index$1_PaymentPartialEventName = PaymentPartialEventName;
type index$1_PaymentPartialHandler = PaymentPartialHandler;
type index$1_PaymentPartialPayload = PaymentPartialPayload;
type index$1_PaymentProcessingContext = PaymentProcessingContext;
type index$1_PaymentProcessingEventName = PaymentProcessingEventName;
type index$1_PaymentProcessingHandler = PaymentProcessingHandler;
type index$1_PaymentProcessingPayload = PaymentProcessingPayload;
type index$1_PaymentProcessingStage = PaymentProcessingStage;
type index$1_PaymentRefundedContext = PaymentRefundedContext;
type index$1_PaymentRefundedEventName = PaymentRefundedEventName;
type index$1_PaymentRefundedHandler = PaymentRefundedHandler;
type index$1_PaymentRefundedPayload = PaymentRefundedPayload;
declare const index$1_REQUEST_RECURRING_EVENT: typeof REQUEST_RECURRING_EVENT;
type index$1_RequestRecurringContext = RequestRecurringContext;
type index$1_RequestRecurringEventName = RequestRecurringEventName;
type index$1_RequestRecurringHandler = RequestRecurringHandler;
type index$1_RequestRecurringPayload = RequestRecurringPayload;
type index$1_WebhookEventHandler<E extends WebhookEventName> = WebhookEventHandler<E>;
type index$1_WebhookEventHandlerContext<E extends WebhookEventName> = WebhookEventHandlerContext<E>;
declare const index$1_assertComplianceUpdatedEvent: typeof assertComplianceUpdatedEvent;
declare const index$1_assertPaymentConfirmedEvent: typeof assertPaymentConfirmedEvent;
declare const index$1_assertPaymentDetailUpdatedEvent: typeof assertPaymentDetailUpdatedEvent;
declare const index$1_assertPaymentFailedEvent: typeof assertPaymentFailedEvent;
declare const index$1_assertPaymentPartialEvent: typeof assertPaymentPartialEvent;
declare const index$1_assertPaymentProcessingEvent: typeof assertPaymentProcessingEvent;
declare const index$1_assertPaymentRefundedEvent: typeof assertPaymentRefundedEvent;
declare const index$1_assertRequestRecurringEvent: typeof assertRequestRecurringEvent;
declare const index$1_complianceStatusSummary: typeof complianceStatusSummary;
declare const index$1_createEventPredicate: typeof createEventPredicate;
declare const index$1_isAgreementRejected: typeof isAgreementRejected;
declare const index$1_isBouncedFailure: typeof isBouncedFailure;
declare const index$1_isComplianceUpdatedEvent: typeof isComplianceUpdatedEvent;
declare const index$1_isInsufficientFundsFailure: typeof isInsufficientFundsFailure;
declare const index$1_isKycComplete: typeof isKycComplete;
declare const index$1_isPaymentConfirmedEvent: typeof isPaymentConfirmedEvent;
declare const index$1_isPaymentDetailApproved: typeof isPaymentDetailApproved;
declare const index$1_isPaymentDetailPending: typeof isPaymentDetailPending;
declare const index$1_isPaymentDetailRejected: typeof isPaymentDetailRejected;
declare const index$1_isPaymentDetailUpdatedEvent: typeof isPaymentDetailUpdatedEvent;
declare const index$1_isPaymentDetailVerified: typeof isPaymentDetailVerified;
declare const index$1_isPaymentFailedEvent: typeof isPaymentFailedEvent;
declare const index$1_isPaymentPartialEvent: typeof isPaymentPartialEvent;
declare const index$1_isPaymentProcessingEvent: typeof isPaymentProcessingEvent;
declare const index$1_isPaymentRefundedEvent: typeof isPaymentRefundedEvent;
declare const index$1_isProcessingTerminalStatus: typeof isProcessingTerminalStatus;
declare const index$1_isRequestRecurringEvent: typeof isRequestRecurringEvent;
declare const index$1_isRetryRequired: typeof isRetryRequired;
declare const index$1_onComplianceUpdated: typeof onComplianceUpdated;
declare const index$1_onPaymentConfirmed: typeof onPaymentConfirmed;
declare const index$1_onPaymentDetailUpdated: typeof onPaymentDetailUpdated;
declare const index$1_onPaymentFailed: typeof onPaymentFailed;
declare const index$1_onPaymentPartial: typeof onPaymentPartial;
declare const index$1_onPaymentProcessing: typeof onPaymentProcessing;
declare const index$1_onPaymentRefunded: typeof onPaymentRefunded;
declare const index$1_onRequestRecurring: typeof onRequestRecurring;
declare const index$1_processingStageLabel: typeof processingStageLabel;
declare const index$1_registerEventHandler: typeof registerEventHandler;
declare namespace index$1 {
  export { index$1_COMPLIANCE_AGREEMENT_STATUSES as COMPLIANCE_AGREEMENT_STATUSES, index$1_COMPLIANCE_KYC_STATUSES as COMPLIANCE_KYC_STATUSES, index$1_COMPLIANCE_UPDATED_EVENT as COMPLIANCE_UPDATED_EVENT, type index$1_ComplianceAgreementStatus as ComplianceAgreementStatus, type index$1_ComplianceKycStatus as ComplianceKycStatus, type index$1_ComplianceUpdatedContext as ComplianceUpdatedContext, type index$1_ComplianceUpdatedEventName as ComplianceUpdatedEventName, type index$1_ComplianceUpdatedHandler as ComplianceUpdatedHandler, type index$1_ComplianceUpdatedPayload as ComplianceUpdatedPayload, index$1_PAYMENT_CONFIRMED_EVENT as PAYMENT_CONFIRMED_EVENT, index$1_PAYMENT_DETAIL_STATUSES as PAYMENT_DETAIL_STATUSES, index$1_PAYMENT_DETAIL_UPDATED_EVENT as PAYMENT_DETAIL_UPDATED_EVENT, index$1_PAYMENT_FAILED_EVENT as PAYMENT_FAILED_EVENT, index$1_PAYMENT_PARTIAL_EVENT as PAYMENT_PARTIAL_EVENT, index$1_PAYMENT_PROCESSING_EVENT as PAYMENT_PROCESSING_EVENT, index$1_PAYMENT_PROCESSING_STAGES as PAYMENT_PROCESSING_STAGES, index$1_PAYMENT_REFUNDED_EVENT as PAYMENT_REFUNDED_EVENT, type index$1_PaymentConfirmedContext as PaymentConfirmedContext, type index$1_PaymentConfirmedEventName as PaymentConfirmedEventName, type index$1_PaymentConfirmedHandler as PaymentConfirmedHandler, type index$1_PaymentConfirmedPayload as PaymentConfirmedPayload, type index$1_PaymentDetailStatus as PaymentDetailStatus, type index$1_PaymentDetailUpdatedContext as PaymentDetailUpdatedContext, type index$1_PaymentDetailUpdatedEventName as PaymentDetailUpdatedEventName, type index$1_PaymentDetailUpdatedHandler as PaymentDetailUpdatedHandler, type index$1_PaymentDetailUpdatedPayload as PaymentDetailUpdatedPayload, type index$1_PaymentFailedContext as PaymentFailedContext, type index$1_PaymentFailedEventName as PaymentFailedEventName, type index$1_PaymentFailedHandler as PaymentFailedHandler, type index$1_PaymentFailedPayload as PaymentFailedPayload, type index$1_PaymentFailedSubStatus as PaymentFailedSubStatus, type index$1_PaymentPartialContext as PaymentPartialContext, type index$1_PaymentPartialEventName as PaymentPartialEventName, type index$1_PaymentPartialHandler as PaymentPartialHandler, type index$1_PaymentPartialPayload as PaymentPartialPayload, type index$1_PaymentProcessingContext as PaymentProcessingContext, type index$1_PaymentProcessingEventName as PaymentProcessingEventName, type index$1_PaymentProcessingHandler as PaymentProcessingHandler, type index$1_PaymentProcessingPayload as PaymentProcessingPayload, type index$1_PaymentProcessingStage as PaymentProcessingStage, type index$1_PaymentRefundedContext as PaymentRefundedContext, type index$1_PaymentRefundedEventName as PaymentRefundedEventName, type index$1_PaymentRefundedHandler as PaymentRefundedHandler, type index$1_PaymentRefundedPayload as PaymentRefundedPayload, index$1_REQUEST_RECURRING_EVENT as REQUEST_RECURRING_EVENT, type index$1_RequestRecurringContext as RequestRecurringContext, type index$1_RequestRecurringEventName as RequestRecurringEventName, type index$1_RequestRecurringHandler as RequestRecurringHandler, type index$1_RequestRecurringPayload as RequestRecurringPayload, type index$1_WebhookEventHandler as WebhookEventHandler, type index$1_WebhookEventHandlerContext as WebhookEventHandlerContext, index$1_assertComplianceUpdatedEvent as assertComplianceUpdatedEvent, index$1_assertPaymentConfirmedEvent as assertPaymentConfirmedEvent, index$1_assertPaymentDetailUpdatedEvent as assertPaymentDetailUpdatedEvent, index$1_assertPaymentFailedEvent as assertPaymentFailedEvent, index$1_assertPaymentPartialEvent as assertPaymentPartialEvent, index$1_assertPaymentProcessingEvent as assertPaymentProcessingEvent, index$1_assertPaymentRefundedEvent as assertPaymentRefundedEvent, index$1_assertRequestRecurringEvent as assertRequestRecurringEvent, index$1_complianceStatusSummary as complianceStatusSummary, index$1_createEventPredicate as createEventPredicate, index$1_isAgreementRejected as isAgreementRejected, index$1_isBouncedFailure as isBouncedFailure, index$1_isComplianceUpdatedEvent as isComplianceUpdatedEvent, index$1_isInsufficientFundsFailure as isInsufficientFundsFailure, index$1_isKycComplete as isKycComplete, index$1_isPaymentConfirmedEvent as isPaymentConfirmedEvent, index$1_isPaymentDetailApproved as isPaymentDetailApproved, index$1_isPaymentDetailPending as isPaymentDetailPending, index$1_isPaymentDetailRejected as isPaymentDetailRejected, index$1_isPaymentDetailUpdatedEvent as isPaymentDetailUpdatedEvent, index$1_isPaymentDetailVerified as isPaymentDetailVerified, index$1_isPaymentFailedEvent as isPaymentFailedEvent, index$1_isPaymentPartialEvent as isPaymentPartialEvent, index$1_isPaymentProcessingEvent as isPaymentProcessingEvent, index$1_isPaymentRefundedEvent as isPaymentRefundedEvent, index$1_isProcessingTerminalStatus as isProcessingTerminalStatus, index$1_isRequestRecurringEvent as isRequestRecurringEvent, index$1_isRetryRequired as isRetryRequired, index$1_onComplianceUpdated as onComplianceUpdated, index$1_onPaymentConfirmed as onPaymentConfirmed, index$1_onPaymentDetailUpdated as onPaymentDetailUpdated, index$1_onPaymentFailed as onPaymentFailed, index$1_onPaymentPartial as onPaymentPartial, index$1_onPaymentProcessing as onPaymentProcessing, index$1_onPaymentRefunded as onPaymentRefunded, index$1_onRequestRecurring as onRequestRecurring, index$1_processingStageLabel as processingStageLabel, index$1_registerEventHandler as registerEventHandler };
}

declare const DEFAULT_TEST_WEBHOOK_SECRET = "whsec_test_secret";
declare function generateTestWebhookSignature(rawBody: ArrayBuffer | ArrayBufferView | string | object, secret?: string): string;
declare function isWebhookVerificationBypassed(): boolean;
declare function setWebhookVerificationBypass(enabled: boolean): void;
declare function withWebhookVerificationDisabled<T>(fn: () => T | Promise<T>): Promise<T>;
interface CreateMockWebhookRequestOptions {
    payload: unknown;
    secret?: string;
    headerName?: string;
    headers?: Record<string, string>;
}
interface MockWebhookResponse {
    statusCode: number;
    body: unknown;
    headersSent: boolean;
    status(code: number): this;
    json(payload: unknown): this;
    send(payload: unknown): this;
}
declare function createMockWebhookRequest(options: CreateMockWebhookRequestOptions): WebhookRequest;
declare function createMockWebhookResponse(): MockWebhookResponse;

type testing_webhook_CreateMockWebhookRequestOptions = CreateMockWebhookRequestOptions;
declare const testing_webhook_DEFAULT_TEST_WEBHOOK_SECRET: typeof DEFAULT_TEST_WEBHOOK_SECRET;
type testing_webhook_MockWebhookResponse = MockWebhookResponse;
declare const testing_webhook_createMockWebhookRequest: typeof createMockWebhookRequest;
declare const testing_webhook_createMockWebhookResponse: typeof createMockWebhookResponse;
declare const testing_webhook_generateTestWebhookSignature: typeof generateTestWebhookSignature;
declare const testing_webhook_isWebhookVerificationBypassed: typeof isWebhookVerificationBypassed;
declare const testing_webhook_setWebhookVerificationBypass: typeof setWebhookVerificationBypass;
declare const testing_webhook_withWebhookVerificationDisabled: typeof withWebhookVerificationDisabled;
declare namespace testing_webhook {
  export { type testing_webhook_CreateMockWebhookRequestOptions as CreateMockWebhookRequestOptions, testing_webhook_DEFAULT_TEST_WEBHOOK_SECRET as DEFAULT_TEST_WEBHOOK_SECRET, type testing_webhook_MockWebhookResponse as MockWebhookResponse, testing_webhook_createMockWebhookRequest as createMockWebhookRequest, testing_webhook_createMockWebhookResponse as createMockWebhookResponse, testing_webhook_generateTestWebhookSignature as generateTestWebhookSignature, testing_webhook_isWebhookVerificationBypassed as isWebhookVerificationBypassed, testing_webhook_setWebhookVerificationBypass as setWebhookVerificationBypass, testing_webhook_withWebhookVerificationDisabled as withWebhookVerificationDisabled };
}

type index_CreateWebhookMiddlewareOptions = CreateWebhookMiddlewareOptions;
declare const index_DEFAULT_SIGNATURE_ALGORITHM: typeof DEFAULT_SIGNATURE_ALGORITHM;
declare const index_DEFAULT_SIGNATURE_HEADER: typeof DEFAULT_SIGNATURE_HEADER;
type index_GetRawBody = GetRawBody;
type index_InferDispatcherPayload<T extends WebhookEventName> = InferDispatcherPayload<T>;
type index_ParseWebhookEventOptions = ParseWebhookEventOptions;
type index_ParsedWebhookEvent<E extends WebhookEventName = WebhookEventName> = ParsedWebhookEvent<E>;
type index_RequestWebhookSignatureError = RequestWebhookSignatureError;
declare const index_RequestWebhookSignatureError: typeof RequestWebhookSignatureError;
type index_ShouldSkipVerification = ShouldSkipVerification;
type index_VerifyWebhookSignatureOptions = VerifyWebhookSignatureOptions;
type index_VerifyWebhookSignatureResult = VerifyWebhookSignatureResult;
declare const index_WEBHOOK_EVENT_NAMES: typeof WEBHOOK_EVENT_NAMES;
type index_WebhookDispatchContext = WebhookDispatchContext;
type index_WebhookDispatcher = WebhookDispatcher;
declare const index_WebhookDispatcher: typeof WebhookDispatcher;
type index_WebhookEventName = WebhookEventName;
type index_WebhookHandler<E extends WebhookEventName = WebhookEventName> = WebhookHandler<E>;
type index_WebhookHeaders = WebhookHeaders;
type index_WebhookLogger = WebhookLogger;
type index_WebhookPayload<E extends WebhookEventName = WebhookEventName> = WebhookPayload<E>;
type index_WebhookPayloadMap = WebhookPayloadMap;
type index_WebhookRequest<E extends WebhookEventName = WebhookEventName> = WebhookRequest<E>;
type index_WebhookSignatureErrorReason = WebhookSignatureErrorReason;
declare const index_createWebhookDispatcher: typeof createWebhookDispatcher;
declare const index_createWebhookMiddleware: typeof createWebhookMiddleware;
declare const index_getWebhookSchema: typeof getWebhookSchema;
declare const index_isRequestWebhookSignatureError: typeof isRequestWebhookSignatureError;
declare const index_parseWebhookEvent: typeof parseWebhookEvent;
declare const index_verifyWebhookSignature: typeof verifyWebhookSignature;
declare namespace index {
  export { type index_CreateWebhookMiddlewareOptions as CreateWebhookMiddlewareOptions, index_DEFAULT_SIGNATURE_ALGORITHM as DEFAULT_SIGNATURE_ALGORITHM, index_DEFAULT_SIGNATURE_HEADER as DEFAULT_SIGNATURE_HEADER, type index_GetRawBody as GetRawBody, type index_InferDispatcherPayload as InferDispatcherPayload, type NormalisedHeaders as NormalizedWebhookHeaders, type index_ParseWebhookEventOptions as ParseWebhookEventOptions, type index_ParsedWebhookEvent as ParsedWebhookEvent, index_RequestWebhookSignatureError as RequestWebhookSignatureError, type index_ShouldSkipVerification as ShouldSkipVerification, type index_VerifyWebhookSignatureOptions as VerifyWebhookSignatureOptions, type index_VerifyWebhookSignatureResult as VerifyWebhookSignatureResult, index_WEBHOOK_EVENT_NAMES as WEBHOOK_EVENT_NAMES, type index_WebhookDispatchContext as WebhookDispatchContext, index_WebhookDispatcher as WebhookDispatcher, type index_WebhookEventName as WebhookEventName, type index_WebhookHandler as WebhookHandler, type index_WebhookHeaders as WebhookHeaders, type index_WebhookLogger as WebhookLogger, type index_WebhookPayload as WebhookPayload, type index_WebhookPayloadMap as WebhookPayloadMap, type index_WebhookRequest as WebhookRequest, type index_WebhookSignatureErrorReason as WebhookSignatureErrorReason, index_createWebhookDispatcher as createWebhookDispatcher, index_createWebhookMiddleware as createWebhookMiddleware, index$1 as events, index_getWebhookSchema as getWebhookSchema, index_isRequestWebhookSignatureError as isRequestWebhookSignatureError, index_parseWebhookEvent as parseWebhookEvent, testing_webhook as testing, index_verifyWebhookSignature as verifyWebhookSignature };
}

export { type BuildRequestApiErrorOptions, type CreateClientOptions, HttpAdapter, HttpClient, Interceptor, type ParseRegistryOptions, type ParseResult, type ParseWithSchemaOptions, RequestApiError, type RequestClient, RequestEnvironment, type RequestEnvironmentName, type RequestErrorDetail, type RequestErrorMetadata, RequestOptions, RetryConfig, RuntimeValidationOption, type SchemaKey, type SchemaKind, type SchemaOutput, SchemaRegistry, ValidationError, browserFetchAdapter, buildRequestApiError, createHttpClient, createRequestClient, createRequestClientFromEnv, index$8 as currenciesV1, isRequestApiError, nodeFetchAdapter, parseWithRegistry, parseWithSchema, index$6 as pay, index$7 as payV1, index$5 as payerV1, index$4 as payerV2, index$3 as payments, index$2 as requestsV1, schemaRegistry, index as webhooks };
