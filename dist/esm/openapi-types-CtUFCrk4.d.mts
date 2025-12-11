type RetryJitter = "none" | "full" | "half";
interface RetryConfig {
    /**
     * Maximum attempts including the first request.
     * Set to 1 to disable retries.
     */
    maxAttempts: number;
    /**
     * Delay applied to the first retry attempt.
     */
    initialDelayMs: number;
    /**
     * Upper bound for calculated backoff delays.
     */
    maxDelayMs: number;
    /**
     * Multiplicative factor applied on each retry (exponential backoff).
     */
    backoffFactor: number;
    /**
     * Jitter strategy applied to the computed delay.
     */
    jitter: RetryJitter;
    /**
     * Predicate deciding if a retry should occur for the provided status code.
     * When specified, supersedes {@link retryStatusCodes}.
     */
    shouldRetry?: (context: RetryDecisionInput) => boolean;
    /**
     * HTTP status codes that are eligible for retries (when `shouldRetry` is not supplied).
     */
    retryStatusCodes: number[];
    /**
     * Methods considered for retries (enforced by the interceptor). Defaults to idempotent methods.
     */
    allowedMethods?: string[];
}
interface RetryDecisionInput {
    attempt: number;
    response?: RetryResponseLike;
    error?: unknown;
}
interface RetryResponseLike {
    status: number;
    headers?: Record<string, string | undefined>;
    /**
     * Optional retry-after header value for transport adapters that expose parsed metadata.
     */
    retryAfterMs?: number;
}
interface RetryDecision {
    retry: boolean;
    delayMs?: number;
    reason?: string;
}
declare const DEFAULT_RETRY_CONFIG: RetryConfig;
declare function shouldRetryRequest(config: RetryConfig, input: RetryDecisionInput): RetryDecision;
declare function computeRetryDelay(config: RetryConfig, input: RetryDecisionInput): number;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface RuntimeValidationConfig {
    requests: boolean;
    responses: boolean;
    errors: boolean;
}
type RuntimeValidationOption = boolean | Partial<RuntimeValidationConfig>;
type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[];
type QueryRecord = Record<string, QueryValue | undefined>;
type QuerySerializerFn = (params: {
    key: string;
    value: QueryValue;
    set: (key: string, value: string) => void;
    append: (key: string, value: string) => void;
}) => void;
type QuerySerializer = "comma" | "repeat" | QuerySerializerFn;
type LogLevel = "silent" | "error" | "info" | "debug";
interface HttpRequest {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
    timeoutMs?: number;
    meta?: {
        operationId?: string;
        retry?: Partial<RetryConfig>;
        interceptors?: Interceptor[];
        validation?: RuntimeValidationOption;
        [key: string]: unknown;
    };
}
interface HttpResponse {
    status: number;
    ok: boolean;
    headers: Record<string, string>;
    data?: unknown;
    text?: string;
}
interface HttpAdapter {
    send(request: HttpRequest): Promise<HttpResponse>;
}
type NextHandler = (req: HttpRequest) => Promise<HttpResponse>;
type Interceptor = (req: HttpRequest, next: NextHandler) => Promise<HttpResponse>;
interface RequestOptions {
    path: string;
    method: HttpMethod;
    query?: QueryRecord;
    querySerializer?: QuerySerializer;
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
    timeoutMs?: number;
    meta?: HttpRequest["meta"];
}
interface HttpClient {
    request(options: RequestOptions): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    get(path: string, init?: Omit<RequestOptions, "path" | "method" | "body">): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    post(path: string, body?: unknown, init?: Omit<RequestOptions, "path" | "method">): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    put(path: string, body?: unknown, init?: Omit<RequestOptions, "path" | "method">): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    patch(path: string, body?: unknown, init?: Omit<RequestOptions, "path" | "method">): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    delete(path: string, init?: Omit<RequestOptions, "path" | "method"> & {
        body?: unknown;
    }): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    head(path: string, init?: Omit<RequestOptions, "path" | "method" | "body">): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    options(path: string, init?: Omit<RequestOptions, "path" | "method" | "body">): Promise<{
        status: number;
        headers: Record<string, string>;
        data: unknown;
    }>;
    getRuntimeValidationConfig(): RuntimeValidationConfig;
}

