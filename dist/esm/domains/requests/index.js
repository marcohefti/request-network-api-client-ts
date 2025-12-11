import { z } from 'zod';

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
var RequestControllerV1_createRequest_v1_Request = z.object({ "payer": z.string().optional(), "payee": z.string(), "amount": z.string(), "invoiceCurrency": z.string(), "paymentCurrency": z.string(), "recurrence": z.object({ "startDate": z.string(), "frequency": z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "request", variant: "application/json" }, schema: RequestControllerV1_createRequest_v1_Request });
var RequestControllerV1_createRequest_v1_201 = z.object({ "paymentReference": z.string().optional(), "requestID": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 201 }, schema: RequestControllerV1_createRequest_v1_201 });
var RequestControllerV1_createRequest_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 400 }, schema: RequestControllerV1_createRequest_v1_400 });
var RequestControllerV1_createRequest_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 401 }, schema: RequestControllerV1_createRequest_v1_401 });
var RequestControllerV1_createRequest_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 404 }, schema: RequestControllerV1_createRequest_v1_404 });
var RequestControllerV1_createRequest_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 429 }, schema: RequestControllerV1_createRequest_v1_429 });
var RequestControllerV1_getRequestStatus_v1_200 = z.object({ "hasBeenPaid": z.boolean().optional(), "paymentReference": z.string().optional(), "requestId": z.string().optional(), "isListening": z.boolean().optional(), "txHash": z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getRequestStatus_v1_200 });
var RequestControllerV1_getRequestStatus_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getRequestStatus_v1_401 });
var RequestControllerV1_getRequestStatus_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getRequestStatus_v1_404 });
var RequestControllerV1_getRequestStatus_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getRequestStatus_v1_429 });
var RequestControllerV1_stopRecurrenceRequest_v1_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 200 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_200 });
var RequestControllerV1_stopRecurrenceRequest_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 401 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_401 });
var RequestControllerV1_stopRecurrenceRequest_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 404 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_404 });
var RequestControllerV1_stopRecurrenceRequest_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 429 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_429 });
var RequestControllerV1_getPaymentCalldata_v1_200 = z.union([z.object({ "transactions": z.array(z.object({ "data": z.string(), "to": z.string(), "value": z.object({ "type": z.enum(["BigNumber"]).optional(), "hex": z.string().optional() }).passthrough() }).passthrough()), "metadata": z.object({ "stepsRequired": z.number(), "needsApproval": z.boolean(), "approvalTransactionIndex": z.number().nullable().optional(), "hasEnoughBalance": z.boolean(), "hasEnoughGas": z.boolean() }).passthrough() }).passthrough(), z.object({ "paymentIntentId": z.string(), "paymentIntent": z.string(), "approvalPermitPayload": z.string().nullable().optional(), "approvalCalldata": z.object({ "to": z.string().optional(), "data": z.string().optional(), "value": z.string().optional() }).passthrough().nullable().optional(), "metadata": z.object({ "supportsEIP2612": z.boolean() }).passthrough() }).passthrough()]);
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getPaymentCalldata_v1_200 });
var RequestControllerV1_getPaymentCalldata_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 400 }, schema: RequestControllerV1_getPaymentCalldata_v1_400 });
var RequestControllerV1_getPaymentCalldata_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getPaymentCalldata_v1_401 });
var RequestControllerV1_getPaymentCalldata_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getPaymentCalldata_v1_404 });
var RequestControllerV1_getPaymentCalldata_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getPaymentCalldata_v1_429 });
var RequestControllerV1_getRequestPaymentRoutes_v1_200 = z.object({ "routes": z.array(z.object({ "id": z.string(), "fee": z.number(), "feeBreakdown": z.array(z.object({ "type": z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": z.enum(["sending", "receiving", "proxying", "refunding", "overall"]).optional(), "provider": z.string().optional(), "amount": z.string().optional(), "amountInUSD": z.string().optional(), "currency": z.string().optional(), "receiverAddress": z.string().optional(), "network": z.string().optional(), "rateProvider": z.string().optional() }).passthrough()).optional(), "speed": z.union([z.string(), z.number()]), "price_impact": z.number().optional(), "chain": z.string(), "token": z.string() }).passthrough()) }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_200 });
var RequestControllerV1_getRequestPaymentRoutes_v1_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 400 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_400 });
var RequestControllerV1_getRequestPaymentRoutes_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_401 });
var RequestControllerV1_getRequestPaymentRoutes_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_404 });
var RequestControllerV1_getRequestPaymentRoutes_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_429 });
var RequestControllerV1_sendPaymentIntent_v1_Request = z.object({ "signedPaymentIntent": z.object({ "signature": z.string(), "nonce": z.string(), "deadline": z.string() }).passthrough(), "signedApprovalPermit": z.object({ "signature": z.string(), "nonce": z.string(), "deadline": z.string() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "request", variant: "application/json" }, schema: RequestControllerV1_sendPaymentIntent_v1_Request });
var RequestControllerV1_sendPaymentIntent_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 401 }, schema: RequestControllerV1_sendPaymentIntent_v1_401 });
var RequestControllerV1_sendPaymentIntent_v1_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 404 }, schema: RequestControllerV1_sendPaymentIntent_v1_404 });
var RequestControllerV1_sendPaymentIntent_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 429 }, schema: RequestControllerV1_sendPaymentIntent_v1_429 });
var RequestControllerV2_createRequest_v2_Request = z.object({ "payer": z.string().optional(), "payee": z.string().optional(), "amount": z.string(), "invoiceCurrency": z.string(), "paymentCurrency": z.string(), "recurrence": z.object({ "startDate": z.string(), "frequency": z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) }).passthrough().optional(), "isCryptoToFiatAvailable": z.boolean().optional(), "customerInfo": z.object({ "firstName": z.string().optional(), "lastName": z.string().optional(), "email": z.string().optional(), "address": z.object({ "street": z.string().optional(), "city": z.string().optional(), "state": z.string().optional(), "postalCode": z.string().optional(), "country": z.string().optional() }).passthrough().optional() }).passthrough().optional(), "reference": z.string().optional(), "originalRequestId": z.string().optional(), "originalRequestPaymentReference": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "request", variant: "application/json" }, schema: RequestControllerV2_createRequest_v2_Request });
var RequestControllerV2_createRequest_v2_201 = z.object({ "paymentReference": z.string().optional(), "requestId": z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 201 }, schema: RequestControllerV2_createRequest_v2_201 });
var RequestControllerV2_createRequest_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 400 }, schema: RequestControllerV2_createRequest_v2_400 });
var RequestControllerV2_createRequest_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 404 }, schema: RequestControllerV2_createRequest_v2_404 });
var RequestControllerV2_createRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 429 }, schema: RequestControllerV2_createRequest_v2_429 });
var RequestControllerV2_getRequestStatus_v2_200 = z.object({ "hasBeenPaid": z.boolean().optional(), "paymentReference": z.string().optional(), "requestId": z.string().optional(), "isListening": z.boolean().optional(), "txHash": z.string().nullable().optional(), "recurrence": z.object({}).passthrough().optional(), "originalRequestId": z.string().optional(), "status": z.string().optional(), "isCryptoToFiatAvailable": z.boolean().optional(), "originalRequestPaymentReference": z.string().optional(), "payments": z.array(z.object({}).passthrough()).optional(), "isRecurrenceStopped": z.boolean().optional(), "customerInfo": z.object({ "firstName": z.string().optional(), "lastName": z.string().optional(), "email": z.string().optional(), "address": z.object({ "street": z.string().optional(), "city": z.string().optional(), "state": z.string().optional(), "postalCode": z.string().optional(), "country": z.string().optional() }).passthrough().optional() }).passthrough().nullable().optional(), "reference": z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getRequestStatus_v2_200 });
var RequestControllerV2_getRequestStatus_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getRequestStatus_v2_404 });
var RequestControllerV2_getRequestStatus_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getRequestStatus_v2_429 });
var RequestControllerV2_updateRequest_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 200 }, schema: RequestControllerV2_updateRequest_v2_200 });
var RequestControllerV2_updateRequest_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 404 }, schema: RequestControllerV2_updateRequest_v2_404 });
var RequestControllerV2_updateRequest_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 429 }, schema: RequestControllerV2_updateRequest_v2_429 });
var RequestControllerV2_getPaymentCalldata_v2_200 = z.union([z.object({ "transactions": z.array(z.object({ "data": z.string(), "to": z.string(), "value": z.object({ "type": z.enum(["BigNumber"]).optional(), "hex": z.string().optional() }).passthrough() }).passthrough()), "metadata": z.object({ "stepsRequired": z.number(), "needsApproval": z.boolean(), "approvalTransactionIndex": z.number().nullable().optional(), "hasEnoughBalance": z.boolean(), "hasEnoughGas": z.boolean() }).passthrough() }).passthrough(), z.object({ "paymentIntentId": z.string(), "paymentIntent": z.string(), "approvalPermitPayload": z.string().nullable().optional(), "approvalCalldata": z.object({ "to": z.string().optional(), "data": z.string().optional(), "value": z.string().optional() }).passthrough().nullable().optional(), "metadata": z.object({ "supportsEIP2612": z.boolean() }).passthrough() }).passthrough()]);
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getPaymentCalldata_v2_200 });
var RequestControllerV2_getPaymentCalldata_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 400 }, schema: RequestControllerV2_getPaymentCalldata_v2_400 });
var RequestControllerV2_getPaymentCalldata_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getPaymentCalldata_v2_404 });
var RequestControllerV2_getPaymentCalldata_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getPaymentCalldata_v2_429 });
var RequestControllerV2_getRequestPaymentRoutes_v2_200 = z.object({ "routes": z.array(z.object({ "id": z.string(), "fee": z.number(), "feeBreakdown": z.array(z.object({ "type": z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": z.enum(["sending", "receiving", "proxying", "refunding", "overall"]).optional(), "provider": z.string().optional(), "amount": z.string().optional(), "amountInUSD": z.string().optional(), "currency": z.string().optional(), "receiverAddress": z.string().optional(), "network": z.string().optional(), "rateProvider": z.string().optional() }).passthrough()).optional(), "speed": z.union([z.string(), z.number()]), "price_impact": z.number().optional(), "chain": z.string(), "token": z.string() }).passthrough()) }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_200 });
var RequestControllerV2_getRequestPaymentRoutes_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 400 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_400 });
var RequestControllerV2_getRequestPaymentRoutes_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_404 });
var RequestControllerV2_getRequestPaymentRoutes_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_429 });
var RequestControllerV2_sendPaymentIntent_v2_Request = z.object({ "signedPaymentIntent": z.object({ "signature": z.string(), "nonce": z.string(), "deadline": z.string() }).passthrough(), "signedApprovalPermit": z.object({ "signature": z.string(), "nonce": z.string(), "deadline": z.string() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "request", variant: "application/json" }, schema: RequestControllerV2_sendPaymentIntent_v2_Request });
var RequestControllerV2_sendPaymentIntent_v2_200 = z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 200 }, schema: RequestControllerV2_sendPaymentIntent_v2_200 });
var RequestControllerV2_sendPaymentIntent_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 404 }, schema: RequestControllerV2_sendPaymentIntent_v2_404 });
var RequestControllerV2_sendPaymentIntent_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 429 }, schema: RequestControllerV2_sendPaymentIntent_v2_429 });
var NullableRequestStatusSchema = z.preprocess((value) => {
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
var FlexibleRoutesSchema = z.object({
  routes: z.array(
    z.object({
      fee: z.union([z.number(), z.string()]).optional()
    }).passthrough()
  )
}).passthrough();
schemaRegistry.register({
  key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 200 },
  schema: FlexibleRoutesSchema
});

export { createRequestsApi };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map