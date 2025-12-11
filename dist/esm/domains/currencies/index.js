import { z } from 'zod';

// src/domains/currencies/currencies.schemas.ts

// src/validation/schema.registry.ts
function serialiseKey(key) {
  const variant = key.variant ?? "default";
  const status = key.status?.toString() ?? "any";
  return `${key.operationId}|${key.kind}|${variant}|${status}`;
}
var SchemaRegistry = class {
  store = /* @__PURE__ */ new Map();
  register(entry) {
    const id = serialiseKey(entry.key);
    this.store.set(id, entry);
  }
  get(key) {
    const id = serialiseKey(key);
    return this.store.get(id)?.schema;
  }
  /**
   * Removes every registered schema — primarily useful in tests.
   */
  clear() {
    this.store.clear();
  }
};
var schemaRegistry = new SchemaRegistry();

// src/validation/generated/groups/currencies.schemas.generated.ts
var ErrorDetailSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  field: z.string().optional(),
  source: z.object({
    pointer: z.string().optional(),
    parameter: z.string().optional()
  }).passthrough().optional(),
  meta: z.record(z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema = z.object({
  status: z.number().optional(),
  statusCode: z.number().optional(),
  code: z.string().optional(),
  error: z.string().optional(),
  message: z.union([
    z.string(),
    z.array(z.union([z.string(), ErrorDetailSchema])),
    ErrorDetailSchema
  ]).optional(),
  detail: z.unknown().optional(),
  errors: z.array(ErrorDetailSchema).optional(),
  requestId: z.string().optional(),
  correlationId: z.string().optional(),
  retryAfter: z.union([z.number(), z.string()]).optional(),
  retryAfterMs: z.number().optional(),
  meta: z.record(z.unknown()).optional()
}).passthrough();
var CurrenciesV1Controller_getNetworkTokens_v1_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 200 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_200 });
var CurrenciesV1Controller_getNetworkTokens_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 400 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_400 });
var CurrenciesV1Controller_getNetworkTokens_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 404 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_404 });
var CurrenciesV1Controller_getNetworkTokens_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 429 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_429 });
var CurrenciesV1Controller_getConversionRoutes_v1_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getConversionRoutes_v1", kind: "response", status: 200 }, schema: CurrenciesV1Controller_getConversionRoutes_v1_200 });
var CurrenciesV1Controller_getConversionRoutes_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getConversionRoutes_v1", kind: "response", status: 404 }, schema: CurrenciesV1Controller_getConversionRoutes_v1_404 });
var CurrenciesV1Controller_getConversionRoutes_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getConversionRoutes_v1", kind: "response", status: 429 }, schema: CurrenciesV1Controller_getConversionRoutes_v1_429 });
var CurrenciesV2Controller_getNetworkTokens_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 200 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_200 });
var CurrenciesV2Controller_getNetworkTokens_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 400 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_400 });
var CurrenciesV2Controller_getNetworkTokens_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 404 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_404 });
var CurrenciesV2Controller_getNetworkTokens_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 429 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_429 });
var CurrenciesV2Controller_getConversionRoutes_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getConversionRoutes_v2", kind: "response", status: 200 }, schema: CurrenciesV2Controller_getConversionRoutes_v2_200 });
var CurrenciesV2Controller_getConversionRoutes_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getConversionRoutes_v2", kind: "response", status: 404 }, schema: CurrenciesV2Controller_getConversionRoutes_v2_404 });
var CurrenciesV2Controller_getConversionRoutes_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getConversionRoutes_v2", kind: "response", status: 429 }, schema: CurrenciesV2Controller_getConversionRoutes_v2_429 });

