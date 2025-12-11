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
var PayV1Controller_payRequest_v1_Request = z.object({ "payee": z.string(), "amount": z.string(), "invoiceCurrency": z.string(), "paymentCurrency": z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "request", variant: "application/json" }, schema: PayV1Controller_payRequest_v1_Request });
var PayV1Controller_payRequest_v1_201 = z.object({ "requestId": z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 201 }, schema: PayV1Controller_payRequest_v1_201 });
var PayV1Controller_payRequest_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 401 }, schema: PayV1Controller_payRequest_v1_401 });
var PayV1Controller_payRequest_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 404 }, schema: PayV1Controller_payRequest_v1_404 });
var PayV1Controller_payRequest_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 429 }, schema: PayV1Controller_payRequest_v1_429 });
var PayoutV2Controller_payRequest_v2_Request = z.object({ "payee": z.string(), "amount": z.string(), "invoiceCurrency": z.string(), "paymentCurrency": z.string(), "feePercentage": z.string().optional(), "feeAddress": z.string().optional(), "recurrence": z.object({ "startDate": z.string(), "frequency": z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]), "totalPayments": z.number(), "payer": z.string() }).passthrough().optional(), "payerWallet": z.string().optional(), "customerInfo": z.object({ "firstName": z.string().optional(), "lastName": z.string().optional(), "email": z.string().optional(), "address": z.object({ "street": z.string().optional(), "city": z.string().optional(), "state": z.string().optional(), "postalCode": z.string().optional(), "country": z.string().optional() }).passthrough().optional() }).passthrough().optional(), "reference": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_payRequest_v2_Request });
var PayoutV2Controller_payRequest_v2_201 = z.object({ "requestId": z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_payRequest_v2_201 });
var PayoutV2Controller_payRequest_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_payRequest_v2_404 });
var PayoutV2Controller_payRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_payRequest_v2_429 });
var PayoutV2Controller_payBatchRequest_v2_Request = z.object({ "requests": z.array(z.object({ "payee": z.string(), "amount": z.string(), "invoiceCurrency": z.string(), "paymentCurrency": z.string() }).passthrough()).optional(), "requestIds": z.array(z.string()).optional(), "payer": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_payBatchRequest_v2_Request });
var PayoutV2Controller_payBatchRequest_v2_201 = z.object({ "ERC20ApprovalTransactions": z.array(z.object({ "data": z.string(), "to": z.string(), "value": z.number() }).passthrough()).optional(), "ERC20BatchPaymentTransaction": z.object({ "data": z.string(), "to": z.string(), "value": z.object({ "type": z.enum(["BigNumber"]), "hex": z.string() }).passthrough() }).passthrough().optional(), "ETHBatchPaymentTransaction": z.object({ "data": z.string(), "to": z.string(), "value": z.object({ "type": z.enum(["BigNumber"]), "hex": z.string() }).passthrough() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_payBatchRequest_v2_201 });
var PayoutV2Controller_payBatchRequest_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_payBatchRequest_v2_400 });
var PayoutV2Controller_payBatchRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_payBatchRequest_v2_429 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 200 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_200 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_404 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_429 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_Request = z.object({ "permitSignature": z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_Request });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_201 = z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_201 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_400 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_404 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_429 });
var PayoutV2Controller_updateRecurringPayment_v2_Request = z.object({ "action": z.enum(["cancel", "unpause"]) }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_updateRecurringPayment_v2_Request });
var PayoutV2Controller_updateRecurringPayment_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 200 }, schema: PayoutV2Controller_updateRecurringPayment_v2_200 });
var PayoutV2Controller_updateRecurringPayment_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_updateRecurringPayment_v2_400 });
var PayoutV2Controller_updateRecurringPayment_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_updateRecurringPayment_v2_404 });
var PayoutV2Controller_updateRecurringPayment_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_updateRecurringPayment_v2_429 });

export { createPayoutsApi };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map