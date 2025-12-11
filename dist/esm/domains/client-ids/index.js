import { z } from 'zod';

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
async function requestVoid(http, params) {
  const { operationId, method, path, query, body, querySerializer, signal, timeoutMs, requestSchemaKey, validation, meta } = params;
  const runtimeValidation = mergeRuntimeValidation(http.getRuntimeValidationConfig(), validation);
  let requestBody = body;
  if (runtimeValidation.requests && requestSchemaKey && body !== void 0) {
    const parsedRequest = parseWithRegistry({
      key: requestSchemaKey,
      value: body,
      description: `${operationId} request`,
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
  await http.request({
    method,
    path,
    query,
    body: requestBody,
    querySerializer,
    signal,
    timeoutMs,
    meta: requestMeta
  });
}

// src/core/http/path.builder.ts
function buildPath(template, params) {
  return template.replace(/\{(.*?)\}/g, (_, key) => encodeURIComponent(String(params[key] ?? "")));
}

// src/domains/client-ids/client-ids.facade.ts
function createClientIdsApi(http) {
  const PATH_BASE = "/v2/client-ids";
  return {
    async list() {
      const OP = "ClientIdV2Controller_findAll_v2";
      return requestJson(http, {
        operationId: OP,
        method: "GET",
        path: PATH_BASE,
        schemaKey: { operationId: OP, kind: "response", status: 200 },
        description: "List client IDs"
      });
    },
    async create(body) {
      const OP = "ClientIdV2Controller_create_v2";
      return requestJson(http, {
        operationId: OP,
        method: "POST",
        path: PATH_BASE,
        body,
        requestSchemaKey: { operationId: OP, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP, kind: "response", status: 201 },
        description: "Create client ID"
      });
    },
    async findOne(id) {
      const path = buildPath(`${PATH_BASE}/{id}`, { id });
      const OP = "ClientIdV2Controller_findOne_v2";
      return requestJson(http, {
        operationId: OP,
        method: "GET",
        path,
        schemaKey: { operationId: OP, kind: "response", status: 200 },
        description: "Get client ID"
      });
    },
    async update(id, body) {
      const path = buildPath(`${PATH_BASE}/{id}`, { id });
      const OP = "ClientIdV2Controller_update_v2";
      return requestJson(http, {
        operationId: OP,
        method: "PUT",
        path,
        body,
        requestSchemaKey: { operationId: OP, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP, kind: "response", status: 200 },
        description: "Update client ID"
      });
    },
    async revoke(id) {
      const path = buildPath(`${PATH_BASE}/{id}`, { id });
      const OP = "ClientIdV2Controller_delete_v2";
      await requestVoid(http, {
        operationId: OP,
        method: "DELETE",
        path
      });
    }
  };
}
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
var ClientIdV2Controller_findAll_v2_200 = z.array(z.object({ "id": z.string().optional(), "clientId": z.string().optional(), "label": z.string().optional(), "allowedDomains": z.array(z.string()).optional(), "status": z.string().optional(), "createdAt": z.string().optional(), "lastUsedAt": z.string().nullable().optional() }).passthrough());
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findAll_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_findAll_v2_200 });
var ClientIdV2Controller_findAll_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findAll_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_findAll_v2_401 });
var ClientIdV2Controller_findAll_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findAll_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_findAll_v2_429 });
var ClientIdV2Controller_create_v2_Request = z.object({ "label": z.string(), "allowedDomains": z.array(z.string()), "feePercentage": z.string().optional(), "feeAddress": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "request", variant: "application/json" }, schema: ClientIdV2Controller_create_v2_Request });
var ClientIdV2Controller_create_v2_201 = z.object({ "id": z.string().optional(), "clientId": z.string().optional(), "label": z.string().optional(), "allowedDomains": z.array(z.string()).optional(), "feePercentage": z.string().nullable().optional(), "feeAddress": z.string().nullable().optional(), "status": z.string().optional(), "createdAt": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 201 }, schema: ClientIdV2Controller_create_v2_201 });
var ClientIdV2Controller_create_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 400 }, schema: ClientIdV2Controller_create_v2_400 });
var ClientIdV2Controller_create_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_create_v2_401 });
var ClientIdV2Controller_create_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_create_v2_429 });
var ClientIdV2Controller_findOne_v2_200 = z.object({ "id": z.string().optional(), "clientId": z.string().optional(), "label": z.string().optional(), "allowedDomains": z.array(z.string()).optional(), "feePercentage": z.string().nullable().optional(), "feeAddress": z.string().nullable().optional(), "status": z.string().optional(), "createdAt": z.string().optional(), "updatedAt": z.string().optional(), "lastUsedAt": z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_findOne_v2_200 });
var ClientIdV2Controller_findOne_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_findOne_v2_401 });
var ClientIdV2Controller_findOne_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 404 }, schema: ClientIdV2Controller_findOne_v2_404 });
var ClientIdV2Controller_findOne_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_findOne_v2_429 });
var ClientIdV2Controller_update_v2_Request = z.object({ "label": z.string().optional(), "allowedDomains": z.array(z.string()).optional(), "feePercentage": z.string().nullable().optional(), "feeAddress": z.string().nullable().optional(), "status": z.enum(["active", "inactive", "revoked"]).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "request", variant: "application/json" }, schema: ClientIdV2Controller_update_v2_Request });
var ClientIdV2Controller_update_v2_200 = z.object({ "id": z.string().optional(), "clientId": z.string().optional(), "label": z.string().optional(), "allowedDomains": z.array(z.string()).optional(), "feePercentage": z.string().nullable().optional(), "feeAddress": z.string().nullable().optional(), "status": z.string().optional(), "updatedAt": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_update_v2_200 });
var ClientIdV2Controller_update_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 400 }, schema: ClientIdV2Controller_update_v2_400 });
var ClientIdV2Controller_update_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_update_v2_401 });
var ClientIdV2Controller_update_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 404 }, schema: ClientIdV2Controller_update_v2_404 });
var ClientIdV2Controller_update_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_update_v2_429 });
var ClientIdV2Controller_delete_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_delete_v2_200 });
var ClientIdV2Controller_delete_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_delete_v2_401 });
var ClientIdV2Controller_delete_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 404 }, schema: ClientIdV2Controller_delete_v2_404 });
var ClientIdV2Controller_delete_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_delete_v2_429 });

export { createClientIdsApi };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map