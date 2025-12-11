import { OP_CONVERSION_ROUTES, OP_LIST, CurrenciesListSchema, ConversionRoutesSchema } from "./currencies.schemas";
import type { CurrencyList, ConversionRoutes } from "./currencies.schemas";
import { createCurrenciesV1Api, type CurrenciesV1Api } from "./v1";
import type { HttpClient, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson } from "../../core/http/operation.helper";
import type { operations } from "../../generated/openapi-types";
import { parseWithSchema } from "../../validation/zod.helpers";

export type ListCurrenciesQuery = operations["CurrenciesV2Controller_getNetworkTokens_v2"]["parameters"]["query"];
export type GetConversionRoutesQuery = operations["CurrenciesV2Controller_getConversionRoutes_v2"]["parameters"]["query"];

const CURRENCIES_PATH = "/v2/currencies";
const CONVERSION_ROUTES_SEGMENT = "conversion-routes";
const DESCRIPTION_LIST = "Currencies list";
const DESCRIPTION_CONVERSION_ROUTES = "Conversion routes";

export interface CurrencyRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
}

export interface CurrenciesApi {
  list(query?: ListCurrenciesQuery, options?: CurrencyRequestOptions): Promise<CurrencyList>;
  getConversionRoutes(currencyId: string, query?: GetConversionRoutesQuery, options?: CurrencyRequestOptions): Promise<ConversionRoutes>;
  legacy: CurrenciesV1Api;
}

export function createCurrenciesApi(http: HttpClient): CurrenciesApi {
  const legacy = createCurrenciesV1Api(http);
  function toQuery(input?: Record<string, unknown>): Record<string, string | number | boolean | (string | number | boolean)[] | undefined> | undefined {
    return input as Record<string, string | number | boolean | (string | number | boolean)[] | undefined> | undefined;
  }

  return {
    legacy,
    async list(query, options) {
      const data = await requestJson<unknown>(http, {
        operationId: OP_LIST,
        method: "GET",
        path: CURRENCIES_PATH,
        query: toQuery(query ?? undefined),
        schemaKey: { operationId: OP_LIST, kind: "response", status: 200 },
        description: DESCRIPTION_LIST,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
      });

      const parsed = parseWithSchema({
        schema: CurrenciesListSchema,
        value: data,
        description: DESCRIPTION_LIST,
      });
      if (!parsed.success) throw parsed.error;
      const list = parsed.data as CurrencyList;
      return list;
    },
    async getConversionRoutes(currencyId, query, options) {
      const path = `${CURRENCIES_PATH}/${encodeURIComponent(currencyId)}/${CONVERSION_ROUTES_SEGMENT}`;
      const data = await requestJson<unknown>(http, {
        operationId: OP_CONVERSION_ROUTES,
        method: "GET",
        path,
        query: toQuery(query ?? undefined),
        schemaKey: { operationId: OP_CONVERSION_ROUTES, kind: "response", status: 200 },
        description: DESCRIPTION_CONVERSION_ROUTES,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
      });

      const parsed = parseWithSchema({
        schema: ConversionRoutesSchema,
        value: data,
        description: DESCRIPTION_CONVERSION_ROUTES,
      });
      if (!parsed.success) throw parsed.error;
      const routes = parsed.data as ConversionRoutes;
      return routes;
    },
  };
}
