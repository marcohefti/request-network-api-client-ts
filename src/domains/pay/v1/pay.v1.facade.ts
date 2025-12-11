import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../../core/http/http.types";
import { requestJson } from "../../../core/http/operation.helper";
import type { operations } from "../../../generated/openapi-types";

const OP_PAY_REQUEST = "PayV1Controller_payRequest_v1" as const;
const PAY_PATH = "/v1/pay";
const DESCRIPTION_PAY_REQUEST = "Legacy pay request";

type PayRequestBody = operations[typeof OP_PAY_REQUEST]["requestBody"]["content"]["application/json"];
type PayRequestResponse = operations[typeof OP_PAY_REQUEST]["responses"][201]["content"]["application/json"];

export interface PayV1OperationOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export interface PayV1Api {
  payRequest(body: PayRequestBody, options?: PayV1OperationOptions): Promise<PayRequestResponse>;
}

export function createPayV1Api(http: HttpClient): PayV1Api {
  return {
    async payRequest(body, options) {
      return requestJson<PayRequestResponse>(http, {
        operationId: OP_PAY_REQUEST,
        method: "POST",
        path: PAY_PATH,
        body,
        requestSchemaKey: { operationId: OP_PAY_REQUEST, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_PAY_REQUEST, kind: "response", status: 201 },
        description: DESCRIPTION_PAY_REQUEST,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}
