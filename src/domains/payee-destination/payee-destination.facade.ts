import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson } from "../../core/http/operation.helper";
import type { operations } from "../../generated/openapi-types";

const OP_GET_SIGNING_DATA = "PayeeDestinationController_getSigningData_v2" as const;
const OP_GET_ACTIVE = "PayeeDestinationController_getActivePayeeDestination_v2" as const;
const OP_CREATE = "PayeeDestinationController_createPayeeDestination_v2" as const;
const OP_GET_BY_ID = "PayeeDestinationController_getPayeeDestination_v2" as const;
const OP_DEACTIVATE = "PayeeDestinationController_deactivatePayeeDestination_v2" as const;
const PATH_BASE = "/v2/payee-destination" as const;

type GetSigningDataQuery = operations[typeof OP_GET_SIGNING_DATA]["parameters"]["query"];
type CreateBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type DeactivateBody = operations[typeof OP_DEACTIVATE]["requestBody"]["content"]["application/json"];

export interface PayeeDestinationOperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export interface PayeeDestinationApi {
  getSigningData(
    query: GetSigningDataQuery,
    options?: PayeeDestinationOperationOptions,
  ): Promise<unknown>;
  getActive(walletAddress: string, options?: PayeeDestinationOperationOptions): Promise<unknown>;
  create(body: CreateBody, options?: PayeeDestinationOperationOptions): Promise<unknown>;
  getById(destinationId: string, options?: PayeeDestinationOperationOptions): Promise<unknown>;
  deactivate(
    destinationId: string,
    body: DeactivateBody,
    options?: PayeeDestinationOperationOptions,
  ): Promise<unknown>;
}

export function createPayeeDestinationApi(http: HttpClient): PayeeDestinationApi {
  return {
    async getSigningData(query, options) {
      return requestJson<unknown>(http, {
        operationId: OP_GET_SIGNING_DATA,
        method: "GET",
        path: `${PATH_BASE}/signing-data`,
        query,
        schemaKey: { operationId: OP_GET_SIGNING_DATA, kind: "response", status: 200 },
        description: "Get payee destination signing data",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getActive(walletAddress, options) {
      return requestJson<unknown>(http, {
        operationId: OP_GET_ACTIVE,
        method: "GET",
        path: PATH_BASE,
        query: { walletAddress },
        schemaKey: { operationId: OP_GET_ACTIVE, kind: "response", status: 200 },
        description: "Get active payee destination",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async create(body, options) {
      return requestJson<unknown>(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: PATH_BASE,
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create payee destination",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async getById(destinationId, options) {
      return requestJson<unknown>(http, {
        operationId: OP_GET_BY_ID,
        method: "GET",
        path: `${PATH_BASE}/${encodeURIComponent(destinationId)}`,
        schemaKey: { operationId: OP_GET_BY_ID, kind: "response", status: 200 },
        description: "Get payee destination by ID",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },

    async deactivate(destinationId, body, options) {
      return requestJson<unknown>(http, {
        operationId: OP_DEACTIVATE,
        method: "DELETE",
        path: `${PATH_BASE}/${encodeURIComponent(destinationId)}`,
        body,
        requestSchemaKey: { operationId: OP_DEACTIVATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_DEACTIVATE, kind: "response", status: 200 },
        description: "Deactivate payee destination",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}

export type { GetSigningDataQuery as PayeeDestinationSigningDataQuery };
