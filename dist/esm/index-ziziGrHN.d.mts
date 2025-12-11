import { z } from 'zod';
import { o as operations, a as RuntimeValidationOption, b as HttpClient } from './openapi-types-CtUFCrk4.mjs';

declare const CurrencyTokenSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodNumber>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">>;
declare const CurrenciesListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodNumber>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    name: z.ZodString;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    hash: z.ZodOptional<z.ZodString>;
    chainId: z.ZodOptional<z.ZodNumber>;
}, z.ZodTypeAny, "passthrough">>, "many">;
type CurrencyToken = z.infer<typeof CurrencyTokenSchema>;
type CurrencyList = z.infer<typeof CurrenciesListSchema>;
declare const ConversionRoutesSchema: z.ZodObject<{
    currencyId: z.ZodString;
    network: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversionRoutes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    currencyId: z.ZodString;
    network: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversionRoutes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    currencyId: z.ZodString;
    network: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    conversionRoutes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        name: z.ZodString;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        network: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        hash: z.ZodOptional<z.ZodString>;
        chainId: z.ZodOptional<z.ZodNumber>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, z.ZodTypeAny, "passthrough">>;
type ConversionRoutes = z.infer<typeof ConversionRoutesSchema>;

declare const OP_LIST_V1 = "CurrenciesV1Controller_getNetworkTokens_v1";
declare const OP_CONVERSION_ROUTES_V1 = "CurrenciesV1Controller_getConversionRoutes_v1";

type ListCurrenciesV1Query = operations[typeof OP_LIST_V1]["parameters"]["query"];
type GetConversionRoutesV1Query = operations[typeof OP_CONVERSION_ROUTES_V1]["parameters"]["query"];
interface CurrencyV1RequestOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
}
interface CurrenciesV1Api {
    list(query?: ListCurrenciesV1Query, options?: CurrencyV1RequestOptions): Promise<CurrencyList>;
    getConversionRoutes(currencyId: string, query?: GetConversionRoutesV1Query, options?: CurrencyV1RequestOptions): Promise<ConversionRoutes>;
}
declare function createCurrenciesV1Api(http: HttpClient): CurrenciesV1Api;

type ListCurrenciesQuery = operations["CurrenciesV2Controller_getNetworkTokens_v2"]["parameters"]["query"];
type GetConversionRoutesQuery = operations["CurrenciesV2Controller_getConversionRoutes_v2"]["parameters"]["query"];
interface CurrencyRequestOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
}
interface CurrenciesApi {
    list(query?: ListCurrenciesQuery, options?: CurrencyRequestOptions): Promise<CurrencyList>;
    getConversionRoutes(currencyId: string, query?: GetConversionRoutesQuery, options?: CurrencyRequestOptions): Promise<ConversionRoutes>;
    legacy: CurrenciesV1Api;
}
declare function createCurrenciesApi(http: HttpClient): CurrenciesApi;

type index_ConversionRoutes = ConversionRoutes;
type index_CurrenciesApi = CurrenciesApi;
type index_CurrenciesV1Api = CurrenciesV1Api;
type index_CurrencyList = CurrencyList;
type index_CurrencyRequestOptions = CurrencyRequestOptions;
type index_CurrencyToken = CurrencyToken;
type index_CurrencyV1RequestOptions = CurrencyV1RequestOptions;
type index_GetConversionRoutesQuery = GetConversionRoutesQuery;
type index_GetConversionRoutesV1Query = GetConversionRoutesV1Query;
type index_ListCurrenciesQuery = ListCurrenciesQuery;
type index_ListCurrenciesV1Query = ListCurrenciesV1Query;
declare const index_createCurrenciesApi: typeof createCurrenciesApi;
declare const index_createCurrenciesV1Api: typeof createCurrenciesV1Api;
declare namespace index {
  export { type index_ConversionRoutes as ConversionRoutes, type index_CurrenciesApi as CurrenciesApi, type index_CurrenciesV1Api as CurrenciesV1Api, type index_CurrencyList as CurrencyList, type index_CurrencyRequestOptions as CurrencyRequestOptions, type index_CurrencyToken as CurrencyToken, type index_CurrencyV1RequestOptions as CurrencyV1RequestOptions, type index_GetConversionRoutesQuery as GetConversionRoutesQuery, type index_GetConversionRoutesV1Query as GetConversionRoutesV1Query, type index_ListCurrenciesQuery as ListCurrenciesQuery, type index_ListCurrenciesV1Query as ListCurrenciesV1Query, index_createCurrenciesApi as createCurrenciesApi, index_createCurrenciesV1Api as createCurrenciesV1Api };
}

export { type CurrenciesV1Api as C, type GetConversionRoutesV1Query as G, type ListCurrenciesV1Query as L, type CurrencyV1RequestOptions as a, type CurrenciesApi as b, createCurrenciesV1Api as c, type CurrencyToken as d, createCurrenciesApi as e, type ListCurrenciesQuery as f, type GetConversionRoutesQuery as g, type CurrencyRequestOptions as h, index as i, type CurrencyList as j, type ConversionRoutes as k };
