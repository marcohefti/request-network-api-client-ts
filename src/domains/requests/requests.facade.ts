import { buildRequestQuery, normalizeRequestStatusResponse, type RequestStatusResult } from "./request.helpers";
import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson, requestVoid } from "../../core/http/operation.helper";
import type { operations } from "../../generated/openapi-types";
import { ValidationError } from "../../validation/zod.helpers";

const OP_CREATE = "RequestControllerV2_createRequest_v2" as const;
const OP_LIST = "RequestControllerV2_listRequests_v2" as const;
const OP_PAYMENT_ROUTES = "RequestControllerV2_getRequestPaymentRoutes_v2" as const;
const OP_PAYMENT_CALLDATA = "RequestControllerV2_getPaymentCalldata_v2" as const;
const OP_UPDATE = "RequestControllerV2_updateRequest_v2" as const;
const OP_SEND_PAYMENT_INTENT = "RequestControllerV2_sendPaymentIntent_v2" as const;
const OP_REQUEST_STATUS = "RequestControllerV2_getRequestStatus_v2" as const;
const PATH_BASE = "/v2/request" as const;

type CreateRequestBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreateRequestResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];
type ListRequestsQuery = operations[typeof OP_LIST]["parameters"]["query"];
export type ListRequestsResponse = operations[typeof OP_LIST]["responses"][200]["content"]["application/json"];
type UpdateRequestBody = operations[typeof OP_UPDATE]["requestBody"]["content"]["application/json"];

export type PaymentRoutesResponse = operations[typeof OP_PAYMENT_ROUTES]["responses"][200]["content"]["application/json"];
export type PaymentRoute = PaymentRoutesResponse["routes"][number];
type PaymentRoutesQuery = NonNullable<operations[typeof OP_PAYMENT_ROUTES]["parameters"]["query"]>;

type PaymentCalldataQuery = NonNullable<operations[typeof OP_PAYMENT_CALLDATA]["parameters"]["query"]>;
type RawPaymentCalldata = operations[typeof OP_PAYMENT_CALLDATA]["responses"][200]["content"]["application/json"];
type RequestStatusResponse = operations[typeof OP_REQUEST_STATUS]["responses"][200]["content"]["application/json"];

type PaymentIntentPayload = Extract<RawPaymentCalldata, { paymentIntentId: string }>;
type CalldataPayload = Extract<RawPaymentCalldata, { transactions: unknown }>;

const KIND_CALLDATA = "calldata" as const;
const KIND_PAYMENT_INTENT = "paymentIntent" as const;

function isPaymentIntentPayload(payload: RawPaymentCalldata): payload is PaymentIntentPayload {
  return "paymentIntentId" in payload;
}

function isCalldataPayload(payload: RawPaymentCalldata): payload is CalldataPayload {
  return "transactions" in payload;
}

type SendPaymentIntentBody = operations[typeof OP_SEND_PAYMENT_INTENT]["requestBody"]["content"]["application/json"];

export interface RequestOperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export type GetPaymentRoutesOptions = RequestOperationOptions & {
  wallet: PaymentRoutesQuery["wallet"];
} & Partial<Omit<PaymentRoutesQuery, "wallet">>;

export type GetPaymentCalldataOptions = RequestOperationOptions & Partial<PaymentCalldataQuery>;

export type ListRequestsOptions = RequestOperationOptions & ListRequestsQuery;

export type PaymentCalldataResult =
  | ({ kind: "calldata" } & CalldataPayload)
  | ({ kind: "paymentIntent" } & PaymentIntentPayload);
export type { RequestStatusResult };

export interface RequestsApi {
  list(options: ListRequestsOptions): Promise<ListRequestsResponse>;
  create(body: CreateRequestBody, options?: RequestOperationOptions): Promise<CreateRequestResponse>;
  getPaymentRoutes(requestId: string, options: GetPaymentRoutesOptions): Promise<PaymentRoutesResponse>;
  getPaymentCalldata(requestId: string, options?: GetPaymentCalldataOptions): Promise<PaymentCalldataResult>;
  getRequestStatus(requestId: string, options?: RequestOperationOptions): Promise<RequestStatusResult>;
  update(requestId: string, body: UpdateRequestBody, options?: RequestOperationOptions): Promise<void>;
  sendPaymentIntent(paymentIntentId: string, body: SendPaymentIntentBody, options?: RequestOperationOptions): Promise<void>;
}

