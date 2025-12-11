import { o as operations, a as RuntimeValidationOption, c as RequestOptions, b as HttpClient } from './openapi-types-CtUFCrk4.mjs';

interface RequestStatusAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
interface RequestStatusCustomerInfo {
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: RequestStatusAddress;
}
type RequestStatusKind = "paid" | "pending" | "cancelled" | "overdue" | "unknown";
interface RequestStatusBase {
    paymentReference?: string;
    requestId?: string;
    isListening?: boolean;
    txHash: string | null;
    status?: string;
    recurrence?: Record<string, unknown>;
    originalRequestId?: string;
    originalRequestPaymentReference?: string;
    isRecurrenceStopped?: boolean;
    isCryptoToFiatAvailable?: boolean;
    payments?: Array<Record<string, unknown>>;
    customerInfo?: RequestStatusCustomerInfo | null;
    reference?: string | null;
    hasBeenPaid?: boolean;
}
type RequestStatusResult = (RequestStatusBase & {
    kind: "paid";
    hasBeenPaid: true;
}) | (RequestStatusBase & {
    kind: "pending";
    hasBeenPaid?: boolean;
}) | (RequestStatusBase & {
    kind: "cancelled";
    hasBeenPaid?: boolean;
}) | (RequestStatusBase & {
    kind: "overdue";
    hasBeenPaid?: boolean;
}) | (RequestStatusBase & {
    kind: "unknown";
    hasBeenPaid?: boolean;
});
type LegacyRequestStatusResult = Extract<RequestStatusResult, {
    kind: "paid" | "pending";
}>;

declare const OP_CREATE: "RequestControllerV2_createRequest_v2";
declare const OP_PAYMENT_ROUTES: "RequestControllerV2_getRequestPaymentRoutes_v2";
declare const OP_PAYMENT_CALLDATA: "RequestControllerV2_getPaymentCalldata_v2";
declare const OP_SEND_PAYMENT_INTENT: "RequestControllerV2_sendPaymentIntent_v2";
type CreateRequestBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreateRequestResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];
type PaymentRoutesResponse = operations[typeof OP_PAYMENT_ROUTES]["responses"][200]["content"]["application/json"];
type PaymentRoute = PaymentRoutesResponse["routes"][number];
type PaymentRoutesQuery = NonNullable<operations[typeof OP_PAYMENT_ROUTES]["parameters"]["query"]>;
type PaymentCalldataQuery = NonNullable<operations[typeof OP_PAYMENT_CALLDATA]["parameters"]["query"]>;
type RawPaymentCalldata = operations[typeof OP_PAYMENT_CALLDATA]["responses"][200]["content"]["application/json"];
type PaymentIntentPayload = Extract<RawPaymentCalldata, {
    paymentIntentId: string;
}>;
type CalldataPayload = Extract<RawPaymentCalldata, {
    transactions: unknown;
}>;
type SendPaymentIntentBody = operations[typeof OP_SEND_PAYMENT_INTENT]["requestBody"]["content"]["application/json"];
interface RequestOperationOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
type GetPaymentRoutesOptions = RequestOperationOptions & {
    wallet: PaymentRoutesQuery["wallet"];
} & Partial<Omit<PaymentRoutesQuery, "wallet">>;
type GetPaymentCalldataOptions = RequestOperationOptions & Partial<PaymentCalldataQuery>;
type PaymentCalldataResult = ({
    kind: "calldata";
} & CalldataPayload) | ({
    kind: "paymentIntent";
} & PaymentIntentPayload);

interface RequestsApi {
    create(body: CreateRequestBody, options?: RequestOperationOptions): Promise<CreateRequestResponse>;
    getPaymentRoutes(requestId: string, options: GetPaymentRoutesOptions): Promise<PaymentRoutesResponse>;
    getPaymentCalldata(requestId: string, options?: GetPaymentCalldataOptions): Promise<PaymentCalldataResult>;
    getRequestStatus(requestId: string, options?: RequestOperationOptions): Promise<RequestStatusResult>;
    update(requestId: string, options?: RequestOperationOptions): Promise<void>;
    sendPaymentIntent(paymentIntentId: string, body: SendPaymentIntentBody, options?: RequestOperationOptions): Promise<void>;
}
declare function createRequestsApi(http: HttpClient): RequestsApi;

type index_GetPaymentCalldataOptions = GetPaymentCalldataOptions;
type index_GetPaymentRoutesOptions = GetPaymentRoutesOptions;
type index_PaymentCalldataResult = PaymentCalldataResult;
type index_PaymentRoute = PaymentRoute;
type index_PaymentRoutesResponse = PaymentRoutesResponse;
type index_RequestOperationOptions = RequestOperationOptions;
type index_RequestStatusAddress = RequestStatusAddress;
type index_RequestStatusCustomerInfo = RequestStatusCustomerInfo;
type index_RequestStatusKind = RequestStatusKind;
type index_RequestStatusResult = RequestStatusResult;
type index_RequestsApi = RequestsApi;
declare const index_createRequestsApi: typeof createRequestsApi;
declare namespace index {
  export { type index_GetPaymentCalldataOptions as GetPaymentCalldataOptions, type index_GetPaymentRoutesOptions as GetPaymentRoutesOptions, type index_PaymentCalldataResult as PaymentCalldataResult, type index_PaymentRoute as PaymentRoute, type index_PaymentRoutesResponse as PaymentRoutesResponse, type index_RequestOperationOptions as RequestOperationOptions, type index_RequestStatusAddress as RequestStatusAddress, type index_RequestStatusCustomerInfo as RequestStatusCustomerInfo, type index_RequestStatusKind as RequestStatusKind, type index_RequestStatusResult as RequestStatusResult, type index_RequestsApi as RequestsApi, index_createRequestsApi as createRequestsApi };
}

export { type GetPaymentCalldataOptions as G, type LegacyRequestStatusResult as L, type PaymentCalldataResult as P, type RequestsApi as R, type PaymentRoutesResponse as a, type PaymentRoute as b, type RequestStatusResult as c, createRequestsApi as d, type RequestOperationOptions as e, type GetPaymentRoutesOptions as f, type RequestStatusKind as g, type RequestStatusCustomerInfo as h, index as i, type RequestStatusAddress as j };