interface operations {
    CurrenciesV1Controller_getNetworkTokens_v1: {
        parameters: {
            query?: {
                /** @description The network of the token(s) */
                network?: string;
                /** @description The symbol of the token */
                symbol?: string;
                /** @description Whether to return only the first token. can only be used when both `network` and `symbol` are provided. */
                firstOnly?: string;
                /** @description The Request Network id of the token */
                id?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of tokens retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Token not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CurrenciesV1Controller_getConversionRoutes_v1: {
        parameters: {
            query?: {
                /** @description The network of the token to filter by */
                network?: string;
                /** @description A comma-separated list of networks to filter by (e.g., sepolia,mainnet,polygon) */
                networks?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                currencyId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Conversion routes retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Currency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CurrenciesV2Controller_getNetworkTokens_v2: {
        parameters: {
            query?: {
                /** @description The network of the token(s) */
                network?: string;
                /** @description The symbol of the token */
                symbol?: string;
                /** @description Whether to return only the first token. can only be used when both `network` and `symbol` are provided. */
                firstOnly?: string;
                /** @description The Request Network id of the token */
                id?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of tokens retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Token not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CurrenciesV2Controller_getConversionRoutes_v2: {
        parameters: {
            query?: {
                /** @description The network of the token to filter by */
                network?: string;
                /** @description A comma-separated list of networks to filter by (e.g., sepolia,mainnet,polygon) */
                networks?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                currencyId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Conversion routes retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Currency not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientIdV2Controller_findAll_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using session) */
                "x-api-key"?: string;
                /** @description Bearer token for session authentication (optional if using API key) */
                Authorization?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of client IDs */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id?: string;
                        clientId?: string;
                        label?: string;
                        allowedDomains?: string[];
                        status?: string;
                        createdAt?: string;
                        lastUsedAt?: string | null;
                    }[];
                };
            };
            /** @description Unauthorized - invalid session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientIdV2Controller_create_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using session) */
                "x-api-key"?: string;
                /** @description Bearer token for session authentication (optional if using API key) */
                Authorization?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    label: string;
                    /** @description List of allowed domain origins (normalized) */
                    allowedDomains: string[];
                    /** @description Fee percentage (e.g., '1' = 1%, '2.5' = 2.5%). If set to '0', allows API request fees to take precedence. If set to any other value, overrides any fee passed via API. */
                    feePercentage?: string;
                    /** @description Wallet address to receive fees. Required if feePercentage is set. */
                    feeAddress?: string;
                };
            };
        };
        responses: {
            /** @description Client ID created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id?: string;
                        clientId?: string;
                        label?: string;
                        allowedDomains?: string[];
                        feePercentage?: string | null;
                        feeAddress?: string | null;
                        status?: string;
                        createdAt?: string;
                    };
                };
            };
            /** @description Bad request - validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized - invalid session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientIdV2Controller_findOne_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using session) */
                "x-api-key"?: string;
                /** @description Bearer token for session authentication (optional if using API key) */
                Authorization?: string;
            };
            path: {
                /** @description Client ID internal identifier */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Client ID details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id?: string;
                        clientId?: string;
                        label?: string;
                        allowedDomains?: string[];
                        feePercentage?: string | null;
                        feeAddress?: string | null;
                        status?: string;
                        createdAt?: string;
                        updatedAt?: string;
                        lastUsedAt?: string | null;
                    };
                };
            };
            /** @description Unauthorized - invalid session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Client ID not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientIdV2Controller_update_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using session) */
                "x-api-key"?: string;
                /** @description Bearer token for session authentication (optional if using API key) */
                Authorization?: string;
            };
            path: {
                /** @description Client ID internal identifier */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    label?: string;
                    /** @description List of allowed domain origins (normalized) */
                    allowedDomains?: string[];
                    /** @description Fee percentage (e.g., '1' = 1%, '2.5' = 2.5%). If set to '0', allows API request fees to take precedence. If set to any other value, overrides any fee passed via API. Set to null to unset. */
                    feePercentage?: string | null;
                    /** @description Wallet address to receive fees. Required if feePercentage is set. Set to null to unset. */
                    feeAddress?: string | null;
                    /** @enum {string} */
                    status?: "active" | "inactive" | "revoked";
                };
            };
        };
        responses: {
            /** @description Client ID updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id?: string;
                        clientId?: string;
                        label?: string;
                        allowedDomains?: string[];
                        feePercentage?: string | null;
                        feeAddress?: string | null;
                        status?: string;
                        updatedAt?: string;
                    };
                };
            };
            /** @description Bad request - validation failed or cannot reactivate revoked ID */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized - invalid session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Client ID not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientIdV2Controller_delete_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using session) */
                "x-api-key"?: string;
                /** @description Bearer token for session authentication (optional if using API key) */
                Authorization?: string;
            };
            path: {
                /** @description Client ID internal identifier */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Client ID revoked successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized - invalid session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Client ID not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV1_createRequest_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The wallet address of the payer */
                    payer?: string;
                    /** @description The wallet address of the payee */
                    payee: string;
                    /** @description The payable amount of the invoice, in human readable format */
                    amount: string;
                    /** @description Invoice Currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: USD */
                    invoiceCurrency: string;
                    /** @description Payment currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: ETH-sepolia-sepolia */
                    paymentCurrency: string;
                    /** @description The recurrence of the invoice */
                    recurrence?: {
                        /** @description The start date of the invoice, cannot be in the past */
                        startDate: string;
                        /**
                         * @description The frequency of the invoice
                         * @enum {string}
                         */
                        frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
                    };
                };
            };
        };
        responses: {
            /** @description Request created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * @description Unique identifier of the request, used to pay the request as well as check the status of the request
                         * @example 0xb3581f0b0f74cc61
                         */
                        paymentReference?: string;
                        /**
                         * @description Unique identifier of the request, commonly used to look up a request in Request Scan
                         * @example 01e273ecc29d4b526df3a0f1f05ffc59372af8752c2b678096e49ac270416a7cdb
                         */
                        requestID?: string;
                    };
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Wallet not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV1_getRequestStatus_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The payment reference of the request */
                paymentReference: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Request status retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Whether the request has been paid or not */
                        hasBeenPaid?: boolean;
                        /**
                         * @description The payment reference of the request
                         * @example 0xb3581f0b0f74cc61
                         */
                        paymentReference?: string;
                        /**
                         * @description The request ID of the request
                         * @example 01e273ecc29d4b526df3a0f1f05ffc59372af8752c2b678096e49ac270416a7cdb
                         */
                        requestId?: string;
                        /** @description Whether the request is listening for a payment */
                        isListening?: boolean;
                        /** @description The transaction hash of the payment */
                        txHash?: string | null;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV1_stopRecurrenceRequest_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The payment reference of the request */
                paymentReference: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Recurrence stopped successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV1_getPaymentCalldata_v1: {
        parameters: {
            query?: {
                /** @description The wallet address of the payer. */
                wallet?: string;
                /** @description The source chain of the crosschain payment */
                chain?: "BASE" | "OPTIMISM" | "ARBITRUM" | "ETHEREUM";
                /** @description The source token of the crosschain payment */
                token?: "USDC" | "USDT" | "DAI";
                /** @description The amount to pay, in human readable format */
                amount?: string;
            };
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The payment reference of the request */
                paymentReference: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Payment calldata retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Array of transactions to execute for the payment */
                        transactions: {
                            /** @description Transaction calldata */
                            data: string;
                            /** @description Target contract address */
                            to: string;
                            /** @description Payment amount in EVM-compatible format */
                            value: {
                                /** @enum {string} */
                                type?: "BigNumber";
                                /** @description Amount encoded in hex */
                                hex?: string;
                            };
                        }[];
                        /** @description Metadata about the payment requirements */
                        metadata: {
                            /** @description Number of transactions required */
                            stepsRequired: number;
                            /** @description Whether token approval is needed */
                            needsApproval: boolean;
                            /** @description Index of the approval transaction if needed */
                            approvalTransactionIndex?: number | null;
                            /** @description Whether payer has sufficient balance */
                            hasEnoughBalance: boolean;
                            /** @description Whether payer has sufficient gas */
                            hasEnoughGas: boolean;
                        };
                    } | {
                        /** @description Unique identifier for the payment intent */
                        paymentIntentId: string;
                        /** @description EIP-712 typed data for payment intent signature */
                        paymentIntent: string;
                        /** @description EIP-712 typed data for token approval permit (for EIP-2612 compliant tokens) */
                        approvalPermitPayload?: string | null;
                        /** @description Transaction calldata for token approval (for non-EIP-2612 tokens) */
                        approvalCalldata?: {
                            /** @description Token contract address */
                            to?: string;
                            /** @description Approval transaction calldata */
                            data?: string;
                            /** @description Transaction value (usually '0x0') */
                            value?: string;
                        } | null;
                        /** @description Metadata about the crosschain payment */
                        metadata: {
                            /** @description Whether the token supports EIP-2612 permits */
                            supportsEIP2612: boolean;
                        };
                    };
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV1_getRequestPaymentRoutes_v1: {
        parameters: {
            query: {
                /** @description The wallet address of the payer */
                wallet: string;
                /** @description The amount to pay, in human readable format */
                amount?: string;
                /** @description Fee percentage to apply at payment time (e.g., '2.5' for 2.5%) */
                feePercentage?: string;
                /** @description Address to receive the fee */
                feeAddress?: string;
            };
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The payment reference of the request */
                paymentReference: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Available payment routes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Array of available payment routes */
                        routes: {
                            /** @description Unique identifier for the route */
                            id: string;
                            /** @description Total fee for this route (as a decimal, e.g., 0.001 = 0.1%) */
                            fee: number;
                            /** @description Detailed breakdown of all fees for this route */
                            feeBreakdown?: {
                                /**
                                 * @description Type of fee
                                 * @enum {string}
                                 */
                                type?: "gas" | "platform" | "crosschain" | "crypto-to-fiat" | "offramp";
                                /**
                                 * @description Stage when the fee is applied
                                 * @enum {string}
                                 */
                                stage?: "sending" | "receiving" | "proxying" | "refunding" | "overall";
                                /** @description Provider that charged the fee */
                                provider?: string;
                                /** @description Fee amount in human-readable format (formatted with token decimals) */
                                amount?: string;
                                /** @description Fee amount in USD */
                                amountInUSD?: string;
                                /** @description Fee currency */
                                currency?: string;
                                /** @description Address that received the fee */
                                receiverAddress?: string;
                                /** @description Network where the fee was paid */
                                network?: string;
                                /** @description Provider used for rate conversion */
                                rateProvider?: string;
                            }[];
                            /** @description Route speed - 'FAST' for direct payments, number of seconds for crosschain */
                            speed: string | number;
                            /** @description Price impact of the route (as a decimal) */
                            price_impact?: number;
                            /** @description Source chain for the payment */
                            chain: string;
                            /** @description Token symbol for the payment */
                            token: string;
                        }[];
                    };
                };
            };
            /** @description Invalid or missing wallet address */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV1_sendPaymentIntent_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The payment intent ID */
                paymentIntentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The signed payment intent data. */
                    signedPaymentIntent: {
                        /** @description The signature of the permit2 approval for token transfer */
                        signature: string;
                        /** @description The unique nonce for this permit2 transaction */
                        nonce: string;
                        /** @description The Unix timestamp when this permit2 approval expires */
                        deadline: string;
                    };
                    /** @description The EIP2612 gasless token approval data that allows Permit2 to access user tokens */
                    signedApprovalPermit?: {
                        /** @description The signature for the EIP2612 gasless token approval */
                        signature: string;
                        /** @description The unique nonce for the EIP2612 permit */
                        nonce: string;
                        /** @description The Unix timestamp when this EIP2612 permit expires */
                        deadline: string;
                    };
                };
            };
        };
        responses: {
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Payment intent data not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV2_createRequest_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The wallet address of the payer */
                    payer?: string;
                    /** @description The wallet address of the payee. Required for all requests except crypto-to-fiat */
                    payee?: string;
                    /** @description The payable amount of the invoice, in human readable format */
                    amount: string;
                    /** @description Invoice Currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: USD */
                    invoiceCurrency: string;
                    /** @description Payment currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: ETH-sepolia-sepolia */
                    paymentCurrency: string;
                    /** @description The recurrence of the invoice */
                    recurrence?: {
                        /** @description The start date of the invoice, cannot be in the past */
                        startDate: string;
                        /**
                         * @description The frequency of the invoice
                         * @enum {string}
                         */
                        frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
                    };
                    /** @description Whether crypto-to-fiat payment is available for this request */
                    isCryptoToFiatAvailable?: boolean;
                    /** @description Optional customer information for merchant receipt tracking */
                    customerInfo?: {
                        /** @description Customer's first name */
                        firstName?: string;
                        /** @description Customer's last name */
                        lastName?: string;
                        /**
                         * Format: email
                         * @description Customer's email address
                         */
                        email?: string;
                        /** @description Customer's address */
                        address?: {
                            /** @description Street address */
                            street?: string;
                            /** @description City */
                            city?: string;
                            /** @description State or province */
                            state?: string;
                            /** @description Postal or ZIP code */
                            postalCode?: string;
                            /** @description Country code (ISO 3166-1 alpha-2) */
                            country?: string;
                        };
                    };
                    /** @description Merchant reference for receipt tracking and identification */
                    reference?: string;
                    /** @description ID of the original request for recurring payments */
                    originalRequestId?: string;
                    /** @description Payment reference of the original request for recurring payments */
                    originalRequestPaymentReference?: string;
                };
            };
        };
        responses: {
            /** @description Request created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * @description Unique identifier of the request, used to pay the request as well as check the status of the request
                         * @example 0xb3581f0b0f74cc61
                         */
                        paymentReference?: string;
                        /**
                         * @description Unique identifier of the request, commonly used to look up a request in Request Scan
                         * @example 01e273ecc29d4b526df3a0f1f05ffc59372af8752c2b678096e49ac270416a7cdb
                         */
                        requestId?: string;
                    };
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Wallet not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV2_getRequestStatus_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The requestId for the request */
                requestId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Request status retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Whether the request has been paid */
                        hasBeenPaid?: boolean;
                        /** @description Unique identifier used for payments and status checks */
                        paymentReference?: string;
                        /** @description Unique identifier of the request */
                        requestId?: string;
                        /** @description Whether the system is actively listening for payments on this request */
                        isListening?: boolean;
                        /** @description Transaction hash of the payment, null if not yet paid */
                        txHash?: string | null;
                        /** @description Recurrence configuration for recurring requests */
                        recurrence?: Record<string, never>;
                        /** @description Original request ID for recurring requests */
                        originalRequestId?: string;
                        /** @description Current status of the request */
                        status?: string;
                        /** @description Whether crypto-to-fiat conversion is available for this request */
                        isCryptoToFiatAvailable?: boolean;
                        /** @description Payment reference of the original request for recurring payments */
                        originalRequestPaymentReference?: string;
                        /** @description Array of payments made to this request */
                        payments?: Record<string, never>[];
                        /** @description Whether recurrence has been stopped for this request */
                        isRecurrenceStopped?: boolean;
                        /** @description Customer information for merchant receipt tracking */
                        customerInfo?: {
                            /** @description Customer's first name */
                            firstName?: string;
                            /** @description Customer's last name */
                            lastName?: string;
                            /** @description Customer's email address */
                            email?: string;
                            /** @description Customer's address */
                            address?: {
                                /** @description Street address */
                                street?: string;
                                /** @description City */
                                city?: string;
                                /** @description State or province */
                                state?: string;
                                /** @description Postal or ZIP code */
                                postalCode?: string;
                                /** @description Country code (ISO 3166-1 alpha-2) */
                                country?: string;
                            };
                        } | null;
                        /** @description Merchant reference for receipt tracking and identification */
                        reference?: string | null;
                    };
                };
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV2_updateRequest_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The requestId for the request */
                requestId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Recurrence updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV2_getPaymentCalldata_v2: {
        parameters: {
            query?: {
                /** @description The wallet address of the payer. */
                wallet?: string;
                /** @description The source chain of the crosschain payment */
                chain?: "BASE" | "OPTIMISM" | "ARBITRUM" | "ETHEREUM";
                /** @description The source token of the crosschain payment */
                token?: "USDC" | "USDT" | "DAI";
                /** @description The amount to pay, in human readable format */
                amount?: string;
                /** @description Optional client user ID for off-ramp payments */
                clientUserId?: string;
                /** @description Optional payment details ID for off-ramp payments */
                paymentDetailsId?: string;
                /** @description Fee percentage to apply at payment time (e.g., '2.5' for 2.5%) */
                feePercentage?: string;
                /** @description Address to receive the fee */
                feeAddress?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The requestId of the request */
                requestId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Payment calldata retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Array of transactions to execute for the payment */
                        transactions: {
                            /** @description Transaction calldata */
                            data: string;
                            /** @description Target contract address */
                            to: string;
                            /** @description Payment amount in EVM-compatible format */
                            value: {
                                /** @enum {string} */
                                type?: "BigNumber";
                                /** @description Amount encoded in hex */
                                hex?: string;
                            };
                        }[];
                        /** @description Metadata about the payment requirements */
                        metadata: {
                            /** @description Number of transactions required */
                            stepsRequired: number;
                            /** @description Whether token approval is needed */
                            needsApproval: boolean;
                            /** @description Index of the approval transaction if needed */
                            approvalTransactionIndex?: number | null;
                            /** @description Whether payer has sufficient balance */
                            hasEnoughBalance: boolean;
                            /** @description Whether payer has sufficient gas */
                            hasEnoughGas: boolean;
                        };
                    } | {
                        /** @description Unique identifier for the payment intent */
                        paymentIntentId: string;
                        /** @description EIP-712 typed data for payment intent signature */
                        paymentIntent: string;
                        /** @description EIP-712 typed data for token approval permit (for EIP-2612 compliant tokens) */
                        approvalPermitPayload?: string | null;
                        /** @description Transaction calldata for token approval (for non-EIP-2612 tokens) */
                        approvalCalldata?: {
                            /** @description Token contract address */
                            to?: string;
                            /** @description Approval transaction calldata */
                            data?: string;
                            /** @description Transaction value (usually '0x0') */
                            value?: string;
                        } | null;
                        /** @description Metadata about the crosschain payment */
                        metadata: {
                            /** @description Whether the token supports EIP-2612 permits */
                            supportsEIP2612: boolean;
                        };
                    };
                };
            };
            /** @description Validation failed */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV2_getRequestPaymentRoutes_v2: {
        parameters: {
            query: {
                /** @description The wallet address of the payer */
                wallet: string;
                /** @description The amount to pay, in human readable format */
                amount?: string;
                /** @description Fee percentage to apply at payment time (e.g., '2.5' for 2.5%) */
                feePercentage?: string;
                /** @description Address to receive the fee */
                feeAddress?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The requestId of the request */
                requestId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Available payment routes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Array of available payment routes */
                        routes: {
                            /** @description Unique identifier for the route */
                            id: string;
                            /** @description Total fee for this route (as a decimal, e.g., 0.001 = 0.1%) */
                            fee: number;
                            /** @description Detailed breakdown of all fees for this route */
                            feeBreakdown?: {
                                /**
                                 * @description Type of fee
                                 * @enum {string}
                                 */
                                type?: "gas" | "platform" | "crosschain" | "crypto-to-fiat" | "offramp";
                                /**
                                 * @description Stage when the fee is applied
                                 * @enum {string}
                                 */
                                stage?: "sending" | "receiving" | "proxying" | "refunding" | "overall";
                                /** @description Provider that charged the fee */
                                provider?: string;
                                /** @description Fee amount in human-readable format (formatted with token decimals) */
                                amount?: string;
                                /** @description Fee amount in USD */
                                amountInUSD?: string;
                                /** @description Fee currency */
                                currency?: string;
                                /** @description Address that received the fee */
                                receiverAddress?: string;
                                /** @description Network where the fee was paid */
                                network?: string;
                                /** @description Provider used for rate conversion */
                                rateProvider?: string;
                            }[];
                            /** @description Route speed - 'FAST' for direct payments, number of seconds for crosschain */
                            speed: string | number;
                            /** @description Price impact of the route (as a decimal) */
                            price_impact?: number;
                            /** @description Source chain for the payment */
                            chain: string;
                            /** @description Token symbol for the payment */
                            token: string;
                        }[];
                    };
                };
            };
            /** @description Invalid or missing wallet address */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RequestControllerV2_sendPaymentIntent_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The payment intent ID */
                paymentIntentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The signed payment intent data. */
                    signedPaymentIntent: {
                        /** @description The signature of the permit2 approval for token transfer */
                        signature: string;
                        /** @description The unique nonce for this permit2 transaction */
                        nonce: string;
                        /** @description The Unix timestamp when this permit2 approval expires */
                        deadline: string;
                    };
                    /** @description The EIP2612 gasless token approval data that allows Permit2 to access user tokens */
                    signedApprovalPermit?: {
                        /** @description The signature for the EIP2612 gasless token approval */
                        signature: string;
                        /** @description The unique nonce for the EIP2612 permit */
                        nonce: string;
                        /** @description The Unix timestamp when this EIP2612 permit expires */
                        deadline: string;
                    };
                };
            };
        };
        responses: {
            /** @description Payment intent sent successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Payment intent data not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV1Controller_getComplianceData_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Client User ID */
                    clientUserId: string;
                    /**
                     * Format: email
                     * @description Email
                     */
                    email: string;
                    /** @description First Name */
                    firstName: string;
                    /** @description Last Name */
                    lastName: string;
                    /** @enum {string} */
                    beneficiaryType: "individual" | "business";
                    /** @description Company Name */
                    companyName?: string;
                    /** @description Date of birth in YYYY-MM-DD format */
                    dateOfBirth: string;
                    /** @description Address Line 1 */
                    addressLine1: string;
                    /** @description Address Line 2 */
                    addressLine2?: string;
                    /** @description City */
                    city: string;
                    /** @description State */
                    state: string;
                    /** @description Postcode */
                    postcode: string;
                    /** @description Country */
                    country: string;
                    /** @description Nationality */
                    nationality: string;
                    /** @description Phone in E.164 format */
                    phone: string;
                    /** @description Social Security Number */
                    ssn: string;
                    /** @description Source of Funds */
                    sourceOfFunds?: string;
                    /** @description Business Activity */
                    businessActivity?: string;
                };
            };
        };
        responses: {
            /** @description Compliance data retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uri */
                        agreementUrl?: string;
                        /** Format: uri */
                        kycUrl?: string;
                        status: {
                            /** @enum {string} */
                            agreementStatus: "not_started" | "pending" | "signed" | "completed";
                            /** @enum {string} */
                            kycStatus: "not_started" | "initiated" | "completed";
                        };
                        /** Format: uuid */
                        userId?: string;
                    };
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example Compliance is only required for off-ramp requests */
                        message?: string;
                        /** @example Bad Request */
                        error?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Request with payment reference pay-ref-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV1Controller_getComplianceStatus_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID to check compliance status for */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Compliance status retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example completed */
                        kycStatus?: string;
                        /** @example completed */
                        agreementStatus?: string;
                        /** @example true */
                        isCompliant?: boolean;
                        /** @example a25a4274-8f50-4579-b476-8f35b297d4ad */
                        userId?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Payer with client user ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV1Controller_updateComplianceStatus_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID to update */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    agreementCompleted: boolean;
                };
            };
        };
        responses: {
            /** @description Compliance status updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example true */
                        success?: boolean;
                    };
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example agreementCompleted must be provided */
                        message?: string;
                        /** @example Bad Request */
                        error?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Payer with client user ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV1Controller_getPaymentDetails_v1: {
        parameters: {
            query?: {
                /** @description Optional ID of specific payment details to retrieve */
                paymentDetailsId?: string;
            };
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID to get payment details for */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Payment details retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        paymentDetails?: {
                            /** @example fa898aec-519c-46be-9b4c-e76ef4ff99d9 */
                            id?: string;
                            /** @example a25a4274-8f50-4579-b476-8f35b297d4ad */
                            userId?: string;
                            /** @example Chase */
                            bankName?: string;
                            /** @example Gordon's Chase Business Account */
                            accountName?: string;
                            /** @example business */
                            beneficiaryType?: string;
                            /** @example 253009233489 */
                            accountNumber?: string;
                            /** @example 026013356 */
                            routingNumber?: string;
                            /** @example usd */
                            currency?: string;
                            /** @example approved */
                            status?: string;
                            /** @example local */
                            rails?: string;
                        }[];
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User or payment details not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Payer with client user ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV1Controller_createPaymentDetails_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Name of the bank */
                    bankName: string;
                    /** @description Name of the account holder */
                    accountName: string;
                    /** @description Bank account number */
                    accountNumber?: string;
                    /** @description Bank routing number (US) */
                    routingNumber?: string;
                    /**
                     * @description Type of beneficiary
                     * @enum {string}
                     */
                    beneficiaryType: "individual" | "business";
                    /** @description Three-letter currency code (ISO 4217) */
                    currency: string;
                    /** @description Primary address line */
                    addressLine1: string;
                    /** @description Secondary address line */
                    addressLine2?: string;
                    /** @description City name */
                    city: string;
                    /** @description State or province code */
                    state?: string;
                    /** @description Two-letter country code (ISO 3166-1 alpha-2) */
                    country: string;
                    /** @description Date of birth in YYYY-MM-DD format */
                    dateOfBirth: string;
                    /** @description Postal or ZIP code */
                    postalCode: string;
                    /**
                     * @description Payment rail type
                     * @default local
                     * @enum {string}
                     */
                    rails?: "local" | "swift" | "wire";
                    /** @description UK bank sort code */
                    sortCode?: string;
                    /** @description International Bank Account Number */
                    iban?: string;
                    /** @description SWIFT/BIC code */
                    swiftBic?: string;
                    /** @description Government-issued ID number */
                    documentNumber?: string;
                    /** @description Type of government-issued ID (e.g., passport, driver's license) */
                    documentType?: string;
                    /**
                     * @description Type of bank account
                     * @enum {string}
                     */
                    accountType?: "checking" | "savings";
                    /** @description French RIB number */
                    ribNumber?: string;
                    /** @description Australian BSB number */
                    bsbNumber?: string;
                    /** @description New Zealand NCC number */
                    ncc?: string;
                    /** @description Bank branch code */
                    branchCode?: string;
                    /** @description Bank code */
                    bankCode?: string;
                    /** @description Indian Financial System Code */
                    ifsc?: string;
                };
            };
        };
        responses: {
            /** @description Payment details created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        payment_detail?: {
                            /** @example pd_123456 */
                            id?: string;
                            /** @example user-123 */
                            clientUserId?: string;
                            /** @example Chase */
                            bankName?: string;
                            /** @example Gordon's Chase Business Account */
                            accountName?: string;
                            /** @example usd */
                            currency?: string;
                            /**
                             * @example business
                             * @enum {string}
                             */
                            beneficiaryType?: "individual" | "business";
                        };
                    };
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example Invalid bank account details */
                        message?: string;
                        /** @example Bad Request */
                        error?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example User with ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV2Controller_getComplianceData_v2: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Client User ID */
                    clientUserId: string;
                    /**
                     * Format: email
                     * @description Email
                     */
                    email: string;
                    /** @description First Name */
                    firstName: string;
                    /** @description Last Name */
                    lastName: string;
                    /** @enum {string} */
                    beneficiaryType: "individual" | "business";
                    /** @description Company Name */
                    companyName?: string;
                    /** @description Date of birth in YYYY-MM-DD format */
                    dateOfBirth: string;
                    /** @description Address Line 1 */
                    addressLine1: string;
                    /** @description Address Line 2 */
                    addressLine2?: string;
                    /** @description City */
                    city: string;
                    /** @description State */
                    state: string;
                    /** @description Postcode */
                    postcode: string;
                    /** @description Country */
                    country: string;
                    /** @description Nationality */
                    nationality: string;
                    /** @description Phone in E.164 format */
                    phone: string;
                    /** @description Social Security Number */
                    ssn: string;
                    /** @description Source of Funds */
                    sourceOfFunds?: string;
                    /** @description Business Activity */
                    businessActivity?: string;
                };
            };
        };
        responses: {
            /** @description Compliance data retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: uri */
                        agreementUrl?: string;
                        /** Format: uri */
                        kycUrl?: string;
                        status: {
                            /** @enum {string} */
                            agreementStatus: "not_started" | "pending" | "signed" | "completed";
                            /** @enum {string} */
                            kycStatus: "not_started" | "initiated" | "completed";
                        };
                        /** Format: uuid */
                        userId?: string;
                    };
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example Compliance is only required for off-ramp requests */
                        message?: string;
                        /** @example Bad Request */
                        error?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Request not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Request with payment reference pay-ref-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV2Controller_getComplianceStatus_v2: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID to check compliance status for */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Compliance status retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example completed */
                        kycStatus?: string;
                        /** @example completed */
                        agreementStatus?: string;
                        /** @example true */
                        isCompliant?: boolean;
                        /** @example a25a4274-8f50-4579-b476-8f35b297d4ad */
                        userId?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Payer with client user ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV2Controller_updateComplianceStatus_v2: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID to update */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    agreementCompleted: boolean;
                };
            };
        };
        responses: {
            /** @description Compliance status updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example true */
                        success?: boolean;
                    };
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example agreementCompleted must be provided */
                        message?: string;
                        /** @example Bad Request */
                        error?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Payer with client user ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV2Controller_getPaymentDetails_v2: {
        parameters: {
            query?: {
                /** @description Optional ID of specific payment details to retrieve */
                paymentDetailsId?: string;
            };
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID to get payment details for */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Payment details retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        paymentDetails?: {
                            /** @example fa898aec-519c-46be-9b4c-e76ef4ff99d9 */
                            id?: string;
                            /** @example a25a4274-8f50-4579-b476-8f35b297d4ad */
                            userId?: string;
                            /** @example Chase */
                            bankName?: string;
                            /** @example Gordon's Chase Business Account */
                            accountName?: string;
                            /** @example business */
                            beneficiaryType?: string;
                            /** @example 253009233489 */
                            accountNumber?: string;
                            /** @example 026013356 */
                            routingNumber?: string;
                            /** @example usd */
                            currency?: string;
                            /** @example approved */
                            status?: string;
                            /** @example local */
                            rails?: string;
                        }[];
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User or payment details not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example Payer with client user ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayerV2Controller_createPaymentDetails_v2: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path: {
                /** @description The client user ID */
                clientUserId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Name of the bank */
                    bankName: string;
                    /** @description Name of the account holder */
                    accountName: string;
                    /** @description Bank account number */
                    accountNumber?: string;
                    /** @description Bank routing number (US) */
                    routingNumber?: string;
                    /**
                     * @description Type of beneficiary
                     * @enum {string}
                     */
                    beneficiaryType: "individual" | "business";
                    /** @description Three-letter currency code (ISO 4217) */
                    currency: string;
                    /** @description Primary address line */
                    addressLine1: string;
                    /** @description Secondary address line */
                    addressLine2?: string;
                    /** @description City name */
                    city: string;
                    /** @description State or province code */
                    state?: string;
                    /** @description Two-letter country code (ISO 3166-1 alpha-2) */
                    country: string;
                    /** @description Date of birth in YYYY-MM-DD format */
                    dateOfBirth: string;
                    /** @description Postal or ZIP code */
                    postalCode: string;
                    /**
                     * @description Payment rail type
                     * @default local
                     * @enum {string}
                     */
                    rails?: "local" | "swift" | "wire";
                    /** @description UK bank sort code */
                    sortCode?: string;
                    /** @description International Bank Account Number */
                    iban?: string;
                    /** @description SWIFT/BIC code */
                    swiftBic?: string;
                    /** @description Government-issued ID number */
                    documentNumber?: string;
                    /** @description Type of government-issued ID (e.g., passport, driver's license) */
                    documentType?: string;
                    /**
                     * @description Type of bank account
                     * @enum {string}
                     */
                    accountType?: "checking" | "savings";
                    /** @description French RIB number */
                    ribNumber?: string;
                    /** @description Australian BSB number */
                    bsbNumber?: string;
                    /** @description New Zealand NCC number */
                    ncc?: string;
                    /** @description Bank branch code */
                    branchCode?: string;
                    /** @description Bank code */
                    bankCode?: string;
                    /** @description Indian Financial System Code */
                    ifsc?: string;
                };
            };
        };
        responses: {
            /** @description Payment details created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        payment_detail?: {
                            /** @example pd_123456 */
                            id?: string;
                            /** @example user-123 */
                            clientUserId?: string;
                            /** @example Chase */
                            bankName?: string;
                            /** @example Gordon's Chase Business Account */
                            accountName?: string;
                            /** @example usd */
                            currency?: string;
                            /**
                             * @example business
                             * @enum {string}
                             */
                            beneficiaryType?: "individual" | "business";
                        };
                    };
                };
            };
            /** @description Invalid request data */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example Invalid bank account details */
                        message?: string;
                        /** @example Bad Request */
                        error?: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 404 */
                        statusCode?: number;
                        /** @example User with ID user-123 not found */
                        message?: string;
                        /** @example Not Found */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayV1Controller_payRequest_v1: {
        parameters: {
            query?: never;
            header: {
                /** @description API key for authentication */
                "x-api-key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The wallet address of the payee */
                    payee: string;
                    /** @description The payable amount of the invoice, in human readable format */
                    amount: string;
                    /** @description Invoice Currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: USD */
                    invoiceCurrency: string;
                    /** @description Payment currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: ETH-sepolia-sepolia */
                    paymentCurrency: string;
                };
            };
        };
        responses: {
            /** @description Request created and payment initiated successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        requestId: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Wallet not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PaymentV2Controller_searchPayments_v2: {
        parameters: {
            query?: {
                /** @description Search by blockchain transaction hash (source or destination). Returns ALL payments from the same transaction, including batch payments. Must be a valid 66-character hex string starting with '0x'. Example: '0x1234567890abcdef...' */
                txHash?: string;
                /** @description Search by Ethereum wallet address (payer or payee). Returns ALL payments involving this address, including batch payments where the address is either sender or recipient. Example: '0x6923831ACf5c327260D7ac7C9DfF5b1c3cB3C7D7' */
                walletAddress?: string;
                /** @description Search by unique payment reference generated by the Request Network. This is the hex identifier used for on-chain payments. Example: '0xb3581f0b0f74cc61' */
                paymentReference?: string;
                /** @description Search by Request Network request ID. This is the unique identifier for the payment request. Example: '01e273ecc29d4b526df3a0f1f05ffc59372af8752c2b678096e49ac270416a7cdb' */
                requestId?: string;
                /** @description Search by your custom merchant reference used for receipt tracking and order identification. This is the reference you provided when creating the payment. Example: 'ORDER-2024-001234' or 'INV-5678' */
                reference?: string;
                /** @description Filter by payment type: 'direct' (same currency), 'conversion' (currency conversion), 'crosschain' (cross-chain payment), 'recurring' (subscription payment) */
                type?: "direct" | "conversion" | "crosschain" | "recurring";
                /** @description Invoice Currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: USD */
                invoiceCurrency?: string;
                /** @description Payment currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: ETH-sepolia-sepolia */
                paymentCurrency?: string;
                /** @description Filter payments from this date (inclusive). Must be in ISO 8601 format in UTC (ending with 'Z'). Example: '2024-01-01T00:00:00.000Z' */
                fromDate?: string;
                /** @description Filter payments until this date (inclusive). Must be in ISO 8601 format in UTC (ending with 'Z'). Must be after fromDate if both are provided. Example: '2024-01-31T23:59:59.999Z' */
                toDate?: string;
                limit?: string;
                offset?: string;
            };
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Payment search results with comprehensive payment data and pagination metadata */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Array of matching payments with complete payment details */
                        payments: {
                            /** @description Unique identifier of the payment */
                            id: string;
                            /** @description Payment amount as a human-readable decimal string (formatUnits) */
                            amount: string;
                            /** @description Network where the payment originated */
                            sourceNetwork: string;
                            /** @description Network where the payment was received */
                            destinationNetwork: string;
                            /** @description Transaction hash on the source network */
                            sourceTxHash?: string | null;
                            /** @description Transaction hash on the destination network */
                            destinationTxHash?: string | null;
                            /**
                             * Format: date-time
                             * @description Timestamp when the payment was processed
                             */
                            timestamp: string;
                            /**
                             * @description Type of payment
                             * @enum {string}
                             */
                            type: "direct" | "conversion" | "crosschain" | "recurring";
                            /** @description Conversion rate used for source currency */
                            conversionRateSource?: string | null;
                            /** @description Conversion rate used for destination currency */
                            conversionRateDestination?: string | null;
                            /** @description Converted amount in source currency */
                            convertedAmountSource?: string | null;
                            /** @description Converted amount in destination currency */
                            convertedAmountDestination?: string | null;
                            /** @description Invoice currency symbol */
                            currency: string;
                            /** @description Payment currency symbol */
                            paymentCurrency: string;
                            /** @description Array of fees associated with the payment */
                            fees?: {
                                /**
                                 * @description Type of fee
                                 * @enum {string}
                                 */
                                type?: "gas" | "platform" | "crosschain" | "crypto-to-fiat" | "offramp";
                                /**
                                 * @description Stage when the fee is applied
                                 * @enum {string}
                                 */
                                stage?: "sending" | "receiving" | "proxying" | "refunding";
                                /** @description Provider that charged the fee */
                                provider?: string;
                                /** @description Fee amount in human-readable format (formatted with token decimals) */
                                amount?: string;
                                /** @description Fee amount in USD */
                                amountInUSD?: string;
                                /** @description Fee currency */
                                currency?: string;
                                /** @description Address that received the fee */
                                receiverAddress?: string;
                                /** @description Network where the fee was paid */
                                network?: string;
                                /** @description Provider used for rate conversion */
                                rateProvider?: string;
                            }[] | null;
                            /** @description ID of the recurring payment this payment belongs to */
                            recurringPaymentId?: string | null;
                            /**
                             * @description Provider used for exchange rate data
                             * @enum {string|null}
                             */
                            rateProvider?: "lifi" | "chainlink" | "coingecko" | "unknown" | null;
                            /** @description Associated request information */
                            request?: {
                                /** @description Request ID */
                                requestId?: string;
                                /** @description Payment reference */
                                paymentReference?: string;
                                /** @description Whether the request has been fully paid */
                                hasBeenPaid?: boolean;
                                /** @description Customer information */
                                customerInfo?: {
                                    firstName?: string;
                                    lastName?: string;
                                    email?: string;
                                    address?: {
                                        street?: string;
                                        city?: string;
                                        state?: string;
                                        postalCode?: string;
                                        country?: string;
                                    };
                                } | null;
                                /** @description Merchant reference */
                                reference?: string | null;
                            };
                        }[];
                        /** @description Pagination information for navigating through results */
                        pagination: {
                            /**
                             * @description Total number of payments matching the search criteria
                             * @example 157
                             */
                            total: number;
                            /**
                             * @description Maximum number of results returned in this response
                             * @example 20
                             */
                            limit: number;
                            /**
                             * @description Number of results skipped (for pagination)
                             * @example 0
                             */
                            offset: number;
                            /**
                             * @description Whether there are more results available beyond this page
                             * @example true
                             */
                            hasMore: boolean;
                        };
                    };
                };
            };
            /** @description Invalid search parameters or validation errors */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 400 */
                        statusCode?: number;
                        /** @example Validation failed */
                        message?: string;
                        errors?: {
                            /** @example toDate */
                            field?: string;
                            /** @example toDate must be after or equal to fromDate */
                            message?: string;
                        }[];
                    };
                };
            };
            /** @description Authentication required - API key or client ID missing */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 401 */
                        statusCode?: number;
                        /** @example Unauthorized */
                        message?: string;
                        /** @example Unauthorized */
                        error?: string;
                    };
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayoutV2Controller_payRequest_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The wallet address of the payee */
                    payee: string;
                    /** @description The payable amount of the invoice, in human readable format */
                    amount: string;
                    /** @description Invoice Currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: USD */
                    invoiceCurrency: string;
                    /** @description Payment currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: ETH-sepolia-sepolia */
                    paymentCurrency: string;
                    /** @description Fee percentage to apply at payment time (e.g., '2.5' for 2.5%) */
                    feePercentage?: string;
                    /** @description Address to receive the fee */
                    feeAddress?: string;
                    /** @description Configuration details for recurring payments */
                    recurrence?: {
                        /** @description The start date of the payment, cannot be in the past */
                        startDate: string;
                        /**
                         * @description The frequency of the payment
                         * @enum {string}
                         */
                        frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
                        /** @description The total number of times the payment will be executed (max 256). */
                        totalPayments: number;
                        /** @description The wallet address of the payer. Cannot be the same as the payee address. */
                        payer: string;
                    };
                    /** @description The wallet address of the payer, use to check if payer approval exists */
                    payerWallet?: string;
                    /** @description Optional customer information for merchant receipt tracking */
                    customerInfo?: {
                        /** @description Customer's first name */
                        firstName?: string;
                        /** @description Customer's last name */
                        lastName?: string;
                        /**
                         * Format: email
                         * @description Customer's email address
                         */
                        email?: string;
                        /** @description Customer's address */
                        address?: {
                            /** @description Street address */
                            street?: string;
                            /** @description City */
                            city?: string;
                            /** @description State or province */
                            state?: string;
                            /** @description Postal or ZIP code */
                            postalCode?: string;
                            /** @description Country code (ISO 3166-1 alpha-2) */
                            country?: string;
                        };
                    };
                    /** @description Merchant reference for receipt tracking and identification */
                    reference?: string;
                };
            };
        };
        responses: {
            /** @description Request created and payment initiated successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        requestId: string;
                    };
                };
            };
            /** @description Wallet not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayoutV2Controller_payBatchRequest_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description A list of payment requests to be created andprocessed in batch. All requests must be on the same network and contain payment/invoice currency information. Either `requests` or `requestIds` must be provided, but not both. */
                    requests?: {
                        /** @description The wallet address of the payee */
                        payee: string;
                        /** @description The payable amount of the invoice, in human readable format */
                        amount: string;
                        /** @description Invoice Currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: USD */
                        invoiceCurrency: string;
                        /** @description Payment currency ID, from the [Request Network Token List](https://docs.request.network/general/request-network-token-list) e.g: ETH-sepolia-sepolia */
                        paymentCurrency: string;
                    }[];
                    /** @description The request IDs of the existing requests to be paid. Requests must be on the same network. Either `requests` or `requestIds` must be provided, but not both. */
                    requestIds?: string[];
                    /** @description The wallet address of the payer, user to check if approval is needed or not. */
                    payer?: string;
                };
            };
        };
        responses: {
            /** @description Batch payment calldata retrieved successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @description Array of ERC20 approval transactions needed before the batch payment. Only present when token approval is required. */
                        ERC20ApprovalTransactions?: {
                            /** @description Transaction calldata for the ERC20 approval */
                            data: string;
                            /** @description Target ERC20 token contract address for approval */
                            to: string;
                            /** @description Always 0 for ERC20 approvals */
                            value: number;
                        }[];
                        /** @description The batch payment transaction for ERC20 tokens. Only present when the batch contains ERC20 payments. */
                        ERC20BatchPaymentTransaction?: {
                            /** @description Transaction calldata for the ERC20 batch payment */
                            data: string;
                            /** @description Target batch payment contract address */
                            to: string;
                            value: {
                                /** @enum {string} */
                                type: "BigNumber";
                                /** @description Payment amount in EVM-compatible format, encoded in hex. Usually 0 for ERC20 payments */
                                hex: string;
                            };
                        };
                        /** @description The batch payment transaction for native ETH. Only present when the batch contains ETH payments. */
                        ETHBatchPaymentTransaction?: {
                            /** @description Transaction calldata for the ETH batch payment */
                            data: string;
                            /** @description Target batch payment contract address */
                            to: string;
                            value: {
                                /** @enum {string} */
                                type: "BigNumber";
                                /** @description Payment amount in EVM-compatible format, encoded in hex. Contains the ETH value to send */
                                hex: string;
                            };
                        };
                    };
                };
            };
            /** @description Requests must be on the same network */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayoutV2Controller_getRecurringPaymentStatus_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The ID of the recurring payment */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Recurring payment status retrieved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Recurring payment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayoutV2Controller_submitRecurringPaymentSignature_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The ID of the recurring payment */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The signature of the recurring payment permit. */
                    permitSignature: string;
                };
            };
        };
        responses: {
            /** @description Recurring payment signature submitted successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Recurring payment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PayoutV2Controller_updateRecurringPayment_v2: {
        parameters: {
            query?: never;
            header?: {
                /** @description API key for authentication (optional if using Client ID) */
                "x-api-key"?: string;
                /** @description Client ID for frontend authentication (optional if using API key) */
                "x-client-id"?: string;
                /** @description Origin header (required for Client ID auth, automatically set by browser) */
                Origin?: string;
            };
            path: {
                /** @description The ID of the recurring payment */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @description The action to perform on the recurring payment
                     * @enum {string}
                     */
                    action: "cancel" | "unpause";
                };
            };
        };
        responses: {
            /** @description Recurring payment updated successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Bad request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Recurring payment not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

export { DEFAULT_RETRY_CONFIG as D, type HttpAdapter as H, type Interceptor as I, type LogLevel as L, type QuerySerializer as Q, type RetryConfig as R, type RuntimeValidationOption as a, type HttpClient as b, type RequestOptions as c, type RetryDecision as d, type RetryDecisionInput as e, type RetryResponseLike as f, type RetryJitter as g, computeRetryDelay as h, type HttpMethod as i, type RuntimeValidationConfig as j, type operations as o, shouldRetryRequest as s };