// src/domains/currencies/currencies.schemas.ts
var OP_LIST = "CurrenciesV2Controller_getNetworkTokens_v2";
var OP_CONVERSION_ROUTES = "CurrenciesV2Controller_getConversionRoutes_v2";
var CurrencyTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  address: z.string().optional(),
  network: z.string().optional(),
  type: z.string().optional(),
  hash: z.string().optional(),
  chainId: z.number().optional()
}).passthrough();
var CurrenciesListSchema = z.array(CurrencyTokenSchema);
var ConversionRoutesSchema = z.object({
  currencyId: z.string(),
  network: z.string().nullable().optional(),
  conversionRoutes: z.array(CurrencyTokenSchema)
}).passthrough();
schemaRegistry.register({ key: { operationId: OP_LIST, kind: "response", status: 200 }, schema: CurrenciesListSchema });
schemaRegistry.register({ key: { operationId: OP_CONVERSION_ROUTES, kind: "response", status: 200 }, schema: ConversionRoutesSchema });

// src/core/http/validation.config.ts
function normaliseBoolean(flag, fallback) {
  return typeof flag === "boolean" ? flag : fallback;
}
function mergeRuntimeValidation(base, override) {
  if (override === void 0) {
    return base;
  }
  if (typeof override === "boolean") {
    return {
      requests: override,
      responses: override,
      errors: override
    };
  }
  return {
    requests: normaliseBoolean(override.requests, base.requests),
    responses: normaliseBoolean(override.responses, base.responses),
    errors: normaliseBoolean(override.errors, base.errors)
  };
}

// src/validation/zod.helpers.ts
var ValidationError = class extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.cause = cause;
    this.name = "ClientValidationError";
  }
};
function parseWithSchema(options) {
  const { schema, value, description } = options;
  const outcome = schema.safeParse(value);
  if (outcome.success) {
    return { success: true, data: outcome.data };
  }
  const error = new ValidationError(description ?? "Validation failed", outcome.error);
  return { success: false, error };
}
function parseWithRegistry(options) {
  const schema = schemaRegistry.get(options.key);
  if (!schema) {
    if (options.skipOnMissingSchema) {
      return { success: true, data: options.value };
    }
    return { success: false, error: new ValidationError(`No schema registered for ${options.key.operationId}`) };
  }
  return parseWithSchema({ schema, value: options.value, description: options.description });
}

// src/core/http/operation.helper.ts
async function requestJson(http, params) {
  const {
    operationId,
    method,
    path,
    query,
    body,
    schemaKey,
    requestSchemaKey,
    description,
    querySerializer,
    signal,
    timeoutMs,
    validation,
    meta
  } = params;
  const runtimeValidation = mergeRuntimeValidation(http.getRuntimeValidationConfig(), validation);
  let requestBody = body;
  if (runtimeValidation.requests && requestSchemaKey && body !== void 0) {
    const parsedRequest = parseWithRegistry({
      key: requestSchemaKey,
      value: body,
      description: `${description ?? operationId} request`,
      skipOnMissingSchema: true
    });
    if (!parsedRequest.success) {
      throw parsedRequest.error;
    }
    requestBody = parsedRequest.data;
  }
  const metaValidation = validation ?? meta?.validation;
  const requestMeta = {
    ...meta ?? {},
    operationId,
    validation: metaValidation
  };
  const res = await http.request({
    method,
    path,
    query,
    body: requestBody,
    querySerializer,
    signal,
    timeoutMs,
    meta: requestMeta
  });
  if (!runtimeValidation.responses) {
    return res.data;
  }
  const parsedResponse = parseWithRegistry({ key: schemaKey, value: res.data, description });
  if (!parsedResponse.success) throw parsedResponse.error;
  return parsedResponse.data;
}
var OP_LIST_V1 = "CurrenciesV1Controller_getNetworkTokens_v1";
var OP_CONVERSION_ROUTES_V1 = "CurrenciesV1Controller_getConversionRoutes_v1";
var DESCRIPTION_LIST = "Legacy currencies list";
var DESCRIPTION_CONVERSION_ROUTES = "Legacy conversion routes";
var CurrenciesV1ListSchema = z.union([CurrenciesListSchema, CurrencyTokenSchema]);
schemaRegistry.register({ key: { operationId: OP_LIST_V1, kind: "response", status: 200 }, schema: CurrenciesV1ListSchema });
schemaRegistry.register({
  key: { operationId: OP_CONVERSION_ROUTES_V1, kind: "response", status: 200 },
  schema: ConversionRoutesSchema
});
var DESCRIPTIONS = {
  list: DESCRIPTION_LIST,
  conversionRoutes: DESCRIPTION_CONVERSION_ROUTES
};

