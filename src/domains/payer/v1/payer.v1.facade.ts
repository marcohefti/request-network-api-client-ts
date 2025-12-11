import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../../core/http/http.types";
import { requestJson } from "../../../core/http/operation.helper";
import type { operations } from "../../../generated/openapi-types";

const OP_CREATE_COMPLIANCE = "PayerV1Controller_getComplianceData_v1" as const;
const OP_GET_STATUS = "PayerV1Controller_getComplianceStatus_v1" as const;
const OP_UPDATE_STATUS = "PayerV1Controller_updateComplianceStatus_v1" as const;
const OP_CREATE_PAYMENT_DETAILS = "PayerV1Controller_createPaymentDetails_v1" as const;
const OP_GET_PAYMENT_DETAILS = "PayerV1Controller_getPaymentDetails_v1" as const;

type CreateComplianceBody = operations[typeof OP_CREATE_COMPLIANCE]["requestBody"]["content"]["application/json"];
type CreateComplianceResponse = operations[typeof OP_CREATE_COMPLIANCE]["responses"][200]["content"]["application/json"];

type ComplianceStatusResponse = operations[typeof OP_GET_STATUS]["responses"][200]["content"]["application/json"];

type UpdateComplianceBody = operations[typeof OP_UPDATE_STATUS]["requestBody"]["content"]["application/json"];
type UpdateComplianceResponse = operations[typeof OP_UPDATE_STATUS]["responses"][200]["content"]["application/json"];

type CreatePaymentDetailsBody = operations[typeof OP_CREATE_PAYMENT_DETAILS]["requestBody"]["content"]["application/json"];
type CreatePaymentDetailsResponse = operations[typeof OP_CREATE_PAYMENT_DETAILS]["responses"][201]["content"]["application/json"];

type GetPaymentDetailsResponse = operations[typeof OP_GET_PAYMENT_DETAILS]["responses"][200]["content"]["application/json"];

export interface PayerV1OperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export interface PayerV1Api {
  createComplianceData(body: CreateComplianceBody, options?: PayerV1OperationOptions): Promise<CreateComplianceResponse>;
  getComplianceStatus(clientUserId: string, options?: PayerV1OperationOptions): Promise<ComplianceStatusResponse>;
  updateComplianceStatus(
    clientUserId: string,
    body: UpdateComplianceBody,
    options?: PayerV1OperationOptions,
  ): Promise<UpdateComplianceResponse>;
  createPaymentDetails(
    clientUserId: string,
    body: CreatePaymentDetailsBody,
    options?: PayerV1OperationOptions,
  ): Promise<CreatePaymentDetailsResponse>;
  getPaymentDetails(clientUserId: string, options?: PayerV1OperationOptions): Promise<GetPaymentDetailsResponse>;
}

export function createPayerV1Api(http: HttpClient): PayerV1Api {
  return {
    async createComplianceData(body, options) {
      return requestJson<CreateComplianceResponse>(http, {
        operationId: OP_CREATE_COMPLIANCE,
        method: "POST",
        path: "/v1/payer",
        body,
        requestSchemaKey: { operationId: OP_CREATE_COMPLIANCE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_COMPLIANCE, kind: "response", status: 200 },
        description: "Legacy create compliance data",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getComplianceStatus(clientUserId, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson<ComplianceStatusResponse>(http, {
        operationId: OP_GET_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_STATUS, kind: "response", status: 200 },
        description: "Legacy get compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async updateComplianceStatus(clientUserId, body, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson<UpdateComplianceResponse>(http, {
        operationId: OP_UPDATE_STATUS,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE_STATUS, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_UPDATE_STATUS, kind: "response", status: 200 },
        description: "Legacy update compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async createPaymentDetails(clientUserId, body, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson<CreatePaymentDetailsResponse>(http, {
        operationId: OP_CREATE_PAYMENT_DETAILS,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS, kind: "response", status: 201 },
        description: "Legacy create payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getPaymentDetails(clientUserId, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson<GetPaymentDetailsResponse>(http, {
        operationId: OP_GET_PAYMENT_DETAILS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_PAYMENT_DETAILS, kind: "response", status: 200 },
        description: "Legacy get payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}