export function createRequestsApi(http: HttpClient): RequestsApi {
  return {
    async list(options) {
      return requestJson<ListRequestsResponse>(http, {
        operationId: OP_LIST,
        method: "GET",
        path: PATH_BASE,
        query: buildRequestQuery({
          walletAddress: options.walletAddress,
          limit: options.limit,
          offset: options.offset,
        }),
        schemaKey: { operationId: OP_LIST, kind: "response", status: 200 },
        description: "List requests",
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        validation: options.validation,
        meta: options.meta,
      });
    },

    async create(body: CreateRequestBody, options?: RequestOperationOptions) {
      return requestJson<CreateRequestResponse>(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: PATH_BASE,
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create request",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getRequestStatus(requestId: string, options?: RequestOperationOptions) {
      const path = `${PATH_BASE}/${encodeURIComponent(requestId)}`;
      const raw = await requestJson<RequestStatusResponse>(http, {
        operationId: OP_REQUEST_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_REQUEST_STATUS, kind: "response", status: 200 },
        description: "Request status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });

      return normalizeRequestStatusResponse(raw);
    },

    async getPaymentRoutes(requestId: string, options: GetPaymentRoutesOptions) {
      const path = `${PATH_BASE}/${encodeURIComponent(requestId)}/routes`;
      return requestJson<PaymentRoutesResponse>(http, {
        operationId: OP_PAYMENT_ROUTES,
        method: "GET",
        path,
        query: buildRequestQuery({
          wallet: options.wallet,
          amount: options.amount,
          feePercentage: options.feePercentage,
          feeAddress: options.feeAddress,
        }),
        schemaKey: { operationId: OP_PAYMENT_ROUTES, kind: "response", status: 200 },
        description: "Payment routes",
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        validation: options.validation,
        meta: options.meta,
      });
    },

    async getPaymentCalldata(requestId: string, options?: GetPaymentCalldataOptions) {
      const path = `${PATH_BASE}/${encodeURIComponent(requestId)}/pay`;
      const queryInput: Record<string, unknown> = {
        wallet: options?.wallet,
        chain: options?.chain,
        token: options?.token,
        amount: options?.amount,
        clientUserId: options?.clientUserId,
        paymentDetailsId: options?.paymentDetailsId,
        feePercentage: options?.feePercentage,
        feeAddress: options?.feeAddress,
      };
      const raw = await requestJson<RawPaymentCalldata>(http, {
        operationId: OP_PAYMENT_CALLDATA,
        method: "GET",
        path,
        query: buildRequestQuery(queryInput),
        schemaKey: { operationId: OP_PAYMENT_CALLDATA, kind: "response", status: 200 },
        description: "Payment calldata",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });

      if (isCalldataPayload(raw)) {
        return { kind: KIND_CALLDATA, ...raw };
      }
      if (isPaymentIntentPayload(raw)) {
        return { kind: KIND_PAYMENT_INTENT, ...raw };
      }

      throw new ValidationError("Unexpected payment calldata response", raw);
    },

    async update(requestId: string, body: UpdateRequestBody, options?: RequestOperationOptions) {
      const path = `${PATH_BASE}/${encodeURIComponent(requestId)}`;
      await requestVoid(http, {
        operationId: OP_UPDATE,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE, kind: "request", variant: "application/json" },
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async sendPaymentIntent(paymentIntentId: string, body: SendPaymentIntentBody, options?: RequestOperationOptions) {
      const path = `${PATH_BASE}/payment-intents/${encodeURIComponent(paymentIntentId)}`;
      await requestVoid(http, {
        operationId: OP_SEND_PAYMENT_INTENT,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_SEND_PAYMENT_INTENT, kind: "request", variant: "application/json" },
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}
