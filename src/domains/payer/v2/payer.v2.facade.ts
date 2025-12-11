import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../../core/http/http.types";
import { requestJson } from "../../../core/http/operation.helper";
import type { operations } from "../../../generated/openapi-types";

const OP_CREATE_COMPLIANCE = "PayerV2Controller_getComplianceData_v2" as const;
const OP_GET_STATUS = "PayerV2Controller_getComplianceStatus_v2" as const;
const OP_UPDATE_STATUS = "PayerV2Controller_updateComplianceStatus_v2" as const;
const OP_CREATE_PAYMENT_DETAILS = "PayerV2Controller_createPaymentDetails_v2" as const;
const OP_GET_PAYMENT_DETAILS = "PayerV2Controller_getPaymentDetails_v2" as const;

type CreateComplianceBody = operations[typeof OP_CREATE_COMPLIANCE]["requestBody"]["content"]["application/json"];
type CreateComplianceResponse = operations[typeof OP_CREATE_COMPLIANCE]["responses"][200]["content"]["application/json"];

type ComplianceStatusResponse = operations[typeof OP_GET_STATUS]["responses"][200]["content"]["application/json"];

type UpdateComplianceBody = operations[typeof OP_UPDATE_STATUS]["requestBody"]["content"]["application/json"];
type UpdateComplianceResponse = operations[typeof OP_UPDATE_STATUS]["responses"][200]["content"]["application/json"];

type CreatePaymentDetailsBody = operations[typeof OP_CREATE_PAYMENT_DETAILS]["requestBody"]["content"]["application/json"];
type CreatePaymentDetailsResponse = operations[typeof OP_CREATE_PAYMENT_DETAILS]["responses"][201]["content"]["application/json"];

type GetPaymentDetailsResponse = operations[typeof OP_GET_PAYMENT_DETAILS]["responses"][200]["content"]["application/json"];

export interface PayerV2OperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export interface PayerV2Api {
  createComplianceData(body: CreateComplianceBody, options?: PayerV2OperationOptions): Promise<CreateComplianceResponse>;
  getComplianceStatus(clientUserId: string, options?: PayerV2OperationOptions): Promise<ComplianceStatusResponse>;
  updateComplianceStatus(
    clientUserId: string,
    body: UpdateComplianceBody,
    options?: PayerV2OperationOptions,
  ): Promise<UpdateComplianceResponse>;
  createPaymentDetails(
    clientUserId: string,
    body: CreatePaymentDetailsBody,
    options?: PayerV2OperationOptions,
  ): Promise<CreatePaymentDetailsResponse>;
  getPaymentDetails(clientUserId: string, options?: PayerV2OperationOptions): Promise<GetPaymentDetailsResponse>;
}

export function createPayerV2Api(http: HttpClient): PayerV2Api {
  return {
    async createComplianceData(body, options) {
      return requestJson<CreateComplianceResponse>(http, {
        operationId: OP_CREATE_COMPLIANCE,
        method: "POST",
        path: "/v2/payer",
        body,
        requestSchemaKey: { operationId: OP_CREATE_COMPLIANCE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_COMPLIANCE, kind: "response", status: 200 },
        description: "Create compliance data",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getComplianceStatus(clientUserId, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson<ComplianceStatusResponse>(http, {
        operationId: OP_GET_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_STATUS, kind: "response", status: 200 },
        description: "Get compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async updateComplianceStatus(clientUserId, body, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson<UpdateComplianceResponse>(http, {
        operationId: OP_UPDATE_STATUS,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE_STATUS, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_UPDATE_STATUS, kind: "response", status: 200 },
        description: "Update compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async createPaymentDetails(clientUserId, body, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson<CreatePaymentDetailsResponse>(http, {
        operationId: OP_CREATE_PAYMENT_DETAILS,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS, kind: "response", status: 201 },
        description: "Create payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getPaymentDetails(clientUserId, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson<GetPaymentDetailsResponse>(http, {
        operationId: OP_GET_PAYMENT_DETAILS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_PAYMENT_DETAILS, kind: "response", status: 200 },
        description: "Get payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}
