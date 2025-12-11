import {
  OP_SEARCH_PAYMENTS,
  type PaymentSearchPagination,
  type PaymentSearchResponse,
  type PaymentRecord,
} from "./payments.schemas";
import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson } from "../../core/http/operation.helper";
import type { operations } from "../../generated/openapi-types";
import { buildRequestQuery } from "../requests/request.helpers";

export type PaymentSearchQuery = operations[typeof OP_SEARCH_PAYMENTS]["parameters"]["query"];

export interface PaymentSearchOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export type PaymentSearchResult = PaymentSearchResponse;

export interface PaymentsApi {
  search(query: PaymentSearchQuery, options?: PaymentSearchOptions): Promise<PaymentSearchResult>;
}

export function createPaymentsApi(http: HttpClient): PaymentsApi {
  return {
    async search(query, options) {
      const requestQuery = buildRequestQuery(query ? { ...query } : undefined);
      return requestJson<PaymentSearchResponse>(http, {
        operationId: OP_SEARCH_PAYMENTS,
        method: "GET",
        path: "/v2/payments",
        query: requestQuery,
        schemaKey: { operationId: OP_SEARCH_PAYMENTS, kind: "response", status: 200 },
        description: "Search payments",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta,
      });
    },
  };
}

export type { PaymentRecord, PaymentSearchPagination };