// src/domains/currencies/v1/currencies.v1.facade.ts
var CURRENCIES_V1_PATH = "/v1/currencies";
var CONVERSION_ROUTES_SEGMENT = "conversion-routes";
function toQuery(input) {
  return input;
}
function createCurrenciesV1Api(http) {
  return {
    async list(query, options) {
      const data = await requestJson(http, {
        operationId: OP_LIST_V1,
        method: "GET",
        path: CURRENCIES_V1_PATH,
        query: toQuery(query ?? void 0),
        schemaKey: { operationId: OP_LIST_V1, kind: "response", status: 200 },
        description: DESCRIPTIONS.list,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation
      });
      const parsed = parseWithSchema({
        schema: CurrenciesV1ListSchema,
        value: data,
        description: DESCRIPTIONS.list
      });
      if (!parsed.success) throw parsed.error;
      const payload = parsed.data;
      const tokens = Array.isArray(payload) ? payload : [payload];
      return tokens;
    },
    async getConversionRoutes(currencyId, query, options) {
      const path = `${CURRENCIES_V1_PATH}/${encodeURIComponent(currencyId)}/${CONVERSION_ROUTES_SEGMENT}`;
      const data = await requestJson(http, {
        operationId: OP_CONVERSION_ROUTES_V1,
        method: "GET",
        path,
        query: toQuery(query ?? void 0),
        schemaKey: { operationId: OP_CONVERSION_ROUTES_V1, kind: "response", status: 200 },
        description: DESCRIPTIONS.conversionRoutes,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation
      });
      const parsed = parseWithSchema({
        schema: ConversionRoutesSchema,
        value: data,
        description: DESCRIPTIONS.conversionRoutes
      });
      if (!parsed.success) throw parsed.error;
      return parsed.data;
    }
  };
}

// src/domains/currencies/currencies.facade.ts
var CURRENCIES_PATH = "/v2/currencies";
var CONVERSION_ROUTES_SEGMENT2 = "conversion-routes";
var DESCRIPTION_LIST2 = "Currencies list";
var DESCRIPTION_CONVERSION_ROUTES2 = "Conversion routes";
function createCurrenciesApi(http) {
  const legacy = createCurrenciesV1Api(http);
  function toQuery2(input) {
    return input;
  }
  return {
    legacy,
    async list(query, options) {
      const data = await requestJson(http, {
        operationId: OP_LIST,
        method: "GET",
        path: CURRENCIES_PATH,
        query: toQuery2(query ?? void 0),
        schemaKey: { operationId: OP_LIST, kind: "response", status: 200 },
        description: DESCRIPTION_LIST2,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation
      });
      const parsed = parseWithSchema({
        schema: CurrenciesListSchema,
        value: data,
        description: DESCRIPTION_LIST2
      });
      if (!parsed.success) throw parsed.error;
      const list = parsed.data;
      return list;
    },
    async getConversionRoutes(currencyId, query, options) {
      const path = `${CURRENCIES_PATH}/${encodeURIComponent(currencyId)}/${CONVERSION_ROUTES_SEGMENT2}`;
      const data = await requestJson(http, {
        operationId: OP_CONVERSION_ROUTES,
        method: "GET",
        path,
        query: toQuery2(query ?? void 0),
        schemaKey: { operationId: OP_CONVERSION_ROUTES, kind: "response", status: 200 },
        description: DESCRIPTION_CONVERSION_ROUTES2,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation
      });
      const parsed = parseWithSchema({
        schema: ConversionRoutesSchema,
        value: data,
        description: DESCRIPTION_CONVERSION_ROUTES2
      });
      if (!parsed.success) throw parsed.error;
      const routes = parsed.data;
      return routes;
    }
  };
}

export { createCurrenciesApi, createCurrenciesV1Api };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map