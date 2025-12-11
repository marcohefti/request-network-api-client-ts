import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson } from "../../core/http/operation.helper";
import type { operations } from "../../generated/openapi-types";

const OP_CREATE = "PayoutV2Controller_payRequest_v2" as const;
const OP_CREATE_BATCH = "PayoutV2Controller_payBatchRequest_v2" as const;
const OP_RECURRING_STATUS = "PayoutV2Controller_getRecurringPaymentStatus_v2" as const;
const OP_SUBMIT_SIGNATURE = "PayoutV2Controller_submitRecurringPaymentSignature_v2" as const;
const OP_UPDATE_RECURRING = "PayoutV2Controller_updateRecurringPayment_v2" as const;

type CreatePayoutBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreatePayoutResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];

type CreateBatchBody = operations[typeof OP_CREATE_BATCH]["requestBody"]["content"]["application/json"];
type CreateBatchResponse = operations[typeof OP_CREATE_BATCH]["responses"][201]["content"]["application/json"];

type RecurringStatusResponse = operations[typeof OP_RECURRING_STATUS]["responses"][200]["content"]["application/json"];

type SubmitRecurringSignatureBody = operations[typeof OP_SUBMIT_SIGNATURE]["requestBody"]["content"]["application/json"];
type SubmitRecurringSignatureResponse = operations[typeof OP_SUBMIT_SIGNATURE]["responses"][201]["content"]["application/json"];

type UpdateRecurringBody = operations[typeof OP_UPDATE_RECURRING]["requestBody"]["content"]["application/json"];
type UpdateRecurringResponse = operations[typeof OP_UPDATE_RECURRING]["responses"][200]["content"]["application/json"];

export interface PayoutOperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export interface PayoutsApi {
  create(body: CreatePayoutBody, options?: PayoutOperationOptions): Promise<CreatePayoutResponse>;
  createBatch(body: CreateBatchBody, options?: PayoutOperationOptions): Promise<CreateBatchResponse>;
  getRecurringStatus(recurringId: string, options?: PayoutOperationOptions): Promise<RecurringStatusResponse>;
  submitRecurringSignature(recurringId: string, body: SubmitRecurringSignatureBody, options?: PayoutOperationOptions): Promise<SubmitRecurringSignatureResponse>;
  updateRecurring(recurringId: string, body: UpdateRecurringBody, options?: PayoutOperationOptions): Promise<UpdateRecurringResponse>;
}

export function createPayoutsApi(http: HttpClient): PayoutsApi {
  return {
    async create(body, options) {
      return requestJson<CreatePayoutResponse>(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: "/v2/payouts",
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create payout",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async createBatch(body, options) {
      return requestJson<CreateBatchResponse>(http, {
        operationId: OP_CREATE_BATCH,
        method: "POST",
        path: "/v2/payouts/batch",
        body,
        requestSchemaKey: { operationId: OP_CREATE_BATCH, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_BATCH, kind: "response", status: 201 },
        description: "Create payout batch",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getRecurringStatus(recurringId, options) {
      const path = `/v2/payouts/recurring/${encodeURIComponent(recurringId)}`;
      return requestJson<RecurringStatusResponse>(http, {
        operationId: OP_RECURRING_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_RECURRING_STATUS, kind: "response", status: 200 },
        description: "Get recurring payout status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async submitRecurringSignature(recurringId, body, options) {
      const path = `/v2/payouts/recurring/${encodeURIComponent(recurringId)}`;
      return requestJson<SubmitRecurringSignatureResponse>(http, {
        operationId: OP_SUBMIT_SIGNATURE,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_SUBMIT_SIGNATURE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_SUBMIT_SIGNATURE, kind: "response", status: 201 },
        description: "Submit recurring payout signature",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async updateRecurring(recurringId, body, options) {
      const path = `/v2/payouts/recurring/${encodeURIComponent(recurringId)}`;
      return requestJson<UpdateRecurringResponse>(http, {
        operationId: OP_UPDATE_RECURRING,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE_RECURRING, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_UPDATE_RECURRING, kind: "response", status: 200 },
        description: "Update recurring payout",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}
