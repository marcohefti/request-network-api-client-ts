import {
  CurrenciesV1ListSchema,
  DESCRIPTIONS,
  OP_CONVERSION_ROUTES_V1,
  OP_LIST_V1,
} from "./currencies.v1.schemas";
import type { HttpClient, RuntimeValidationOption } from "../../../core/http/http.types";
import { requestJson } from "../../../core/http/operation.helper";
import type { operations } from "../../../generated/openapi-types";
import { parseWithSchema } from "../../../validation/zod.helpers";
import { type ConversionRoutes, type CurrencyList, ConversionRoutesSchema } from "../currencies.schemas";

export type ListCurrenciesV1Query = operations[typeof OP_LIST_V1]["parameters"]["query"];
export type GetConversionRoutesV1Query = operations[typeof OP_CONVERSION_ROUTES_V1]["parameters"]["query"];

const CURRENCIES_V1_PATH = "/v1/currencies";
const CONVERSION_ROUTES_SEGMENT = "conversion-routes";

export interface CurrencyV1RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
}

export interface CurrenciesV1Api {
  list(query?: ListCurrenciesV1Query, options?: CurrencyV1RequestOptions): Promise<CurrencyList>;
  getConversionRoutes(currencyId: string, query?: GetConversionRoutesV1Query, options?: CurrencyV1RequestOptions): Promise<ConversionRoutes>;
}

function toQuery(
  input?: Record<string, unknown>,
): Record<string, string | number | boolean | (string | number | boolean)[] | undefined> | undefined {
  return input as Record<string, string | number | boolean | (string | number | boolean)[] | undefined> | undefined;
}

export function createCurrenciesV1Api(http: HttpClient): CurrenciesV1Api {
  return {
    async list(query, options) {
      const data = await requestJson<unknown>(http, {
        operationId: OP_LIST_V1,
        method: "GET",
        path: CURRENCIES_V1_PATH,
        query: toQuery(query ?? undefined),
        schemaKey: { operationId: OP_LIST_V1, kind: "response", status: 200 },
        description: DESCRIPTIONS.list,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
      });

      const parsed = parseWithSchema({
        schema: CurrenciesV1ListSchema,
        value: data,
        description: DESCRIPTIONS.list,
      });
      if (!parsed.success) throw parsed.error;
      const payload = parsed.data;
      const tokens = Array.isArray(payload) ? payload : [payload];
      return tokens as CurrencyList;
    },

    async getConversionRoutes(currencyId, query, options) {
      const path = `${CURRENCIES_V1_PATH}/${encodeURIComponent(currencyId)}/${CONVERSION_ROUTES_SEGMENT}`;
      const data = await requestJson<unknown>(http, {
        operationId: OP_CONVERSION_ROUTES_V1,
        method: "GET",
        path,
        query: toQuery(query ?? undefined),
        schemaKey: { operationId: OP_CONVERSION_ROUTES_V1, kind: "response", status: 200 },
        description: DESCRIPTIONS.conversionRoutes,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
      });

      const parsed = parseWithSchema({
        schema: ConversionRoutesSchema,
        value: data,
        description: DESCRIPTIONS.conversionRoutes,
      });
      if (!parsed.success) throw parsed.error;
      return parsed.data as ConversionRoutes;
    },
  };
}
