'use strict';

var zod = require('zod');

// src/domains/requests/request.helpers.ts
function buildRequestQuery(input) {
  if (!input) return void 0;
  const entries = Object.entries(input).filter(([, value]) => value !== void 0);
  if (entries.length === 0) return void 0;
  return Object.fromEntries(entries);
}
var STATUS_KIND_MAP = {
  paid: "paid",
  completed: "paid",
  settled: "paid",
  pending: "pending",
  processing: "pending",
  open: "pending",
  awaitingpayment: "pending",
  awaiting_payment: "pending",
  cancelled: "cancelled",
  canceled: "cancelled",
  voided: "cancelled",
  overdue: "overdue",
  expired: "overdue"
};
function normalizeReference(value) {
  if (value === void 0) return void 0;
  return value;
}
function normalizeCustomerInfo(value) {
  if (value === void 0) return void 0;
  if (value === null) return null;
  return {
    firstName: value.firstName ?? void 0,
    lastName: value.lastName ?? void 0,
    email: value.email ?? void 0,
    address: value.address ? {
      street: value.address.street ?? void 0,
      city: value.address.city ?? void 0,
      state: value.address.state ?? void 0,
      postalCode: value.address.postalCode ?? void 0,
      country: value.address.country ?? void 0
    } : void 0
  };
}
function normalizePayments(payments) {
  if (!payments) return void 0;
  return payments.map((payment) => ({ ...payment }));
}
function buildStatusBase(raw, overrides) {
  return {
    paymentReference: raw.paymentReference ?? void 0,
    requestId: raw.requestId ?? void 0,
    isListening: "isListening" in raw ? raw.isListening ?? void 0 : void 0,
    txHash: raw.txHash ?? null,
    hasBeenPaid: raw.hasBeenPaid ?? false,
    status: "status" in raw ? raw.status ?? void 0 : void 0,
    recurrence: "recurrence" in raw ? raw.recurrence : void 0,
    originalRequestId: "originalRequestId" in raw ? raw.originalRequestId ?? void 0 : void 0,
    originalRequestPaymentReference: "originalRequestPaymentReference" in raw ? raw.originalRequestPaymentReference ?? void 0 : void 0,
    isRecurrenceStopped: "isRecurrenceStopped" in raw ? raw.isRecurrenceStopped ?? void 0 : void 0,
    isCryptoToFiatAvailable: "isCryptoToFiatAvailable" in raw ? raw.isCryptoToFiatAvailable ?? void 0 : void 0,
    payments: "payments" in raw ? normalizePayments(raw.payments) : void 0,
    customerInfo: "customerInfo" in raw ? normalizeCustomerInfo(
      raw.customerInfo
    ) : void 0,
    reference: "reference" in raw ? normalizeReference(raw.reference ?? null) : void 0,
    ...overrides
  };
}
function normalizeRequestStatusResponse(raw) {
  const statusKey = raw.status?.trim().toLowerCase();
  const mapped = statusKey ? STATUS_KIND_MAP[statusKey] : void 0;
  const kind = raw.hasBeenPaid ? "paid" : mapped ?? (statusKey ? "unknown" : "pending");
  if (kind === "paid") {
    return {
      kind,
      ...buildStatusBase(raw, { hasBeenPaid: true }),
      hasBeenPaid: true
    };
  }
  return {
    kind,
    ...buildStatusBase(raw, { hasBeenPaid: false }),
    hasBeenPaid: false
  };
}

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

