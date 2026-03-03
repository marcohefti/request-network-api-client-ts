import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson } from "../../core/http/operation.helper";
import type { operations } from "../../generated/openapi-types";
import { buildRequestQuery } from "../requests/request.helpers";

const OP_FIND_BY_REQUEST_ID = "SecurePaymentController_findSecurePayment_v2" as const;
const OP_CREATE = "SecurePaymentController_createSecurePayment_v2" as const;
const OP_GET_BY_TOKEN = "SecurePaymentController_getSecurePaymentByToken_v2" as const;
const PATH_BASE = "/v2/secure-payments" as const;

type CreateSecurePaymentBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreateSecurePaymentResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];
type FindSecurePaymentQuery = operations[typeof OP_FIND_BY_REQUEST_ID]["parameters"]["query"];
type FindSecurePaymentResponse = operations[typeof OP_FIND_BY_REQUEST_ID]["responses"][200]["content"]["application/json"];
type GetSecurePaymentByTokenQuery = NonNullable<operations[typeof OP_GET_BY_TOKEN]["parameters"]["query"]>;
type GetSecurePaymentByTokenResponse = operations[typeof OP_GET_BY_TOKEN]["responses"][200]["content"]["application/json"];

export interface SecurePaymentsOperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export type GetSecurePaymentByTokenOptions = SecurePaymentsOperationOptions & Partial<GetSecurePaymentByTokenQuery>;

export interface SecurePaymentsApi {
  create(body: CreateSecurePaymentBody, options?: SecurePaymentsOperationOptions): Promise<CreateSecurePaymentResponse>;
  findByRequestId(requestId: FindSecurePaymentQuery["requestId"], options?: SecurePaymentsOperationOptions): Promise<FindSecurePaymentResponse>;
  getByToken(token: string, options?: GetSecurePaymentByTokenOptions): Promise<GetSecurePaymentByTokenResponse>;
}

export function createSecurePaymentsApi(http: HttpClient): SecurePaymentsApi {
  return {
    async create(body, options) {
      return requestJson<CreateSecurePaymentResponse>(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: PATH_BASE,
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create secure payment",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async findByRequestId(requestId, options) {
      return requestJson<FindSecurePaymentResponse>(http, {
        operationId: OP_FIND_BY_REQUEST_ID,
        method: "GET",
        path: PATH_BASE,
        query: { requestId },
        schemaKey: { operationId: OP_FIND_BY_REQUEST_ID, kind: "response", status: 200 },
        description: "Find secure payment by request ID",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getByToken(token, options) {
      return requestJson<GetSecurePaymentByTokenResponse>(http, {
        operationId: OP_GET_BY_TOKEN,
        method: "GET",
        path: `${PATH_BASE}/${encodeURIComponent(token)}`,
        query: buildRequestQuery({ wallet: options?.wallet }),
        schemaKey: { operationId: OP_GET_BY_TOKEN, kind: "response", status: 200 },
        description: "Get secure payment by token",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}

export type {
  CreateSecurePaymentBody,
  CreateSecurePaymentResponse,
  FindSecurePaymentResponse,
  GetSecurePaymentByTokenResponse,
};
