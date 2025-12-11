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

// src/domains/payer/v1/payer.v1.facade.ts
var OP_CREATE_COMPLIANCE = "PayerV1Controller_getComplianceData_v1";
var OP_GET_STATUS = "PayerV1Controller_getComplianceStatus_v1";
var OP_UPDATE_STATUS = "PayerV1Controller_updateComplianceStatus_v1";
var OP_CREATE_PAYMENT_DETAILS = "PayerV1Controller_createPaymentDetails_v1";
var OP_GET_PAYMENT_DETAILS = "PayerV1Controller_getPaymentDetails_v1";
function createPayerV1Api(http) {
  return {
    async createComplianceData(body, options) {
      return requestJson(http, {
        operationId: OP_CREATE_COMPLIANCE,
        method: "POST",
        path: "/v1/payer",
        body,
        requestSchemaKey: { operationId: OP_CREATE_COMPLIANCE, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_COMPLIANCE, kind: "response", status: 200 },
        description: "Legacy create compliance data",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getComplianceStatus(clientUserId, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson(http, {
        operationId: OP_GET_STATUS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_STATUS, kind: "response", status: 200 },
        description: "Legacy get compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async updateComplianceStatus(clientUserId, body, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson(http, {
        operationId: OP_UPDATE_STATUS,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE_STATUS, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_UPDATE_STATUS, kind: "response", status: 200 },
        description: "Legacy update compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async createPaymentDetails(clientUserId, body, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson(http, {
        operationId: OP_CREATE_PAYMENT_DETAILS,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS, kind: "response", status: 201 },
        description: "Legacy create payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getPaymentDetails(clientUserId, options) {
      const path = `/v1/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson(http, {
        operationId: OP_GET_PAYMENT_DETAILS,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_PAYMENT_DETAILS, kind: "response", status: 200 },
        description: "Legacy get payment details",
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
var PayerV1Controller_getComplianceData_v1_Request = zod.z.object({ "clientUserId": zod.z.string(), "email": zod.z.string(), "firstName": zod.z.string(), "lastName": zod.z.string(), "beneficiaryType": zod.z.enum(["individual", "business"]), "companyName": zod.z.string().optional(), "dateOfBirth": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string(), "postcode": zod.z.string(), "country": zod.z.string(), "nationality": zod.z.string(), "phone": zod.z.string(), "ssn": zod.z.string(), "sourceOfFunds": zod.z.string().optional(), "businessActivity": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "request", variant: "application/json" }, schema: PayerV1Controller_getComplianceData_v1_Request });
var PayerV1Controller_getComplianceData_v1_200 = zod.z.object({ "agreementUrl": zod.z.string().optional(), "kycUrl": zod.z.string().optional(), "status": zod.z.object({ "agreementStatus": zod.z.enum(["not_started", "completed"]), "kycStatus": zod.z.enum(["not_started", "completed"]) }).passthrough(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 200 }, schema: PayerV1Controller_getComplianceData_v1_200 });
var PayerV1Controller_getComplianceData_v1_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 400 }, schema: PayerV1Controller_getComplianceData_v1_400 });
var PayerV1Controller_getComplianceData_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 401 }, schema: PayerV1Controller_getComplianceData_v1_401 });
var PayerV1Controller_getComplianceData_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 404 }, schema: PayerV1Controller_getComplianceData_v1_404 });
var PayerV1Controller_getComplianceData_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 429 }, schema: PayerV1Controller_getComplianceData_v1_429 });
var PayerV1Controller_getComplianceStatus_v1_200 = zod.z.object({ "kycStatus": zod.z.string().optional(), "agreementStatus": zod.z.string().optional(), "isCompliant": zod.z.boolean().optional(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 200 }, schema: PayerV1Controller_getComplianceStatus_v1_200 });
var PayerV1Controller_getComplianceStatus_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 401 }, schema: PayerV1Controller_getComplianceStatus_v1_401 });
var PayerV1Controller_getComplianceStatus_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 404 }, schema: PayerV1Controller_getComplianceStatus_v1_404 });
var PayerV1Controller_getComplianceStatus_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 429 }, schema: PayerV1Controller_getComplianceStatus_v1_429 });
var PayerV1Controller_updateComplianceStatus_v1_Request = zod.z.object({ "agreementCompleted": zod.z.boolean() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "request", variant: "application/json" }, schema: PayerV1Controller_updateComplianceStatus_v1_Request });
var PayerV1Controller_updateComplianceStatus_v1_200 = zod.z.object({ "success": zod.z.boolean().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 200 }, schema: PayerV1Controller_updateComplianceStatus_v1_200 });
var PayerV1Controller_updateComplianceStatus_v1_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 400 }, schema: PayerV1Controller_updateComplianceStatus_v1_400 });
var PayerV1Controller_updateComplianceStatus_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 401 }, schema: PayerV1Controller_updateComplianceStatus_v1_401 });
var PayerV1Controller_updateComplianceStatus_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 404 }, schema: PayerV1Controller_updateComplianceStatus_v1_404 });
var PayerV1Controller_updateComplianceStatus_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 429 }, schema: PayerV1Controller_updateComplianceStatus_v1_429 });
var PayerV1Controller_getPaymentDetails_v1_200 = zod.z.object({ "paymentDetails": zod.z.array(zod.z.object({ "id": zod.z.string().optional(), "userId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "beneficiaryType": zod.z.string().optional(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "currency": zod.z.string().optional(), "status": zod.z.string().optional(), "rails": zod.z.string().optional() }).passthrough()).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 200 }, schema: PayerV1Controller_getPaymentDetails_v1_200 });
var PayerV1Controller_getPaymentDetails_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 401 }, schema: PayerV1Controller_getPaymentDetails_v1_401 });
var PayerV1Controller_getPaymentDetails_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 404 }, schema: PayerV1Controller_getPaymentDetails_v1_404 });
var PayerV1Controller_getPaymentDetails_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 429 }, schema: PayerV1Controller_getPaymentDetails_v1_429 });
var PayerV1Controller_createPaymentDetails_v1_Request = zod.z.object({ "bankName": zod.z.string(), "accountName": zod.z.string(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]), "currency": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string().optional(), "country": zod.z.string(), "dateOfBirth": zod.z.string(), "postalCode": zod.z.string(), "rails": zod.z.enum(["local", "swift", "wire"]).optional(), "sortCode": zod.z.string().optional(), "iban": zod.z.string().optional(), "swiftBic": zod.z.string().optional(), "documentNumber": zod.z.string().optional(), "documentType": zod.z.string().optional(), "accountType": zod.z.enum(["checking", "savings"]).optional(), "ribNumber": zod.z.string().optional(), "bsbNumber": zod.z.string().optional(), "ncc": zod.z.string().optional(), "branchCode": zod.z.string().optional(), "bankCode": zod.z.string().optional(), "ifsc": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "request", variant: "application/json" }, schema: PayerV1Controller_createPaymentDetails_v1_Request });
var PayerV1Controller_createPaymentDetails_v1_201 = zod.z.object({ "payment_detail": zod.z.object({ "id": zod.z.string().optional(), "clientUserId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "currency": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]).optional() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 201 }, schema: PayerV1Controller_createPaymentDetails_v1_201 });
var PayerV1Controller_createPaymentDetails_v1_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 400 }, schema: PayerV1Controller_createPaymentDetails_v1_400 });
var PayerV1Controller_createPaymentDetails_v1_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 401 }, schema: PayerV1Controller_createPaymentDetails_v1_401 });
var PayerV1Controller_createPaymentDetails_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 404 }, schema: PayerV1Controller_createPaymentDetails_v1_404 });
var PayerV1Controller_createPaymentDetails_v1_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 429 }, schema: PayerV1Controller_createPaymentDetails_v1_429 });
var PayerV2Controller_getComplianceData_v2_Request = zod.z.object({ "clientUserId": zod.z.string(), "email": zod.z.string(), "firstName": zod.z.string(), "lastName": zod.z.string(), "beneficiaryType": zod.z.enum(["individual", "business"]), "companyName": zod.z.string().optional(), "dateOfBirth": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string(), "postcode": zod.z.string(), "country": zod.z.string(), "nationality": zod.z.string(), "phone": zod.z.string(), "ssn": zod.z.string(), "sourceOfFunds": zod.z.string().optional(), "businessActivity": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "request", variant: "application/json" }, schema: PayerV2Controller_getComplianceData_v2_Request });
var PayerV2Controller_getComplianceData_v2_200 = zod.z.object({ "agreementUrl": zod.z.string().optional(), "kycUrl": zod.z.string().optional(), "status": zod.z.object({ "agreementStatus": zod.z.enum(["not_started", "completed"]), "kycStatus": zod.z.enum(["not_started", "completed"]) }).passthrough(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 200 }, schema: PayerV2Controller_getComplianceData_v2_200 });
var PayerV2Controller_getComplianceData_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 400 }, schema: PayerV2Controller_getComplianceData_v2_400 });
var PayerV2Controller_getComplianceData_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 401 }, schema: PayerV2Controller_getComplianceData_v2_401 });
var PayerV2Controller_getComplianceData_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 404 }, schema: PayerV2Controller_getComplianceData_v2_404 });
var PayerV2Controller_getComplianceData_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 429 }, schema: PayerV2Controller_getComplianceData_v2_429 });
var PayerV2Controller_getComplianceStatus_v2_200 = zod.z.object({ "kycStatus": zod.z.string().optional(), "agreementStatus": zod.z.string().optional(), "isCompliant": zod.z.boolean().optional(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 200 }, schema: PayerV2Controller_getComplianceStatus_v2_200 });
var PayerV2Controller_getComplianceStatus_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 401 }, schema: PayerV2Controller_getComplianceStatus_v2_401 });
var PayerV2Controller_getComplianceStatus_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 404 }, schema: PayerV2Controller_getComplianceStatus_v2_404 });
var PayerV2Controller_getComplianceStatus_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 429 }, schema: PayerV2Controller_getComplianceStatus_v2_429 });
var PayerV2Controller_updateComplianceStatus_v2_Request = zod.z.object({ "agreementCompleted": zod.z.boolean() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "request", variant: "application/json" }, schema: PayerV2Controller_updateComplianceStatus_v2_Request });
var PayerV2Controller_updateComplianceStatus_v2_200 = zod.z.object({ "success": zod.z.boolean().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 200 }, schema: PayerV2Controller_updateComplianceStatus_v2_200 });
var PayerV2Controller_updateComplianceStatus_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 400 }, schema: PayerV2Controller_updateComplianceStatus_v2_400 });
var PayerV2Controller_updateComplianceStatus_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 401 }, schema: PayerV2Controller_updateComplianceStatus_v2_401 });
var PayerV2Controller_updateComplianceStatus_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 404 }, schema: PayerV2Controller_updateComplianceStatus_v2_404 });
var PayerV2Controller_updateComplianceStatus_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 429 }, schema: PayerV2Controller_updateComplianceStatus_v2_429 });
var PayerV2Controller_getPaymentDetails_v2_200 = zod.z.object({ "paymentDetails": zod.z.array(zod.z.object({ "id": zod.z.string().optional(), "userId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "beneficiaryType": zod.z.string().optional(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "currency": zod.z.string().optional(), "status": zod.z.string().optional(), "rails": zod.z.string().optional() }).passthrough()).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 200 }, schema: PayerV2Controller_getPaymentDetails_v2_200 });
var PayerV2Controller_getPaymentDetails_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 401 }, schema: PayerV2Controller_getPaymentDetails_v2_401 });
var PayerV2Controller_getPaymentDetails_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 404 }, schema: PayerV2Controller_getPaymentDetails_v2_404 });
var PayerV2Controller_getPaymentDetails_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 429 }, schema: PayerV2Controller_getPaymentDetails_v2_429 });
var PayerV2Controller_createPaymentDetails_v2_Request = zod.z.object({ "bankName": zod.z.string(), "accountName": zod.z.string(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]), "currency": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string().optional(), "country": zod.z.string(), "dateOfBirth": zod.z.string(), "postalCode": zod.z.string(), "rails": zod.z.enum(["local", "swift", "wire"]).optional(), "sortCode": zod.z.string().optional(), "iban": zod.z.string().optional(), "swiftBic": zod.z.string().optional(), "documentNumber": zod.z.string().optional(), "documentType": zod.z.string().optional(), "accountType": zod.z.enum(["checking", "savings"]).optional(), "ribNumber": zod.z.string().optional(), "bsbNumber": zod.z.string().optional(), "ncc": zod.z.string().optional(), "branchCode": zod.z.string().optional(), "bankCode": zod.z.string().optional(), "ifsc": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "request", variant: "application/json" }, schema: PayerV2Controller_createPaymentDetails_v2_Request });
var PayerV2Controller_createPaymentDetails_v2_201 = zod.z.object({ "payment_detail": zod.z.object({ "id": zod.z.string().optional(), "clientUserId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "currency": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]).optional() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 201 }, schema: PayerV2Controller_createPaymentDetails_v2_201 });
var PayerV2Controller_createPaymentDetails_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 400 }, schema: PayerV2Controller_createPaymentDetails_v2_400 });
var PayerV2Controller_createPaymentDetails_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 401 }, schema: PayerV2Controller_createPaymentDetails_v2_401 });
var PayerV2Controller_createPaymentDetails_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 404 }, schema: PayerV2Controller_createPaymentDetails_v2_404 });
var PayerV2Controller_createPaymentDetails_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 429 }, schema: PayerV2Controller_createPaymentDetails_v2_429 });

// src/domains/payer/v2/payer.v2.facade.ts
var OP_CREATE_COMPLIANCE2 = "PayerV2Controller_getComplianceData_v2";
var OP_GET_STATUS2 = "PayerV2Controller_getComplianceStatus_v2";
var OP_UPDATE_STATUS2 = "PayerV2Controller_updateComplianceStatus_v2";
var OP_CREATE_PAYMENT_DETAILS2 = "PayerV2Controller_createPaymentDetails_v2";
var OP_GET_PAYMENT_DETAILS2 = "PayerV2Controller_getPaymentDetails_v2";
function createPayerV2Api(http) {
  return {
    async createComplianceData(body, options) {
      return requestJson(http, {
        operationId: OP_CREATE_COMPLIANCE2,
        method: "POST",
        path: "/v2/payer",
        body,
        requestSchemaKey: { operationId: OP_CREATE_COMPLIANCE2, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_COMPLIANCE2, kind: "response", status: 200 },
        description: "Create compliance data",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getComplianceStatus(clientUserId, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson(http, {
        operationId: OP_GET_STATUS2,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_STATUS2, kind: "response", status: 200 },
        description: "Get compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async updateComplianceStatus(clientUserId, body, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}`;
      return requestJson(http, {
        operationId: OP_UPDATE_STATUS2,
        method: "PATCH",
        path,
        body,
        requestSchemaKey: { operationId: OP_UPDATE_STATUS2, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_UPDATE_STATUS2, kind: "response", status: 200 },
        description: "Update compliance status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async createPaymentDetails(clientUserId, body, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson(http, {
        operationId: OP_CREATE_PAYMENT_DETAILS2,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS2, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE_PAYMENT_DETAILS2, kind: "response", status: 201 },
        description: "Create payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getPaymentDetails(clientUserId, options) {
      const path = `/v2/payer/${encodeURIComponent(clientUserId)}/payment-details`;
      return requestJson(http, {
        operationId: OP_GET_PAYMENT_DETAILS2,
        method: "GET",
        path,
        schemaKey: { operationId: OP_GET_PAYMENT_DETAILS2, kind: "response", status: 200 },
        description: "Get payment details",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    }
  };
}

// src/domains/payer/payer.facade.ts
function createPayerApi(http) {
  const v2 = createPayerV2Api(http);
  const legacy = createPayerV1Api(http);
  return Object.assign({ legacy }, v2);
}

exports.createPayerApi = createPayerApi;
exports.createPayerV1Api = createPayerV1Api;
exports.createPayerV2Api = createPayerV2Api;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map