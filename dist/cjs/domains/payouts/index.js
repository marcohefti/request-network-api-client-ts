'use strict';

var zod = require('zod');

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

// src/domains/payouts/payouts.facade.ts
var OP_CREATE = "PayoutV2Controller_payRequest_v2";
var OP_CREATE_BATCH = "PayoutV2Controller_payBatchRequest_v2";
var OP_RECURRING_STATUS = "PayoutV2Controller_getRecurringPaymentStatus_v2";
var OP_SUBMIT_SIGNATURE = "PayoutV2Controller_submitRecurringPaymentSignature_v2";
var OP_UPDATE_RECURRING = "PayoutV2Controller_updateRecurringPayment_v2";
function createPayoutsApi(http) {
  return {
    async create(body, options) {
      return requestJson(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: "/v2/payouts",
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create payout",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async createBatch(body, options) {
      return requestJson(http, {
        operationId: OP_CREATE_BATCH,
        method: "POST",
        path: "/v2/payouts/batch",
        body,
        requestSchemaKey: { operationId: OP_CREATE_BATCH, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_BATCH, kind: "response", status: 201 },
        description: "Create payout batch",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getRecurringStatus(recurringId, options) {
      const path = `/v2/payouts/recurring/${encodeURIComponent(recurringId)}`;
      return requestJson(http, {
        operationId: OP_RECURRING_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_RECURRING_STATUS, kind: "response", status: 200 },
        description: "Get recurring payout status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async submitRecurringSignature(recurringId, body, options) {
      const path = `/v2/payouts/recurring/${encodeURIComponent(recurringId)}`;
      return requestJson(http, {
        operationId: OP_SUBMIT_SIGNATURE,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_SUBMIT_SIGNATURE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_SUBMIT_SIGNATURE, kind: "response", status: 201 },
        description: "Submit recurring payout signature",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async updateRecurring(recurringId, body, options) {
      const path = `/v2/payouts/recurring/${encodeURIComponent(recurringId)}`;
      return requestJson(http, {
        operationId: OP_UPDATE_RECURRING,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE_RECURRING, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_UPDATE_RECURRING, kind: "response", status: 200 },
        description: "Update recurring payout",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    }
  };
}
var ErrorDetailSchema = zod.z.object({
  message: zod.z.string(),
  code: zod.z.string().optional(),
  field: zod.z.string().optional(),
  source: zod.z.object({
    pointer: zod.z.string().optional(),
    parameter: zod.z.string().optional()
  }).passthrough().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema = zod.z.object({
  status: zod.z.number().optional(),
  statusCode: zod.z.number().optional(),
  code: zod.z.string().optional(),
  error: zod.z.string().optional(),
  message: zod.z.union([
    zod.z.string(),
    zod.z.array(zod.z.union([zod.z.string(), ErrorDetailSchema])),
    ErrorDetailSchema
  ]).optional(),
  detail: zod.z.unknown().optional(),
  errors: zod.z.array(ErrorDetailSchema).optional(),
  requestId: zod.z.string().optional(),
  correlationId: zod.z.string().optional(),
  retryAfter: zod.z.union([zod.z.number(), zod.z.string()]).optional(),
  retryAfterMs: zod.z.number().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var PayV1Controller_payRequest_v1_Request = zod.z.object({ "payee": zod.z.string(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "request", variant: "application/json" }, schema: PayV1Controller_payRequest_v1_Request });
var PayV1Controller_payRequest_v1_201 = zod.z.object({ "requestId": zod.z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 201 }, schema: PayV1Controller_payRequest_v1_201 });
var PayV1Controller_payRequest_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 401 }, schema: PayV1Controller_payRequest_v1_401 });
var PayV1Controller_payRequest_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 404 }, schema: PayV1Controller_payRequest_v1_404 });
var PayV1Controller_payRequest_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 429 }, schema: PayV1Controller_payRequest_v1_429 });
var PayoutV2Controller_payRequest_v2_Request = zod.z.object({ "payee": zod.z.string(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string(), "feePercentage": zod.z.string().optional(), "feeAddress": zod.z.string().optional(), "recurrence": zod.z.object({ "startDate": zod.z.string(), "frequency": zod.z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]), "totalPayments": zod.z.number(), "payer": zod.z.string() }).passthrough().optional(), "payerWallet": zod.z.string().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().optional(), "reference": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_payRequest_v2_Request });
var PayoutV2Controller_payRequest_v2_201 = zod.z.object({ "requestId": zod.z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_payRequest_v2_201 });
var PayoutV2Controller_payRequest_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_payRequest_v2_404 });
var PayoutV2Controller_payRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_payRequest_v2_429 });
var PayoutV2Controller_payBatchRequest_v2_Request = zod.z.object({ "requests": zod.z.array(zod.z.object({ "payee": zod.z.string(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string() }).passthrough()).optional(), "requestIds": zod.z.array(zod.z.string()).optional(), "payer": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_payBatchRequest_v2_Request });
var PayoutV2Controller_payBatchRequest_v2_201 = zod.z.object({ "ERC20ApprovalTransactions": zod.z.array(zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.number() }).passthrough()).optional(), "ERC20BatchPaymentTransaction": zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]), "hex": zod.z.string() }).passthrough() }).passthrough().optional(), "ETHBatchPaymentTransaction": zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]), "hex": zod.z.string() }).passthrough() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_payBatchRequest_v2_201 });
var PayoutV2Controller_payBatchRequest_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_payBatchRequest_v2_400 });
var PayoutV2Controller_payBatchRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_payBatchRequest_v2_429 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 200 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_200 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_404 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_429 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_Request = zod.z.object({ "permitSignature": zod.z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_Request });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_201 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_201 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_400 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_404 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_429 });
var PayoutV2Controller_updateRecurringPayment_v2_Request = zod.z.object({ "action": zod.z.enum(["cancel", "unpause"]) }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_updateRecurringPayment_v2_Request });
var PayoutV2Controller_updateRecurringPayment_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 200 }, schema: PayoutV2Controller_updateRecurringPayment_v2_200 });
var PayoutV2Controller_updateRecurringPayment_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_updateRecurringPayment_v2_400 });
var PayoutV2Controller_updateRecurringPayment_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_updateRecurringPayment_v2_404 });
var PayoutV2Controller_updateRecurringPayment_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_updateRecurringPayment_v2_429 });

exports.createPayoutsApi = createPayoutsApi;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map