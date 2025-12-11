import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../../core/http/http.types";
import { requestJson, requestVoid } from "../../../core/http/operation.helper";
import type { operations } from "../../../generated/openapi-types";
import { ValidationError } from "../../../validation/zod.helpers";
import {
  buildRequestQuery,
  normalizeLegacyStatusResponse,
  type LegacyRequestStatusResult,
} from "../request.helpers";

const OP_CREATE = "RequestControllerV1_createRequest_v1" as const;
const OP_PAYMENT_ROUTES = "RequestControllerV1_getRequestPaymentRoutes_v1" as const;
const OP_PAYMENT_CALLDATA = "RequestControllerV1_getPaymentCalldata_v1" as const;
const OP_REQUEST_STATUS = "RequestControllerV1_getRequestStatus_v1" as const;
const OP_SEND_PAYMENT_INTENT = "RequestControllerV1_sendPaymentIntent_v1" as const;
const OP_STOP_RECURRENCE = "RequestControllerV1_stopRecurrenceRequest_v1" as const;

type CreateRequestBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreateRequestResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];

type PaymentRoutesResponse = operations[typeof OP_PAYMENT_ROUTES]["responses"][200]["content"]["application/json"];
type PaymentRoutesQuery = operations[typeof OP_PAYMENT_ROUTES]["parameters"]["query"];

type PaymentCalldataQuery = NonNullable<operations[typeof OP_PAYMENT_CALLDATA]["parameters"]["query"]>;
type RawPaymentCalldata = operations[typeof OP_PAYMENT_CALLDATA]["responses"][200]["content"]["application/json"];

type RawStatusResponse = operations[typeof OP_REQUEST_STATUS]["responses"][200]["content"]["application/json"];

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

export interface RequestV1OperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export type GetPaymentRoutesOptions = RequestV1OperationOptions & {
  wallet: PaymentRoutesQuery["wallet"];
} & Partial<Omit<PaymentRoutesQuery, "wallet">>;

export type GetPaymentCalldataOptions = RequestV1OperationOptions & Partial<PaymentCalldataQuery>;

export type RequestStatusResult = LegacyRequestStatusResult;

export type SendPaymentIntentBody = operations[typeof OP_SEND_PAYMENT_INTENT]["requestBody"]["content"]["application/json"];

export interface RequestsV1Api {
  create(body: CreateRequestBody, options?: RequestV1OperationOptions): Promise<CreateRequestResponse>;
  getPaymentRoutes(paymentReference: string, options: GetPaymentRoutesOptions): Promise<PaymentRoutesResponse>;
  getPaymentCalldata(paymentReference: string, options?: GetPaymentCalldataOptions): Promise<
    | ({ kind: "calldata" } & CalldataPayload)
    | ({ kind: "paymentIntent" } & PaymentIntentPayload)
  >;
  getRequestStatus(paymentReference: string, options?: RequestV1OperationOptions): Promise<RequestStatusResult>;
  sendPaymentIntent(paymentIntentId: string, body: SendPaymentIntentBody, options?: RequestV1OperationOptions): Promise<void>;
  stopRecurrence(paymentReference: string, options?: RequestV1OperationOptions): Promise<void>;
}

export function createRequestsV1Api(http: HttpClient): RequestsV1Api {
  return {
    async create(body, options) {
      return requestJson<CreateRequestResponse>(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: "/v1/request",
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create legacy request",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getPaymentRoutes(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}/routes`;
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
        description: "Legacy payment routes",
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        validation: options.validation,
        meta: options.meta,
      });
    },

    async getPaymentCalldata(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}/pay`;
      const query = buildRequestQuery({
        wallet: options?.wallet,
        chain: options?.chain,
        token: options?.token,
        amount: options?.amount,
      });

      const raw = await requestJson<RawPaymentCalldata>(http, {
        operationId: OP_PAYMENT_CALLDATA,
        method: "GET",
        path,
        query,
        schemaKey: { operationId: OP_PAYMENT_CALLDATA, kind: "response", status: 200 },
        description: "Legacy payment calldata",
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

    async getRequestStatus(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}`;
      const rawStatus = await requestJson<RawStatusResponse>(http, {
        operationId: OP_REQUEST_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_REQUEST_STATUS, kind: "response", status: 200 },
        description: "Legacy request status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });

      return normalizeLegacyStatusResponse(rawStatus);
    },

    async sendPaymentIntent(paymentIntentId, body, options) {
      const path = `/v1/request/${encodeURIComponent(paymentIntentId)}/send`;
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

    async stopRecurrence(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}/stop-recurrence`;
      await requestVoid(http, {
        operationId: OP_STOP_RECURRENCE,
        method: "PATCH",
        path,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}
