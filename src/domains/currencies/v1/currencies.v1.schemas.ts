import { z } from "zod";

import { schemaRegistry } from "../../../validation/schema.registry";
import {
  ConversionRoutesSchema,
  CurrencyTokenSchema,
  CurrenciesListSchema,
  type ConversionRoutes,
  type CurrencyList,
} from "../currencies.schemas";

export const OP_LIST_V1 = "CurrenciesV1Controller_getNetworkTokens_v1";
export const OP_CONVERSION_ROUTES_V1 = "CurrenciesV1Controller_getConversionRoutes_v1";

const DESCRIPTION_LIST = "Legacy currencies list";
const DESCRIPTION_CONVERSION_ROUTES = "Legacy conversion routes";

export const CurrenciesV1ListSchema = z.union([CurrenciesListSchema, CurrencyTokenSchema]);

export type LegacyCurrencyList = CurrencyList;
export type LegacyConversionRoutes = ConversionRoutes;

schemaRegistry.register({ key: { operationId: OP_LIST_V1, kind: "response", status: 200 }, schema: CurrenciesV1ListSchema });
schemaRegistry.register({
  key: { operationId: OP_CONVERSION_ROUTES_V1, kind: "response", status: 200 },
  schema: ConversionRoutesSchema,
});

export const DESCRIPTIONS = {
  list: DESCRIPTION_LIST,
  conversionRoutes: DESCRIPTION_CONVERSION_ROUTES,
} as const;