// src/domains/requests/requests.facade.ts
var OP_CREATE = "RequestControllerV2_createRequest_v2";
var OP_PAYMENT_ROUTES = "RequestControllerV2_getRequestPaymentRoutes_v2";
var OP_PAYMENT_CALLDATA = "RequestControllerV2_getPaymentCalldata_v2";
var OP_UPDATE = "RequestControllerV2_updateRequest_v2";
var OP_SEND_PAYMENT_INTENT = "RequestControllerV2_sendPaymentIntent_v2";
var OP_REQUEST_STATUS = "RequestControllerV2_getRequestStatus_v2";
var KIND_CALLDATA = "calldata";
var KIND_PAYMENT_INTENT = "paymentIntent";
function isPaymentIntentPayload(payload) {
  return "paymentIntentId" in payload;
}
function isCalldataPayload(payload) {
  return "transactions" in payload;
}
function createRequestsApi(http) {
  return {
    async create(body, options) {
      return requestJson(http, {
        operationId: OP_CREATE,
        method: "POST",
        path: "/v2/request",
        body,
        requestSchemaKey: { operationId: OP_CREATE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE, kind: "response", status: 201 },
        description: "Create request",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getRequestStatus(requestId, options) {
      const path = `/v2/request/${encodeURIComponent(requestId)}`;
      const raw = await requestJson(http, {
        operationId: OP_REQUEST_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_REQUEST_STATUS, kind: "response", status: 200 },
        description: "Request status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
      return normalizeRequestStatusResponse(raw);
    },
    async getPaymentRoutes(requestId, options) {
      const path = `/v2/request/${encodeURIComponent(requestId)}/routes`;
      return requestJson(http, {
        operationId: OP_PAYMENT_ROUTES,
        method: "GET",
        path,
        query: buildRequestQuery({
          wallet: options.wallet,
          amount: options.amount,
          feePercentage: options.feePercentage,
          feeAddress: options.feeAddress
        }),
        schemaKey: { operationId: OP_PAYMENT_ROUTES, kind: "response", status: 200 },
        description: "Payment routes",
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        validation: options.validation,
        meta: options.meta
      });
    },
    async getPaymentCalldata(requestId, options) {
      const path = `/v2/request/${encodeURIComponent(requestId)}/pay`;
      const queryInput = {
        wallet: options?.wallet,
        chain: options?.chain,
        token: options?.token,
        amount: options?.amount,
        clientUserId: options?.clientUserId,
        paymentDetailsId: options?.paymentDetailsId,
        feePercentage: options?.feePercentage,
        feeAddress: options?.feeAddress
      };
      const raw = await requestJson(http, {
        operationId: OP_PAYMENT_CALLDATA,
        method: "GET",
        path,
        query: buildRequestQuery(queryInput),
        schemaKey: { operationId: OP_PAYMENT_CALLDATA, kind: "response", status: 200 },
        description: "Payment calldata",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
      if (isCalldataPayload(raw)) {
        return { kind: KIND_CALLDATA, ...raw };
      }
      if (isPaymentIntentPayload(raw)) {
        return { kind: KIND_PAYMENT_INTENT, ...raw };
      }
      throw new ValidationError("Unexpected payment calldata response", raw);
    },
    async update(requestId, options) {
      const path = `/v2/request/${encodeURIComponent(requestId)}`;
      await requestVoid(http, {
        operationId: OP_UPDATE,
        method: "PATCH",
        path,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async sendPaymentIntent(paymentIntentId, body, options) {
      const path = `/v2/request/payment-intents/${encodeURIComponent(paymentIntentId)}`;
      await requestVoid(http, {
        operationId: OP_SEND_PAYMENT_INTENT,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_SEND_PAYMENT_INTENT, kind: "request", variant: "application/json" },
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
var RequestControllerV1_createRequest_v1_Request = zod.z.object({ "payer": zod.z.string().optional(), "payee": zod.z.string(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string(), "recurrence": zod.z.object({ "startDate": zod.z.string(), "frequency": zod.z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "request", variant: "application/json" }, schema: RequestControllerV1_createRequest_v1_Request });
var RequestControllerV1_createRequest_v1_201 = zod.z.object({ "paymentReference": zod.z.string().optional(), "requestID": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 201 }, schema: RequestControllerV1_createRequest_v1_201 });
var RequestControllerV1_createRequest_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 400 }, schema: RequestControllerV1_createRequest_v1_400 });
var RequestControllerV1_createRequest_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 401 }, schema: RequestControllerV1_createRequest_v1_401 });
var RequestControllerV1_createRequest_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 404 }, schema: RequestControllerV1_createRequest_v1_404 });
var RequestControllerV1_createRequest_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 429 }, schema: RequestControllerV1_createRequest_v1_429 });
var RequestControllerV1_getRequestStatus_v1_200 = zod.z.object({ "hasBeenPaid": zod.z.boolean().optional(), "paymentReference": zod.z.string().optional(), "requestId": zod.z.string().optional(), "isListening": zod.z.boolean().optional(), "txHash": zod.z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getRequestStatus_v1_200 });
var RequestControllerV1_getRequestStatus_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getRequestStatus_v1_401 });
var RequestControllerV1_getRequestStatus_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getRequestStatus_v1_404 });
var RequestControllerV1_getRequestStatus_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getRequestStatus_v1_429 });
var RequestControllerV1_stopRecurrenceRequest_v1_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 200 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_200 });
var RequestControllerV1_stopRecurrenceRequest_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 401 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_401 });
var RequestControllerV1_stopRecurrenceRequest_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 404 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_404 });
var RequestControllerV1_stopRecurrenceRequest_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 429 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_429 });
var RequestControllerV1_getPaymentCalldata_v1_200 = zod.z.union([zod.z.object({ "transactions": zod.z.array(zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]).optional(), "hex": zod.z.string().optional() }).passthrough() }).passthrough()), "metadata": zod.z.object({ "stepsRequired": zod.z.number(), "needsApproval": zod.z.boolean(), "approvalTransactionIndex": zod.z.number().nullable().optional(), "hasEnoughBalance": zod.z.boolean(), "hasEnoughGas": zod.z.boolean() }).passthrough() }).passthrough(), zod.z.object({ "paymentIntentId": zod.z.string(), "paymentIntent": zod.z.string(), "approvalPermitPayload": zod.z.string().nullable().optional(), "approvalCalldata": zod.z.object({ "to": zod.z.string().optional(), "data": zod.z.string().optional(), "value": zod.z.string().optional() }).passthrough().nullable().optional(), "metadata": zod.z.object({ "supportsEIP2612": zod.z.boolean() }).passthrough() }).passthrough()]);
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getPaymentCalldata_v1_200 });
var RequestControllerV1_getPaymentCalldata_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 400 }, schema: RequestControllerV1_getPaymentCalldata_v1_400 });
var RequestControllerV1_getPaymentCalldata_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getPaymentCalldata_v1_401 });
var RequestControllerV1_getPaymentCalldata_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getPaymentCalldata_v1_404 });
var RequestControllerV1_getPaymentCalldata_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getPaymentCalldata_v1_429 });
var RequestControllerV1_getRequestPaymentRoutes_v1_200 = zod.z.object({ "routes": zod.z.array(zod.z.object({ "id": zod.z.string(), "fee": zod.z.number(), "feeBreakdown": zod.z.array(zod.z.object({ "type": zod.z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": zod.z.enum(["sending", "receiving", "proxying", "refunding", "overall"]).optional(), "provider": zod.z.string().optional(), "amount": zod.z.string().optional(), "amountInUSD": zod.z.string().optional(), "currency": zod.z.string().optional(), "receiverAddress": zod.z.string().optional(), "network": zod.z.string().optional(), "rateProvider": zod.z.string().optional() }).passthrough()).optional(), "speed": zod.z.union([zod.z.string(), zod.z.number()]), "price_impact": zod.z.number().optional(), "chain": zod.z.string(), "token": zod.z.string() }).passthrough()) }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_200 });
var RequestControllerV1_getRequestPaymentRoutes_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 400 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_400 });
var RequestControllerV1_getRequestPaymentRoutes_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_401 });
var RequestControllerV1_getRequestPaymentRoutes_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_404 });
var RequestControllerV1_getRequestPaymentRoutes_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_429 });
var RequestControllerV1_sendPaymentIntent_v1_Request = zod.z.object({ "signedPaymentIntent": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough(), "signedApprovalPermit": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "request", variant: "application/json" }, schema: RequestControllerV1_sendPaymentIntent_v1_Request });
var RequestControllerV1_sendPaymentIntent_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 401 }, schema: RequestControllerV1_sendPaymentIntent_v1_401 });
var RequestControllerV1_sendPaymentIntent_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 404 }, schema: RequestControllerV1_sendPaymentIntent_v1_404 });
var RequestControllerV1_sendPaymentIntent_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 429 }, schema: RequestControllerV1_sendPaymentIntent_v1_429 });
var RequestControllerV2_createRequest_v2_Request = zod.z.object({ "payer": zod.z.string().optional(), "payee": zod.z.string().optional(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string(), "recurrence": zod.z.object({ "startDate": zod.z.string(), "frequency": zod.z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) }).passthrough().optional(), "isCryptoToFiatAvailable": zod.z.boolean().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().optional(), "reference": zod.z.string().optional(), "originalRequestId": zod.z.string().optional(), "originalRequestPaymentReference": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "request", variant: "application/json" }, schema: RequestControllerV2_createRequest_v2_Request });
var RequestControllerV2_createRequest_v2_201 = zod.z.object({ "paymentReference": zod.z.string().optional(), "requestId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 201 }, schema: RequestControllerV2_createRequest_v2_201 });
var RequestControllerV2_createRequest_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 400 }, schema: RequestControllerV2_createRequest_v2_400 });
var RequestControllerV2_createRequest_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 404 }, schema: RequestControllerV2_createRequest_v2_404 });
var RequestControllerV2_createRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 429 }, schema: RequestControllerV2_createRequest_v2_429 });
var RequestControllerV2_getRequestStatus_v2_200 = zod.z.object({ "hasBeenPaid": zod.z.boolean().optional(), "paymentReference": zod.z.string().optional(), "requestId": zod.z.string().optional(), "isListening": zod.z.boolean().optional(), "txHash": zod.z.string().nullable().optional(), "recurrence": zod.z.object({}).passthrough().optional(), "originalRequestId": zod.z.string().optional(), "status": zod.z.string().optional(), "isCryptoToFiatAvailable": zod.z.boolean().optional(), "originalRequestPaymentReference": zod.z.string().optional(), "payments": zod.z.array(zod.z.object({}).passthrough()).optional(), "isRecurrenceStopped": zod.z.boolean().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().nullable().optional(), "reference": zod.z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getRequestStatus_v2_200 });
var RequestControllerV2_getRequestStatus_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getRequestStatus_v2_404 });
var RequestControllerV2_getRequestStatus_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getRequestStatus_v2_429 });
var RequestControllerV2_updateRequest_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 200 }, schema: RequestControllerV2_updateRequest_v2_200 });
var RequestControllerV2_updateRequest_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 404 }, schema: RequestControllerV2_updateRequest_v2_404 });
var RequestControllerV2_updateRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 429 }, schema: RequestControllerV2_updateRequest_v2_429 });
var RequestControllerV2_getPaymentCalldata_v2_200 = zod.z.union([zod.z.object({ "transactions": zod.z.array(zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]).optional(), "hex": zod.z.string().optional() }).passthrough() }).passthrough()), "metadata": zod.z.object({ "stepsRequired": zod.z.number(), "needsApproval": zod.z.boolean(), "approvalTransactionIndex": zod.z.number().nullable().optional(), "hasEnoughBalance": zod.z.boolean(), "hasEnoughGas": zod.z.boolean() }).passthrough() }).passthrough(), zod.z.object({ "paymentIntentId": zod.z.string(), "paymentIntent": zod.z.string(), "approvalPermitPayload": zod.z.string().nullable().optional(), "approvalCalldata": zod.z.object({ "to": zod.z.string().optional(), "data": zod.z.string().optional(), "value": zod.z.string().optional() }).passthrough().nullable().optional(), "metadata": zod.z.object({ "supportsEIP2612": zod.z.boolean() }).passthrough() }).passthrough()]);
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getPaymentCalldata_v2_200 });
var RequestControllerV2_getPaymentCalldata_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 400 }, schema: RequestControllerV2_getPaymentCalldata_v2_400 });
var RequestControllerV2_getPaymentCalldata_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getPaymentCalldata_v2_404 });
var RequestControllerV2_getPaymentCalldata_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getPaymentCalldata_v2_429 });
var RequestControllerV2_getRequestPaymentRoutes_v2_200 = zod.z.object({ "routes": zod.z.array(zod.z.object({ "id": zod.z.string(), "fee": zod.z.number(), "feeBreakdown": zod.z.array(zod.z.object({ "type": zod.z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": zod.z.enum(["sending", "receiving", "proxying", "refunding", "overall"]).optional(), "provider": zod.z.string().optional(), "amount": zod.z.string().optional(), "amountInUSD": zod.z.string().optional(), "currency": zod.z.string().optional(), "receiverAddress": zod.z.string().optional(), "network": zod.z.string().optional(), "rateProvider": zod.z.string().optional() }).passthrough()).optional(), "speed": zod.z.union([zod.z.string(), zod.z.number()]), "price_impact": zod.z.number().optional(), "chain": zod.z.string(), "token": zod.z.string() }).passthrough()) }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_200 });
var RequestControllerV2_getRequestPaymentRoutes_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 400 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_400 });
var RequestControllerV2_getRequestPaymentRoutes_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_404 });
var RequestControllerV2_getRequestPaymentRoutes_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_429 });
var RequestControllerV2_sendPaymentIntent_v2_Request = zod.z.object({ "signedPaymentIntent": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough(), "signedApprovalPermit": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "request", variant: "application/json" }, schema: RequestControllerV2_sendPaymentIntent_v2_Request });
var RequestControllerV2_sendPaymentIntent_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 200 }, schema: RequestControllerV2_sendPaymentIntent_v2_200 });
var RequestControllerV2_sendPaymentIntent_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 404 }, schema: RequestControllerV2_sendPaymentIntent_v2_404 });
var RequestControllerV2_sendPaymentIntent_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 429 }, schema: RequestControllerV2_sendPaymentIntent_v2_429 });
var NullableRequestStatusSchema = zod.z.preprocess((value) => {
  if (!value || typeof value !== "object") {
    return value;
  }
  const next = { ...value };
  if (next.recurrence === null) {
    delete next.recurrence;
  }
  if (next.originalRequestId === null) {
    next.originalRequestId = void 0;
  }
  if (next.originalRequestPaymentReference === null) {
    next.originalRequestPaymentReference = void 0;
  }
  return next;
}, RequestControllerV2_getRequestStatus_v2_200);
schemaRegistry.register({
  key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 200 },
  schema: NullableRequestStatusSchema
});
var FlexibleRoutesSchema = zod.z.object({
  routes: zod.z.array(
    zod.z.object({
      fee: zod.z.union([zod.z.number(), zod.z.string()]).optional()
    }).passthrough()
  )
}).passthrough();
schemaRegistry.register({
  key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 200 },
  schema: FlexibleRoutesSchema
});

exports.createRequestsApi = createRequestsApi;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map