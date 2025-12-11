import { z } from "zod";

import "../../validation/generated/groups/currencies.schemas.generated";
import { schemaRegistry } from "../../validation/schema.registry";

export const OP_LIST = "CurrenciesV2Controller_getNetworkTokens_v2";
export const OP_CONVERSION_ROUTES = "CurrenciesV2Controller_getConversionRoutes_v2";

export const CurrencyTokenSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    address: z.string().optional(),
    network: z.string().optional(),
    type: z.string().optional(),
    hash: z.string().optional(),
    chainId: z.number().optional(),
  })
  .passthrough();

export const CurrenciesListSchema = z.array(CurrencyTokenSchema);
export type CurrencyToken = z.infer<typeof CurrencyTokenSchema>;
export type CurrencyList = z.infer<typeof CurrenciesListSchema>;

export const ConversionRoutesSchema = z
  .object({
    currencyId: z.string(),
    network: z.string().nullable().optional(),
    conversionRoutes: z.array(CurrencyTokenSchema),
  })
  .passthrough();

export type ConversionRoutes = z.infer<typeof ConversionRoutesSchema>;

schemaRegistry.register({ key: { operationId: OP_LIST, kind: "response", status: 200 }, schema: CurrenciesListSchema });
schemaRegistry.register({ key: { operationId: OP_CONVERSION_ROUTES, kind: "response", status: 200 }, schema: ConversionRoutesSchema });
