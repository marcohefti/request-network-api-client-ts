'use strict';

var zod = require('zod');
var buffer = require('buffer');
var crypto = require('crypto');

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/core/errors/request-api.error.ts
var REQUEST_ERROR_NAME = "RequestApiError";
var RequestApiError = class extends Error {
  status;
  code;
  detail;
  errors;
  requestId;
  correlationId;
  retryAfterMs;
  headers;
  meta;
  constructor(metadata) {
    super(metadata.message, { cause: metadata.cause });
    this.name = REQUEST_ERROR_NAME;
    this.status = metadata.status;
    this.code = metadata.code;
    this.detail = metadata.detail;
    this.errors = metadata.errors;
    this.requestId = metadata.requestId;
    this.correlationId = metadata.correlationId;
    this.retryAfterMs = metadata.retryAfterMs;
    this.headers = metadata.headers;
    this.meta = metadata.meta;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      detail: this.detail,
      errors: this.errors,
      requestId: this.requestId,
      correlationId: this.correlationId,
      retryAfterMs: this.retryAfterMs,
      headers: this.headers,
      meta: this.meta
    };
  }
};
var REQUEST_ID_HEADER = "x-request-id";
var CORRELATION_ID_HEADER = "x-correlation-id";
var RETRY_AFTER_HEADER = "retry-after";
function normaliseHeaders(headers) {
  if (!headers) {
    return void 0;
  }
  if (typeof headers.get === "function") {
    const lookup = headers;
    return {
      [REQUEST_ID_HEADER]: lookup.get(REQUEST_ID_HEADER),
      [CORRELATION_ID_HEADER]: lookup.get(CORRELATION_ID_HEADER),
      [RETRY_AFTER_HEADER]: lookup.get(RETRY_AFTER_HEADER)
    };
  }
  return {
    [REQUEST_ID_HEADER]: headers[REQUEST_ID_HEADER],
    [CORRELATION_ID_HEADER]: headers[CORRELATION_ID_HEADER],
    [RETRY_AFTER_HEADER]: headers[RETRY_AFTER_HEADER]
  };
}
function parseRetryAfter(headerValue) {
  if (!headerValue) {
    return void 0;
  }
  const numeric = Number(headerValue);
  if (!Number.isNaN(numeric)) {
    return numeric * 1e3;
  }
  const parsedDate = Date.parse(headerValue);
  if (Number.isNaN(parsedDate)) {
    return void 0;
  }
  const delay = parsedDate - Date.now();
  return delay > 0 ? delay : 0;
}
function buildRequestApiError(options) {
  const { payload, status, headers, fallbackMessage, meta, cause } = options;
  const normalisedHeaders = normaliseHeaders(headers);
  const retryAfterHeader = normalisedHeaders?.[RETRY_AFTER_HEADER];
  const retryAfterMs = parseRetryAfter(retryAfterHeader);
  const code = typeof payload?.code === "string" && payload.code.length > 0 ? payload.code : `HTTP_${String(status)}`;
  const message = typeof payload?.message === "string" && payload.message.length > 0 ? payload.message : fallbackMessage ?? "Request Network API error";
  const maybeErrors = Array.isArray(payload?.errors) ? payload.errors : void 0;
  const errors = maybeErrors?.filter(Boolean);
  return new RequestApiError({
    status,
    code,
    message,
    detail: payload?.detail,
    errors,
    requestId: normalisedHeaders?.[REQUEST_ID_HEADER],
    correlationId: normalisedHeaders?.[CORRELATION_ID_HEADER],
    retryAfterMs,
    headers: normalisedHeaders,
    meta,
    cause
  });
}
function isRequestApiError(error) {
  return error instanceof RequestApiError || typeof error === "object" && error !== null && error.name === REQUEST_ERROR_NAME;
}

// src/core/http/retry.policy.ts
var DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 250,
  maxDelayMs: 5e3,
  backoffFactor: 2,
  jitter: "full",
  retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
  allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]
};
function shouldRetryRequest(config, input) {
  if (config.maxAttempts <= 1) {
    return { retry: false, reason: "retries-disabled" };
  }
  if (input.attempt >= config.maxAttempts) {
    return { retry: false, reason: "max-attempts-exceeded" };
  }
  if (config.shouldRetry) {
    const decision = config.shouldRetry(input);
    if (!decision) {
      return { retry: false, reason: "predicate-declined" };
    }
  } else {
    const statusFromError = isRequestApiError(input.error) ? input.error.status : void 0;
    const status = input.response?.status ?? statusFromError;
    if (typeof status !== "number" || !config.retryStatusCodes.includes(status)) {
      return { retry: false, reason: "status-not-retriable" };
    }
  }
  const delay = computeRetryDelay(config, input);
  return { retry: true, delayMs: delay, reason: "retry-scheduled" };
}
function computeRetryDelay(config, input) {
  const retryAfter = input.response?.retryAfterMs ?? extractRetryAfterFromError(input.error);
  if (retryAfter !== void 0 && retryAfter >= 0) {
    return clampDelay(retryAfter, config.maxDelayMs);
  }
  const attemptIndex = input.attempt - 1;
  const exponential = config.initialDelayMs * Math.pow(config.backoffFactor, attemptIndex);
  const jittered = applyJitter(exponential, config.jitter);
  return clampDelay(jittered, config.maxDelayMs);
}
function hasRetryAfter(x) {
  return typeof x === "object" && x !== null && "retryAfterMs" in x;
}
function extractRetryAfterFromError(err) {
  if (isRequestApiError(err)) {
    return err.retryAfterMs;
  }
  if (hasRetryAfter(err) && typeof err.retryAfterMs === "number") {
    return err.retryAfterMs;
  }
  return void 0;
}
function clampDelay(delay, maxDelay) {
  if (delay < 0) {
    return 0;
  }
  return delay > maxDelay ? maxDelay : delay;
}
function applyJitter(delay, jitter) {
  if (delay <= 0) {
    return 0;
  }
  switch (jitter) {
    case "none": {
      return delay;
    }
    case "half": {
      const min = delay / 2;
      return randomInRange(min, delay);
    }
    case "full":
    default: {
      return randomInRange(0, delay);
    }
  }
}
function randomInRange(min, max) {
  if (min >= max) {
    return min;
  }
  return min + Math.random() * (max - min);
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

// src/core/http/http.types.ts
function toQueryItems(value) {
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => String(item));
}
function resolveQuerySerializer(serializer) {
  if (!serializer || serializer === "comma") {
    return ({ key, value, set }) => {
      const joined = toQueryItems(value).join(",");
      set(key, joined);
    };
  }
  if (serializer === "repeat") {
    return ({ key, value, append }) => {
      const items = toQueryItems(value);
      for (const item of items) {
        append(key, item);
      }
    };
  }
  return serializer;
}
function buildUrl(baseUrl, path, query, serializer) {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(base + cleanPath);
  if (!query) return url.toString();
  const serialize = resolveQuerySerializer(serializer);
  const params = url.searchParams;
  for (const key of Object.keys(query)) {
    const raw = query[key];
    if (raw === void 0) continue;
    serialize({
      key,
      value: raw,
      set: (k, value) => {
        params.delete(k);
        params.set(k, value);
      },
      append: (k, value) => {
        params.append(k, value);
      }
    });
  }
  return url.toString();
}
function composeInterceptors(terminal, interceptors = []) {
  return interceptors.reduceRight((next, interceptor) => {
    return (req) => interceptor(req, next);
  }, terminal);
}

// src/core/auth/credential-header.builder.ts
function buildCredentialHeaders(options) {
  const headers = {};
  if (options.apiKey) headers["x-api-key"] = options.apiKey;
  if (options.clientId) headers["x-client-id"] = options.clientId;
  if (options.origin) headers["Origin"] = options.origin;
  return headers;
}

// src/core/http/adapters/adapter.utils.ts
function headersToRecord(headers) {
  const out = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}
function resolveSignal(options) {
  const { signal, timeoutMs } = options;
  if (timeoutMs === void 0) {
    return { signal, dispose: () => {
    } };
  }
  const controller = new AbortController();
  let timer;
  const abortForTimeout = () => {
    controller.abort(new Error(`Request timed out after ${String(timeoutMs)}ms`));
  };
  if (timeoutMs <= 0) {
    abortForTimeout();
  } else {
    timer = setTimeout(abortForTimeout, timeoutMs);
  }
  const cleanupTimer = () => {
    if (timer) clearTimeout(timer);
  };
  controller.signal.addEventListener("abort", cleanupTimer, { once: true });
  let removeAbortListener;
  if (signal) {
    if (signal.aborted) {
      cleanupTimer();
      controller.abort(signal.reason);
    } else {
      const onAbort = () => {
        cleanupTimer();
        controller.abort(signal.reason);
      };
      signal.addEventListener("abort", onAbort, { once: true });
      removeAbortListener = () => {
        signal.removeEventListener("abort", onAbort);
      };
    }
  }
  const dispose = () => {
    cleanupTimer();
    if (removeAbortListener) {
      removeAbortListener();
    }
  };
  return { signal: controller.signal, dispose };
}
function createFetchInit(request) {
  const headers = { ...request.headers ?? {} };
  const init = {
    method: request.method,
    headers
  };
  if (request.body !== void 0) {
    const body = request.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
    const isUint8 = body instanceof Uint8Array;
    const isArrayBuffer = typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
    if (typeof body === "string" || isFormData || isBlob || isUint8 || isArrayBuffer) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      headers["content-type"] ??= "application/json";
    }
  }
  const { signal, dispose } = resolveSignal({ signal: request.signal, timeoutMs: request.timeoutMs });
  if (signal) {
    init.signal = signal;
  }
  return { init, dispose };
}

// src/core/http/adapters/node-fetch.adapter.ts
var nodeFetchAdapter = {
  async send(request) {
    const { init, dispose } = createFetchInit(request);
    try {
      const res = await fetch(request.url, init);
      const respHeaders = headersToRecord(res.headers);
      const contentType = respHeaders["content-type"] ?? "";
      let data;
      let text;
      if (res.status !== 204) {
        try {
          if (contentType.includes("application/json")) {
            data = await res.json();
          } else {
            text = await res.text();
          }
        } catch {
        }
      }
      const normalized = {
        status: res.status,
        ok: res.ok,
        headers: respHeaders,
        data,
        text
      };
      return normalized;
    } finally {
      dispose();
    }
  }
};

// src/core/http/interceptors/logger.utils.ts
var LEVEL_RANK = {
  silent: 0,
  error: 1,
  info: 2,
  debug: 3
};
function shouldLog(level, threshold) {
  return LEVEL_RANK[level] >= LEVEL_RANK[threshold];
}

// src/core/http/interceptors/logging.interceptor.ts
function createLoggingInterceptor(options) {
  const log = options?.logger;
  const level = options?.level ?? "info";
  const EVENT_LEVEL = {
    "request:start": "debug",
    "request:response": "info",
    "request:error": "error"
  };
  const emit = (event, meta) => {
    if (!log) return;
    const threshold = EVENT_LEVEL[event];
    if (!shouldLog(level, threshold)) return;
    log(event, meta);
  };
  return async (req, next) => {
    const startedAt = Date.now();
    emit("request:start", { method: req.method, url: req.url, meta: req.meta });
    try {
      const res = await next(req);
      const durationMs = Date.now() - startedAt;
      emit("request:response", { method: req.method, url: req.url, status: res.status, ok: res.ok, durationMs, meta: req.meta });
      return res;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      emit("request:error", { method: req.method, url: req.url, durationMs, error, meta: req.meta });
      throw error;
    }
  };
}

// src/core/http/interceptors/retry.interceptor.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function createRetryInterceptor(options) {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...options?.config ?? {} };
  const allowed = new Set(cfg.allowedMethods ?? ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);
  const log = options?.logger;
  const level = options?.logLevel ?? "info";
  const RETRY_EVENT = "request:retry";
  const RATE_LIMIT_EVENT = "rate-limit";
  const DEFAULT_RETRY_REASON = "retry-scheduled";
  const emit = (event, meta) => {
    const threshold = event === RETRY_EVENT ? "info" : "info";
    if (!log) return;
    if (!shouldLog(level, threshold)) return;
    log(event, meta);
  };
  const parseRetryAfterMs = (headers) => {
    if (!headers) return void 0;
    const header = headers["retry-after"] ?? headers["Retry-After"];
    return parseRetryAfter(header);
  };
  const scheduleRetry = async (delayMs, meta) => {
    emit(RETRY_EVENT, { ...meta, reason: meta.reason ?? DEFAULT_RETRY_REASON });
    if (delayMs > 0) {
      await sleep(delayMs);
    }
  };
  const maybeHandleResponse = async ({
    res,
    attempt,
    context,
    isAllowedMethod
  }) => {
    if (res.ok) {
      return false;
    }
    const retryAfterMs = parseRetryAfterMs(res.headers);
    if (res.status === 429) {
      emit(RATE_LIMIT_EVENT, { ...context, status: res.status, attempt, retryAfterMs });
    }
    const decision = isAllowedMethod ? shouldRetryRequest(cfg, { attempt, response: { status: res.status, headers: res.headers, retryAfterMs } }) : { retry: false };
    if (!decision.retry) {
      return false;
    }
    const delay = decision.delayMs ?? computeRetryDelay(cfg, { attempt, response: { status: res.status, headers: res.headers, retryAfterMs } });
    await scheduleRetry(delay, {
      ...context,
      attempt,
      nextAttempt: attempt + 1,
      status: res.status,
      delayMs: delay,
      reason: decision.reason,
      retryAfterMs
    });
    return true;
  };
  const maybeHandleError = async ({
    error,
    attempt,
    context
  }) => {
    const decision = shouldRetryRequest(cfg, { attempt, error });
    if (!decision.retry) {
      return false;
    }
    const delay = decision.delayMs ?? computeRetryDelay(cfg, { attempt, error });
    await scheduleRetry(delay, {
      ...context,
      attempt,
      nextAttempt: attempt + 1,
      delayMs: delay,
      reason: decision.reason,
      error
    });
    return true;
  };
  return async function retryInterceptor(req, next) {
    const isAllowedMethod = allowed.has(req.method);
    for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
      try {
        const res = await next(req);
        const shouldRetry = await maybeHandleResponse({
          res,
          attempt,
          context: { method: req.method, url: req.url, meta: req.meta },
          isAllowedMethod
        });
        if (!shouldRetry) {
          return res;
        }
        continue;
      } catch (error) {
        const shouldRetry = await maybeHandleError({
          error,
          attempt,
          context: { method: req.method, url: req.url, meta: req.meta }
        });
        if (shouldRetry) {
          continue;
        }
        throw error;
      }
    }
    return next(req);
  };
}

// src/core/http/validation.config.ts
var DEFAULT_RUNTIME_VALIDATION = {
  requests: true,
  responses: true,
  errors: true
};
function normaliseBoolean(flag, fallback) {
  return typeof flag === "boolean" ? flag : fallback;
}
function normaliseRuntimeValidation(option) {
  if (typeof option === "boolean") {
    return {
      requests: option,
      responses: option,
      errors: option
    };
  }
  return {
    requests: normaliseBoolean(option?.requests, DEFAULT_RUNTIME_VALIDATION.requests),
    responses: normaliseBoolean(option?.responses, DEFAULT_RUNTIME_VALIDATION.responses),
    errors: normaliseBoolean(option?.errors, DEFAULT_RUNTIME_VALIDATION.errors)
  };
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
function cloneRuntimeValidation(config) {
  return { ...config };
}

// src/core/http/client.factory.ts
var DEFAULT_BASE_URL = "https://api.request.network";
function buildTelemetryHeaders(userAgent, sdkInfo) {
  const headers = {};
  if (userAgent) headers["user-agent"] = userAgent;
  if (sdkInfo?.name) headers["x-sdk"] = sdkInfo.version ? `${sdkInfo.name}/${sdkInfo.version}` : sdkInfo.name;
  return headers;
}
function buildHeaders(credentials, defaults, extra) {
  return {
    ...buildCredentialHeaders(credentials),
    ...defaults ?? {},
    ...{}
  };
}
function asRecord(value) {
  if (value && typeof value === "object" || Array.isArray(value)) {
    return value;
  }
  return void 0;
}
function mapToError(res, req, validation) {
  const operationId = req.meta?.operationId;
  const rawPayload = asRecord(res.data);
  let payload = rawPayload;
  if (validation.errors && operationId) {
    const schemaKey = { operationId, kind: "response", status: res.status };
    const parsed = parseWithRegistry({
      key: schemaKey,
      value: rawPayload ?? res.data,
      description: `Error response for ${operationId}`,
      skipOnMissingSchema: true
    });
    if (!parsed.success) {
      throw parsed.error;
    }
    payload = asRecord(parsed.data);
  }
  const error = buildRequestApiError({
    payload,
    status: res.status,
    headers: res.headers,
    fallbackMessage: res.text ?? `HTTP ${String(res.status)}`
  });
  throw error;
}
function createHttpClient(options = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const adapter = options.adapter ?? nodeFetchAdapter;
  const defaults = { ...buildTelemetryHeaders(options.userAgent, options.sdkInfo), ...options.headers ?? {} };
  const creds = { apiKey: options.apiKey, clientId: options.clientId, origin: options.origin };
  const userInterceptors = options.interceptors ?? [];
  const logLevel = options.logLevel ?? (options.logger ? "info" : "silent");
  const runtimeValidation = normaliseRuntimeValidation(options.runtimeValidation);
  function buildBaseInterceptors(meta) {
    const retryCfg = meta?.retry ?? options.retry?.config;
    const retryOptions = {
      ...options.retry ?? {},
      logger: options.retry?.logger ?? options.logger,
      logLevel: options.retry?.logLevel ?? logLevel
    };
    if (retryCfg) {
      retryOptions.config = retryCfg;
    }
    return [createRetryInterceptor(retryOptions), createLoggingInterceptor({ logger: options.logger, level: logLevel })];
  }
  const cfg = {
    baseUrl,
    defaultHeaders: buildHeaders(creds, defaults),
    adapter,
    logger: options.logger,
    querySerializer: options.querySerializer};
  async function dispatch(req) {
    const perRequestInterceptors = req.meta?.interceptors ?? [];
    const baseInterceptors = buildBaseInterceptors(req.meta);
    const all = [...perRequestInterceptors, ...userInterceptors, ...baseInterceptors];
    const terminal = (r) => cfg.adapter.send(r);
    const chain = composeInterceptors(terminal, all);
    return chain(req);
  }
  async function request(init) {
    const serializer = init.querySerializer ?? cfg.querySerializer;
    const url = buildUrl(cfg.baseUrl, init.path, init.query, serializer);
    const headers = { ...cfg.defaultHeaders ?? {}, ...init.headers ?? {} };
    const req = {
      method: init.method,
      url,
      headers,
      body: init.body,
      signal: init.signal,
      timeoutMs: init.timeoutMs,
      meta: init.meta
    };
    const res = await dispatch(req);
    const effectiveValidation = mergeRuntimeValidation(runtimeValidation, req.meta?.validation);
    if (!res.ok) {
      mapToError(res, req, effectiveValidation);
    }
    return { status: res.status, headers: res.headers, data: res.data };
  }
  return {
    request,
    get: (path, init) => request({ ...init ?? {}, path, method: "GET" }),
    post: (path, body, init) => request({ ...init ?? {}, path, method: "POST", body }),
    put: (path, body, init) => request({ ...init ?? {}, path, method: "PUT", body }),
    patch: (path, body, init) => request({ ...init ?? {}, path, method: "PATCH", body }),
    delete: (path, init) => {
      const { body, ...rest } = init ?? {};
      return request({ ...rest, path, method: "DELETE", body });
    },
    head: (path, init) => request({ ...init ?? {}, path, method: "HEAD" }),
    options: (path, init) => request({ ...init ?? {}, path, method: "OPTIONS" }),
    getRuntimeValidationConfig: () => cloneRuntimeValidation(runtimeValidation)
  };
}

// src/core/http/adapters/browser-fetch.adapter.ts
var browserFetchAdapter = {
  async send(request) {
    const { init, dispose } = createFetchInit(request);
    try {
      const res = await fetch(request.url, init);
      const respHeaders = headersToRecord(res.headers);
      const contentType = respHeaders["content-type"] ?? "";
      let data;
      let text;
      if (res.status !== 204) {
        try {
          if (contentType.includes("application/json")) {
            data = await res.json();
          } else {
            text = await res.text();
          }
        } catch {
        }
      }
      const normalized = {
        status: res.status,
        ok: res.ok,
        headers: respHeaders,
        data,
        text
      };
      return normalized;
    } finally {
      dispose();
    }
  }
};

// src/domains/client-ids/index.ts
var client_ids_exports = {};
__export(client_ids_exports, {
  createClientIdsApi: () => createClientIdsApi
});

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
var ClientIdV2Controller_findAll_v2_200 = zod.z.array(zod.z.object({ "id": zod.z.string().optional(), "clientId": zod.z.string().optional(), "label": zod.z.string().optional(), "allowedDomains": zod.z.array(zod.z.string()).optional(), "status": zod.z.string().optional(), "createdAt": zod.z.string().optional(), "lastUsedAt": zod.z.string().nullable().optional() }).passthrough());
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findAll_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_findAll_v2_200 });
var ClientIdV2Controller_findAll_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findAll_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_findAll_v2_401 });
var ClientIdV2Controller_findAll_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findAll_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_findAll_v2_429 });
var ClientIdV2Controller_create_v2_Request = zod.z.object({ "label": zod.z.string(), "allowedDomains": zod.z.array(zod.z.string()), "feePercentage": zod.z.string().optional(), "feeAddress": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "request", variant: "application/json" }, schema: ClientIdV2Controller_create_v2_Request });
var ClientIdV2Controller_create_v2_201 = zod.z.object({ "id": zod.z.string().optional(), "clientId": zod.z.string().optional(), "label": zod.z.string().optional(), "allowedDomains": zod.z.array(zod.z.string()).optional(), "feePercentage": zod.z.string().nullable().optional(), "feeAddress": zod.z.string().nullable().optional(), "status": zod.z.string().optional(), "createdAt": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 201 }, schema: ClientIdV2Controller_create_v2_201 });
var ClientIdV2Controller_create_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 400 }, schema: ClientIdV2Controller_create_v2_400 });
var ClientIdV2Controller_create_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_create_v2_401 });
var ClientIdV2Controller_create_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_create_v2_429 });
var ClientIdV2Controller_findOne_v2_200 = zod.z.object({ "id": zod.z.string().optional(), "clientId": zod.z.string().optional(), "label": zod.z.string().optional(), "allowedDomains": zod.z.array(zod.z.string()).optional(), "feePercentage": zod.z.string().nullable().optional(), "feeAddress": zod.z.string().nullable().optional(), "status": zod.z.string().optional(), "createdAt": zod.z.string().optional(), "updatedAt": zod.z.string().optional(), "lastUsedAt": zod.z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_findOne_v2_200 });
var ClientIdV2Controller_findOne_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_findOne_v2_401 });
var ClientIdV2Controller_findOne_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 404 }, schema: ClientIdV2Controller_findOne_v2_404 });
var ClientIdV2Controller_findOne_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_findOne_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_findOne_v2_429 });
var ClientIdV2Controller_update_v2_Request = zod.z.object({ "label": zod.z.string().optional(), "allowedDomains": zod.z.array(zod.z.string()).optional(), "feePercentage": zod.z.string().nullable().optional(), "feeAddress": zod.z.string().nullable().optional(), "status": zod.z.enum(["active", "inactive", "revoked"]).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "request", variant: "application/json" }, schema: ClientIdV2Controller_update_v2_Request });
var ClientIdV2Controller_update_v2_200 = zod.z.object({ "id": zod.z.string().optional(), "clientId": zod.z.string().optional(), "label": zod.z.string().optional(), "allowedDomains": zod.z.array(zod.z.string()).optional(), "feePercentage": zod.z.string().nullable().optional(), "feeAddress": zod.z.string().nullable().optional(), "status": zod.z.string().optional(), "updatedAt": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_update_v2_200 });
var ClientIdV2Controller_update_v2_400 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 400 }, schema: ClientIdV2Controller_update_v2_400 });
var ClientIdV2Controller_update_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_update_v2_401 });
var ClientIdV2Controller_update_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 404 }, schema: ClientIdV2Controller_update_v2_404 });
var ClientIdV2Controller_update_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_update_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_update_v2_429 });
var ClientIdV2Controller_delete_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 200 }, schema: ClientIdV2Controller_delete_v2_200 });
var ClientIdV2Controller_delete_v2_401 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 401 }, schema: ClientIdV2Controller_delete_v2_401 });
var ClientIdV2Controller_delete_v2_404 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 404 }, schema: ClientIdV2Controller_delete_v2_404 });
var ClientIdV2Controller_delete_v2_429 = ErrorEnvelopeSchema;
schemaRegistry.register({ key: { operationId: "ClientIdV2Controller_delete_v2", kind: "response", status: 429 }, schema: ClientIdV2Controller_delete_v2_429 });

// src/domains/currencies/index.ts
var currencies_exports = {};
__export(currencies_exports, {
  createCurrenciesApi: () => createCurrenciesApi,
  createCurrenciesV1Api: () => createCurrenciesV1Api
});
var ErrorDetailSchema2 = zod.z.object({
  message: zod.z.string(),
  code: zod.z.string().optional(),
  field: zod.z.string().optional(),
  source: zod.z.object({
    pointer: zod.z.string().optional(),
    parameter: zod.z.string().optional()
  }).passthrough().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema2 = zod.z.object({
  status: zod.z.number().optional(),
  statusCode: zod.z.number().optional(),
  code: zod.z.string().optional(),
  error: zod.z.string().optional(),
  message: zod.z.union([
    zod.z.string(),
    zod.z.array(zod.z.union([zod.z.string(), ErrorDetailSchema2])),
    ErrorDetailSchema2
  ]).optional(),
  detail: zod.z.unknown().optional(),
  errors: zod.z.array(ErrorDetailSchema2).optional(),
  requestId: zod.z.string().optional(),
  correlationId: zod.z.string().optional(),
  retryAfter: zod.z.union([zod.z.number(), zod.z.string()]).optional(),
  retryAfterMs: zod.z.number().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var CurrenciesV1Controller_getNetworkTokens_v1_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 200 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_200 });
var CurrenciesV1Controller_getNetworkTokens_v1_400 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 400 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_400 });
var CurrenciesV1Controller_getNetworkTokens_v1_404 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 404 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_404 });
var CurrenciesV1Controller_getNetworkTokens_v1_429 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getNetworkTokens_v1", kind: "response", status: 429 }, schema: CurrenciesV1Controller_getNetworkTokens_v1_429 });
var CurrenciesV1Controller_getConversionRoutes_v1_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getConversionRoutes_v1", kind: "response", status: 200 }, schema: CurrenciesV1Controller_getConversionRoutes_v1_200 });
var CurrenciesV1Controller_getConversionRoutes_v1_404 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getConversionRoutes_v1", kind: "response", status: 404 }, schema: CurrenciesV1Controller_getConversionRoutes_v1_404 });
var CurrenciesV1Controller_getConversionRoutes_v1_429 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV1Controller_getConversionRoutes_v1", kind: "response", status: 429 }, schema: CurrenciesV1Controller_getConversionRoutes_v1_429 });
var CurrenciesV2Controller_getNetworkTokens_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 200 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_200 });
var CurrenciesV2Controller_getNetworkTokens_v2_400 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 400 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_400 });
var CurrenciesV2Controller_getNetworkTokens_v2_404 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 404 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_404 });
var CurrenciesV2Controller_getNetworkTokens_v2_429 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getNetworkTokens_v2", kind: "response", status: 429 }, schema: CurrenciesV2Controller_getNetworkTokens_v2_429 });
var CurrenciesV2Controller_getConversionRoutes_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getConversionRoutes_v2", kind: "response", status: 200 }, schema: CurrenciesV2Controller_getConversionRoutes_v2_200 });
var CurrenciesV2Controller_getConversionRoutes_v2_404 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getConversionRoutes_v2", kind: "response", status: 404 }, schema: CurrenciesV2Controller_getConversionRoutes_v2_404 });
var CurrenciesV2Controller_getConversionRoutes_v2_429 = ErrorEnvelopeSchema2;
schemaRegistry.register({ key: { operationId: "CurrenciesV2Controller_getConversionRoutes_v2", kind: "response", status: 429 }, schema: CurrenciesV2Controller_getConversionRoutes_v2_429 });

// src/domains/currencies/currencies.schemas.ts
var OP_LIST = "CurrenciesV2Controller_getNetworkTokens_v2";
var OP_CONVERSION_ROUTES = "CurrenciesV2Controller_getConversionRoutes_v2";
var CurrencyTokenSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  symbol: zod.z.string(),
  decimals: zod.z.number(),
  address: zod.z.string().optional(),
  network: zod.z.string().optional(),
  type: zod.z.string().optional(),
  hash: zod.z.string().optional(),
  chainId: zod.z.number().optional()
}).passthrough();
var CurrenciesListSchema = zod.z.array(CurrencyTokenSchema);
var ConversionRoutesSchema = zod.z.object({
  currencyId: zod.z.string(),
  network: zod.z.string().nullable().optional(),
  conversionRoutes: zod.z.array(CurrencyTokenSchema)
}).passthrough();
schemaRegistry.register({ key: { operationId: OP_LIST, kind: "response", status: 200 }, schema: CurrenciesListSchema });
schemaRegistry.register({ key: { operationId: OP_CONVERSION_ROUTES, kind: "response", status: 200 }, schema: ConversionRoutesSchema });

// src/domains/currencies/v1/index.ts
var v1_exports = {};
__export(v1_exports, {
  createCurrenciesV1Api: () => createCurrenciesV1Api
});
var OP_LIST_V1 = "CurrenciesV1Controller_getNetworkTokens_v1";
var OP_CONVERSION_ROUTES_V1 = "CurrenciesV1Controller_getConversionRoutes_v1";
var DESCRIPTION_LIST = "Legacy currencies list";
var DESCRIPTION_CONVERSION_ROUTES = "Legacy conversion routes";
var CurrenciesV1ListSchema = zod.z.union([CurrenciesListSchema, CurrencyTokenSchema]);
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

// src/domains/pay/index.ts
var pay_exports = {};
__export(pay_exports, {
  createPayApi: () => createPayApi,
  createPayV1Api: () => createPayV1Api
});

// src/domains/pay/v1/index.ts
var v1_exports2 = {};
__export(v1_exports2, {
  createPayV1Api: () => createPayV1Api
});

// src/domains/pay/v1/pay.v1.facade.ts
var OP_PAY_REQUEST = "PayV1Controller_payRequest_v1";
var PAY_PATH = "/v1/pay";
var DESCRIPTION_PAY_REQUEST = "Legacy pay request";
function createPayV1Api(http) {
  return {
    async payRequest(body, options) {
      return requestJson(http, {
        operationId: OP_PAY_REQUEST,
        method: "POST",
        path: PAY_PATH,
        body,
        requestSchemaKey: { operationId: OP_PAY_REQUEST, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_PAY_REQUEST, kind: "response", status: 201 },
        description: DESCRIPTION_PAY_REQUEST,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    }
  };
}
var ErrorDetailSchema3 = zod.z.object({
  message: zod.z.string(),
  code: zod.z.string().optional(),
  field: zod.z.string().optional(),
  source: zod.z.object({
    pointer: zod.z.string().optional(),
    parameter: zod.z.string().optional()
  }).passthrough().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema3 = zod.z.object({
  status: zod.z.number().optional(),
  statusCode: zod.z.number().optional(),
  code: zod.z.string().optional(),
  error: zod.z.string().optional(),
  message: zod.z.union([
    zod.z.string(),
    zod.z.array(zod.z.union([zod.z.string(), ErrorDetailSchema3])),
    ErrorDetailSchema3
  ]).optional(),
  detail: zod.z.unknown().optional(),
  errors: zod.z.array(ErrorDetailSchema3).optional(),
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
var PayV1Controller_payRequest_v1_401 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 401 }, schema: PayV1Controller_payRequest_v1_401 });
var PayV1Controller_payRequest_v1_404 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 404 }, schema: PayV1Controller_payRequest_v1_404 });
var PayV1Controller_payRequest_v1_429 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayV1Controller_payRequest_v1", kind: "response", status: 429 }, schema: PayV1Controller_payRequest_v1_429 });
var PayoutV2Controller_payRequest_v2_Request = zod.z.object({ "payee": zod.z.string(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string(), "feePercentage": zod.z.string().optional(), "feeAddress": zod.z.string().optional(), "recurrence": zod.z.object({ "startDate": zod.z.string(), "frequency": zod.z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]), "totalPayments": zod.z.number(), "payer": zod.z.string() }).passthrough().optional(), "payerWallet": zod.z.string().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().optional(), "reference": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_payRequest_v2_Request });
var PayoutV2Controller_payRequest_v2_201 = zod.z.object({ "requestId": zod.z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_payRequest_v2_201 });
var PayoutV2Controller_payRequest_v2_404 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_payRequest_v2_404 });
var PayoutV2Controller_payRequest_v2_429 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payRequest_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_payRequest_v2_429 });
var PayoutV2Controller_payBatchRequest_v2_Request = zod.z.object({ "requests": zod.z.array(zod.z.object({ "payee": zod.z.string(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string() }).passthrough()).optional(), "requestIds": zod.z.array(zod.z.string()).optional(), "payer": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_payBatchRequest_v2_Request });
var PayoutV2Controller_payBatchRequest_v2_201 = zod.z.object({ "ERC20ApprovalTransactions": zod.z.array(zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.number() }).passthrough()).optional(), "ERC20BatchPaymentTransaction": zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]), "hex": zod.z.string() }).passthrough() }).passthrough().optional(), "ETHBatchPaymentTransaction": zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]), "hex": zod.z.string() }).passthrough() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_payBatchRequest_v2_201 });
var PayoutV2Controller_payBatchRequest_v2_400 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_payBatchRequest_v2_400 });
var PayoutV2Controller_payBatchRequest_v2_429 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_payBatchRequest_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_payBatchRequest_v2_429 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 200 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_200 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_404 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_404 });
var PayoutV2Controller_getRecurringPaymentStatus_v2_429 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_getRecurringPaymentStatus_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_getRecurringPaymentStatus_v2_429 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_Request = zod.z.object({ "permitSignature": zod.z.string() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_Request });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_201 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 201 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_201 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_400 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_400 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_404 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_404 });
var PayoutV2Controller_submitRecurringPaymentSignature_v2_429 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_submitRecurringPaymentSignature_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_submitRecurringPaymentSignature_v2_429 });
var PayoutV2Controller_updateRecurringPayment_v2_Request = zod.z.object({ "action": zod.z.enum(["cancel", "unpause"]) }).passthrough();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "request", variant: "application/json" }, schema: PayoutV2Controller_updateRecurringPayment_v2_Request });
var PayoutV2Controller_updateRecurringPayment_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 200 }, schema: PayoutV2Controller_updateRecurringPayment_v2_200 });
var PayoutV2Controller_updateRecurringPayment_v2_400 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 400 }, schema: PayoutV2Controller_updateRecurringPayment_v2_400 });
var PayoutV2Controller_updateRecurringPayment_v2_404 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 404 }, schema: PayoutV2Controller_updateRecurringPayment_v2_404 });
var PayoutV2Controller_updateRecurringPayment_v2_429 = ErrorEnvelopeSchema3;
schemaRegistry.register({ key: { operationId: "PayoutV2Controller_updateRecurringPayment_v2", kind: "response", status: 429 }, schema: PayoutV2Controller_updateRecurringPayment_v2_429 });

// src/domains/pay/pay.facade.ts
function createPayApi(http) {
  const legacy = createPayV1Api(http);
  return {
    ...legacy,
    legacy
  };
}

// src/domains/payer/index.ts
var payer_exports = {};
__export(payer_exports, {
  createPayerApi: () => createPayerApi,
  createPayerV1Api: () => createPayerV1Api,
  createPayerV2Api: () => createPayerV2Api
});

// src/domains/payer/v1/index.ts
var v1_exports3 = {};
__export(v1_exports3, {
  createPayerV1Api: () => createPayerV1Api
});

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
var ErrorDetailSchema4 = zod.z.object({
  message: zod.z.string(),
  code: zod.z.string().optional(),
  field: zod.z.string().optional(),
  source: zod.z.object({
    pointer: zod.z.string().optional(),
    parameter: zod.z.string().optional()
  }).passthrough().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema4 = zod.z.object({
  status: zod.z.number().optional(),
  statusCode: zod.z.number().optional(),
  code: zod.z.string().optional(),
  error: zod.z.string().optional(),
  message: zod.z.union([
    zod.z.string(),
    zod.z.array(zod.z.union([zod.z.string(), ErrorDetailSchema4])),
    ErrorDetailSchema4
  ]).optional(),
  detail: zod.z.unknown().optional(),
  errors: zod.z.array(ErrorDetailSchema4).optional(),
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
var PayerV1Controller_getComplianceData_v1_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 401 }, schema: PayerV1Controller_getComplianceData_v1_401 });
var PayerV1Controller_getComplianceData_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 404 }, schema: PayerV1Controller_getComplianceData_v1_404 });
var PayerV1Controller_getComplianceData_v1_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 429 }, schema: PayerV1Controller_getComplianceData_v1_429 });
var PayerV1Controller_getComplianceStatus_v1_200 = zod.z.object({ "kycStatus": zod.z.string().optional(), "agreementStatus": zod.z.string().optional(), "isCompliant": zod.z.boolean().optional(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 200 }, schema: PayerV1Controller_getComplianceStatus_v1_200 });
var PayerV1Controller_getComplianceStatus_v1_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 401 }, schema: PayerV1Controller_getComplianceStatus_v1_401 });
var PayerV1Controller_getComplianceStatus_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 404 }, schema: PayerV1Controller_getComplianceStatus_v1_404 });
var PayerV1Controller_getComplianceStatus_v1_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getComplianceStatus_v1", kind: "response", status: 429 }, schema: PayerV1Controller_getComplianceStatus_v1_429 });
var PayerV1Controller_updateComplianceStatus_v1_Request = zod.z.object({ "agreementCompleted": zod.z.boolean() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "request", variant: "application/json" }, schema: PayerV1Controller_updateComplianceStatus_v1_Request });
var PayerV1Controller_updateComplianceStatus_v1_200 = zod.z.object({ "success": zod.z.boolean().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 200 }, schema: PayerV1Controller_updateComplianceStatus_v1_200 });
var PayerV1Controller_updateComplianceStatus_v1_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 400 }, schema: PayerV1Controller_updateComplianceStatus_v1_400 });
var PayerV1Controller_updateComplianceStatus_v1_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 401 }, schema: PayerV1Controller_updateComplianceStatus_v1_401 });
var PayerV1Controller_updateComplianceStatus_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 404 }, schema: PayerV1Controller_updateComplianceStatus_v1_404 });
var PayerV1Controller_updateComplianceStatus_v1_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_updateComplianceStatus_v1", kind: "response", status: 429 }, schema: PayerV1Controller_updateComplianceStatus_v1_429 });
var PayerV1Controller_getPaymentDetails_v1_200 = zod.z.object({ "paymentDetails": zod.z.array(zod.z.object({ "id": zod.z.string().optional(), "userId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "beneficiaryType": zod.z.string().optional(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "currency": zod.z.string().optional(), "status": zod.z.string().optional(), "rails": zod.z.string().optional() }).passthrough()).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 200 }, schema: PayerV1Controller_getPaymentDetails_v1_200 });
var PayerV1Controller_getPaymentDetails_v1_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 401 }, schema: PayerV1Controller_getPaymentDetails_v1_401 });
var PayerV1Controller_getPaymentDetails_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 404 }, schema: PayerV1Controller_getPaymentDetails_v1_404 });
var PayerV1Controller_getPaymentDetails_v1_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_getPaymentDetails_v1", kind: "response", status: 429 }, schema: PayerV1Controller_getPaymentDetails_v1_429 });
var PayerV1Controller_createPaymentDetails_v1_Request = zod.z.object({ "bankName": zod.z.string(), "accountName": zod.z.string(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]), "currency": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string().optional(), "country": zod.z.string(), "dateOfBirth": zod.z.string(), "postalCode": zod.z.string(), "rails": zod.z.enum(["local", "swift", "wire"]).optional(), "sortCode": zod.z.string().optional(), "iban": zod.z.string().optional(), "swiftBic": zod.z.string().optional(), "documentNumber": zod.z.string().optional(), "documentType": zod.z.string().optional(), "accountType": zod.z.enum(["checking", "savings"]).optional(), "ribNumber": zod.z.string().optional(), "bsbNumber": zod.z.string().optional(), "ncc": zod.z.string().optional(), "branchCode": zod.z.string().optional(), "bankCode": zod.z.string().optional(), "ifsc": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "request", variant: "application/json" }, schema: PayerV1Controller_createPaymentDetails_v1_Request });
var PayerV1Controller_createPaymentDetails_v1_201 = zod.z.object({ "payment_detail": zod.z.object({ "id": zod.z.string().optional(), "clientUserId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "currency": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]).optional() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 201 }, schema: PayerV1Controller_createPaymentDetails_v1_201 });
var PayerV1Controller_createPaymentDetails_v1_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 400 }, schema: PayerV1Controller_createPaymentDetails_v1_400 });
var PayerV1Controller_createPaymentDetails_v1_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 401 }, schema: PayerV1Controller_createPaymentDetails_v1_401 });
var PayerV1Controller_createPaymentDetails_v1_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 404 }, schema: PayerV1Controller_createPaymentDetails_v1_404 });
var PayerV1Controller_createPaymentDetails_v1_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV1Controller_createPaymentDetails_v1", kind: "response", status: 429 }, schema: PayerV1Controller_createPaymentDetails_v1_429 });
var PayerV2Controller_getComplianceData_v2_Request = zod.z.object({ "clientUserId": zod.z.string(), "email": zod.z.string(), "firstName": zod.z.string(), "lastName": zod.z.string(), "beneficiaryType": zod.z.enum(["individual", "business"]), "companyName": zod.z.string().optional(), "dateOfBirth": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string(), "postcode": zod.z.string(), "country": zod.z.string(), "nationality": zod.z.string(), "phone": zod.z.string(), "ssn": zod.z.string(), "sourceOfFunds": zod.z.string().optional(), "businessActivity": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "request", variant: "application/json" }, schema: PayerV2Controller_getComplianceData_v2_Request });
var PayerV2Controller_getComplianceData_v2_200 = zod.z.object({ "agreementUrl": zod.z.string().optional(), "kycUrl": zod.z.string().optional(), "status": zod.z.object({ "agreementStatus": zod.z.enum(["not_started", "completed"]), "kycStatus": zod.z.enum(["not_started", "completed"]) }).passthrough(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 200 }, schema: PayerV2Controller_getComplianceData_v2_200 });
var PayerV2Controller_getComplianceData_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 400 }, schema: PayerV2Controller_getComplianceData_v2_400 });
var PayerV2Controller_getComplianceData_v2_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 401 }, schema: PayerV2Controller_getComplianceData_v2_401 });
var PayerV2Controller_getComplianceData_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 404 }, schema: PayerV2Controller_getComplianceData_v2_404 });
var PayerV2Controller_getComplianceData_v2_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 429 }, schema: PayerV2Controller_getComplianceData_v2_429 });
var PayerV2Controller_getComplianceStatus_v2_200 = zod.z.object({ "kycStatus": zod.z.string().optional(), "agreementStatus": zod.z.string().optional(), "isCompliant": zod.z.boolean().optional(), "userId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 200 }, schema: PayerV2Controller_getComplianceStatus_v2_200 });
var PayerV2Controller_getComplianceStatus_v2_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 401 }, schema: PayerV2Controller_getComplianceStatus_v2_401 });
var PayerV2Controller_getComplianceStatus_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 404 }, schema: PayerV2Controller_getComplianceStatus_v2_404 });
var PayerV2Controller_getComplianceStatus_v2_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getComplianceStatus_v2", kind: "response", status: 429 }, schema: PayerV2Controller_getComplianceStatus_v2_429 });
var PayerV2Controller_updateComplianceStatus_v2_Request = zod.z.object({ "agreementCompleted": zod.z.boolean() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "request", variant: "application/json" }, schema: PayerV2Controller_updateComplianceStatus_v2_Request });
var PayerV2Controller_updateComplianceStatus_v2_200 = zod.z.object({ "success": zod.z.boolean().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 200 }, schema: PayerV2Controller_updateComplianceStatus_v2_200 });
var PayerV2Controller_updateComplianceStatus_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 400 }, schema: PayerV2Controller_updateComplianceStatus_v2_400 });
var PayerV2Controller_updateComplianceStatus_v2_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 401 }, schema: PayerV2Controller_updateComplianceStatus_v2_401 });
var PayerV2Controller_updateComplianceStatus_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 404 }, schema: PayerV2Controller_updateComplianceStatus_v2_404 });
var PayerV2Controller_updateComplianceStatus_v2_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_updateComplianceStatus_v2", kind: "response", status: 429 }, schema: PayerV2Controller_updateComplianceStatus_v2_429 });
var PayerV2Controller_getPaymentDetails_v2_200 = zod.z.object({ "paymentDetails": zod.z.array(zod.z.object({ "id": zod.z.string().optional(), "userId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "beneficiaryType": zod.z.string().optional(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "currency": zod.z.string().optional(), "status": zod.z.string().optional(), "rails": zod.z.string().optional() }).passthrough()).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 200 }, schema: PayerV2Controller_getPaymentDetails_v2_200 });
var PayerV2Controller_getPaymentDetails_v2_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 401 }, schema: PayerV2Controller_getPaymentDetails_v2_401 });
var PayerV2Controller_getPaymentDetails_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 404 }, schema: PayerV2Controller_getPaymentDetails_v2_404 });
var PayerV2Controller_getPaymentDetails_v2_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_getPaymentDetails_v2", kind: "response", status: 429 }, schema: PayerV2Controller_getPaymentDetails_v2_429 });
var PayerV2Controller_createPaymentDetails_v2_Request = zod.z.object({ "bankName": zod.z.string(), "accountName": zod.z.string(), "accountNumber": zod.z.string().optional(), "routingNumber": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]), "currency": zod.z.string(), "addressLine1": zod.z.string(), "addressLine2": zod.z.string().optional(), "city": zod.z.string(), "state": zod.z.string().optional(), "country": zod.z.string(), "dateOfBirth": zod.z.string(), "postalCode": zod.z.string(), "rails": zod.z.enum(["local", "swift", "wire"]).optional(), "sortCode": zod.z.string().optional(), "iban": zod.z.string().optional(), "swiftBic": zod.z.string().optional(), "documentNumber": zod.z.string().optional(), "documentType": zod.z.string().optional(), "accountType": zod.z.enum(["checking", "savings"]).optional(), "ribNumber": zod.z.string().optional(), "bsbNumber": zod.z.string().optional(), "ncc": zod.z.string().optional(), "branchCode": zod.z.string().optional(), "bankCode": zod.z.string().optional(), "ifsc": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "request", variant: "application/json" }, schema: PayerV2Controller_createPaymentDetails_v2_Request });
var PayerV2Controller_createPaymentDetails_v2_201 = zod.z.object({ "payment_detail": zod.z.object({ "id": zod.z.string().optional(), "clientUserId": zod.z.string().optional(), "bankName": zod.z.string().optional(), "accountName": zod.z.string().optional(), "currency": zod.z.string().optional(), "beneficiaryType": zod.z.enum(["individual", "business"]).optional() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 201 }, schema: PayerV2Controller_createPaymentDetails_v2_201 });
var PayerV2Controller_createPaymentDetails_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 400 }, schema: PayerV2Controller_createPaymentDetails_v2_400 });
var PayerV2Controller_createPaymentDetails_v2_401 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 401 }, schema: PayerV2Controller_createPaymentDetails_v2_401 });
var PayerV2Controller_createPaymentDetails_v2_404 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 404 }, schema: PayerV2Controller_createPaymentDetails_v2_404 });
var PayerV2Controller_createPaymentDetails_v2_429 = ErrorEnvelopeSchema4;
schemaRegistry.register({ key: { operationId: "PayerV2Controller_createPaymentDetails_v2", kind: "response", status: 429 }, schema: PayerV2Controller_createPaymentDetails_v2_429 });

// src/domains/payer/v2/index.ts
var v2_exports = {};
__export(v2_exports, {
  createPayerV2Api: () => createPayerV2Api
});

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

// src/domains/payments/index.ts
var payments_exports = {};
__export(payments_exports, {
  createPaymentsApi: () => createPaymentsApi
});
var ErrorDetailSchema5 = zod.z.object({
  message: zod.z.string(),
  code: zod.z.string().optional(),
  field: zod.z.string().optional(),
  source: zod.z.object({
    pointer: zod.z.string().optional(),
    parameter: zod.z.string().optional()
  }).passthrough().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema5 = zod.z.object({
  status: zod.z.number().optional(),
  statusCode: zod.z.number().optional(),
  code: zod.z.string().optional(),
  error: zod.z.string().optional(),
  message: zod.z.union([
    zod.z.string(),
    zod.z.array(zod.z.union([zod.z.string(), ErrorDetailSchema5])),
    ErrorDetailSchema5
  ]).optional(),
  detail: zod.z.unknown().optional(),
  errors: zod.z.array(ErrorDetailSchema5).optional(),
  requestId: zod.z.string().optional(),
  correlationId: zod.z.string().optional(),
  retryAfter: zod.z.union([zod.z.number(), zod.z.string()]).optional(),
  retryAfterMs: zod.z.number().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var PaymentV2Controller_searchPayments_v2_200 = zod.z.object({ "payments": zod.z.array(zod.z.object({ "id": zod.z.string(), "amount": zod.z.string(), "sourceNetwork": zod.z.string(), "destinationNetwork": zod.z.string(), "sourceTxHash": zod.z.string().nullable().optional(), "destinationTxHash": zod.z.string().nullable().optional(), "timestamp": zod.z.string(), "type": zod.z.enum(["direct", "conversion", "crosschain", "recurring"]), "conversionRateSource": zod.z.string().nullable().optional(), "conversionRateDestination": zod.z.string().nullable().optional(), "convertedAmountSource": zod.z.string().nullable().optional(), "convertedAmountDestination": zod.z.string().nullable().optional(), "currency": zod.z.string(), "paymentCurrency": zod.z.string(), "fees": zod.z.array(zod.z.object({ "type": zod.z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": zod.z.enum(["sending", "receiving", "proxying", "refunding"]).optional(), "provider": zod.z.string().optional(), "amount": zod.z.string().optional(), "amountInUSD": zod.z.string().optional(), "currency": zod.z.string().optional(), "receiverAddress": zod.z.string().optional(), "network": zod.z.string().optional(), "rateProvider": zod.z.string().optional() }).passthrough()).nullable().optional(), "recurringPaymentId": zod.z.string().nullable().optional(), "rateProvider": zod.z.enum(["lifi", "chainlink", "coingecko", "unknown"]).optional(), "request": zod.z.object({ "requestId": zod.z.string().optional(), "paymentReference": zod.z.string().optional(), "hasBeenPaid": zod.z.boolean().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().nullable().optional(), "reference": zod.z.string().nullable().optional() }).passthrough().optional() }).passthrough()), "pagination": zod.z.object({ "total": zod.z.number(), "limit": zod.z.number(), "offset": zod.z.number(), "hasMore": zod.z.boolean() }).passthrough() }).passthrough();
schemaRegistry.register({ key: { operationId: "PaymentV2Controller_searchPayments_v2", kind: "response", status: 200 }, schema: PaymentV2Controller_searchPayments_v2_200 });
var PaymentV2Controller_searchPayments_v2_400 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "errors": zod.z.array(zod.z.object({ "field": zod.z.string().optional(), "message": zod.z.string().optional() }).passthrough()).optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PaymentV2Controller_searchPayments_v2", kind: "response", status: 400 }, schema: PaymentV2Controller_searchPayments_v2_400 });
var PaymentV2Controller_searchPayments_v2_401 = zod.z.object({ "statusCode": zod.z.number().optional(), "message": zod.z.string().optional(), "error": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "PaymentV2Controller_searchPayments_v2", kind: "response", status: 401 }, schema: PaymentV2Controller_searchPayments_v2_401 });
var PaymentV2Controller_searchPayments_v2_429 = ErrorEnvelopeSchema5;
schemaRegistry.register({ key: { operationId: "PaymentV2Controller_searchPayments_v2", kind: "response", status: 429 }, schema: PaymentV2Controller_searchPayments_v2_429 });

// src/domains/payments/payments.schemas.ts
var OP_SEARCH_PAYMENTS = "PaymentV2Controller_searchPayments_v2";
var AddressSchema = zod.z.object({
  street: zod.z.string().optional(),
  city: zod.z.string().optional(),
  state: zod.z.string().optional(),
  postalCode: zod.z.string().optional(),
  country: zod.z.string().optional()
}).passthrough();
var CustomerInfoSchema = zod.z.object({
  firstName: zod.z.string().optional(),
  lastName: zod.z.string().optional(),
  email: zod.z.string().optional(),
  address: AddressSchema.optional()
}).passthrough();
var FeeSchema = zod.z.object({
  type: zod.z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(),
  stage: zod.z.enum(["sending", "receiving", "proxying", "refunding"]).optional(),
  provider: zod.z.string().optional(),
  amount: zod.z.string().optional(),
  amountInUSD: zod.z.string().optional(),
  currency: zod.z.string().optional(),
  receiverAddress: zod.z.string().optional(),
  network: zod.z.string().optional(),
  rateProvider: zod.z.string().optional()
}).passthrough();
var RequestInfoSchema = zod.z.object({
  requestId: zod.z.string().optional(),
  paymentReference: zod.z.string().optional(),
  hasBeenPaid: zod.z.boolean().optional(),
  customerInfo: CustomerInfoSchema.nullable().optional(),
  reference: zod.z.string().nullable().optional()
}).passthrough();
var PaymentRecordSchema = zod.z.object({
  id: zod.z.string(),
  amount: zod.z.string(),
  sourceNetwork: zod.z.string(),
  destinationNetwork: zod.z.string(),
  sourceTxHash: zod.z.string().nullable().optional(),
  destinationTxHash: zod.z.string().nullable().optional(),
  timestamp: zod.z.string(),
  type: zod.z.enum(["direct", "conversion", "crosschain", "recurring"]),
  conversionRateSource: zod.z.string().nullable().optional(),
  conversionRateDestination: zod.z.string().nullable().optional(),
  convertedAmountSource: zod.z.string().nullable().optional(),
  convertedAmountDestination: zod.z.string().nullable().optional(),
  currency: zod.z.string(),
  paymentCurrency: zod.z.string(),
  fees: zod.z.array(FeeSchema).nullable().optional(),
  recurringPaymentId: zod.z.string().nullable().optional(),
  rateProvider: zod.z.enum(["lifi", "chainlink", "coingecko", "unknown"]).nullable().optional(),
  request: RequestInfoSchema.optional()
}).passthrough();
var PaginationSchema = zod.z.object({
  total: zod.z.number(),
  limit: zod.z.number(),
  offset: zod.z.number(),
  hasMore: zod.z.boolean()
}).passthrough();
var PaymentSearchResponseSchema = zod.z.object({
  payments: zod.z.array(PaymentRecordSchema),
  pagination: PaginationSchema
}).passthrough();
schemaRegistry.register({
  key: { operationId: OP_SEARCH_PAYMENTS, kind: "response", status: 200 },
  schema: PaymentSearchResponseSchema
});

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
function normalizeLegacyStatusResponse(raw) {
  if (raw.hasBeenPaid) {
    return {
      kind: "paid",
      ...buildStatusBase(raw, { hasBeenPaid: true }),
      hasBeenPaid: true
    };
  }
  return {
    kind: "pending",
    ...buildStatusBase(raw, { hasBeenPaid: false }),
    hasBeenPaid: false
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

// src/domains/payments/payments.facade.ts
function createPaymentsApi(http) {
  return {
    async search(query, options) {
      const requestQuery = buildRequestQuery(query ? { ...query } : void 0);
      return requestJson(http, {
        operationId: OP_SEARCH_PAYMENTS,
        method: "GET",
        path: "/v2/payments",
        query: requestQuery,
        schemaKey: { operationId: OP_SEARCH_PAYMENTS, kind: "response", status: 200 },
        description: "Search payments",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    }
  };
}

// src/domains/payouts/index.ts
var payouts_exports = {};
__export(payouts_exports, {
  createPayoutsApi: () => createPayoutsApi
});

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

// src/domains/requests/index.ts
var requests_exports = {};
__export(requests_exports, {
  createRequestsApi: () => createRequestsApi
});

// src/domains/requests/requests.facade.ts
var OP_CREATE2 = "RequestControllerV2_createRequest_v2";
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
        operationId: OP_CREATE2,
        method: "POST",
        path: "/v2/request",
        body,
        requestSchemaKey: { operationId: OP_CREATE2, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE2, kind: "response", status: 201 },
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
var ErrorDetailSchema6 = zod.z.object({
  message: zod.z.string(),
  code: zod.z.string().optional(),
  field: zod.z.string().optional(),
  source: zod.z.object({
    pointer: zod.z.string().optional(),
    parameter: zod.z.string().optional()
  }).passthrough().optional(),
  meta: zod.z.record(zod.z.unknown()).optional()
}).passthrough();
var ErrorEnvelopeSchema6 = zod.z.object({
  status: zod.z.number().optional(),
  statusCode: zod.z.number().optional(),
  code: zod.z.string().optional(),
  error: zod.z.string().optional(),
  message: zod.z.union([
    zod.z.string(),
    zod.z.array(zod.z.union([zod.z.string(), ErrorDetailSchema6])),
    ErrorDetailSchema6
  ]).optional(),
  detail: zod.z.unknown().optional(),
  errors: zod.z.array(ErrorDetailSchema6).optional(),
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
var RequestControllerV1_createRequest_v1_400 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 400 }, schema: RequestControllerV1_createRequest_v1_400 });
var RequestControllerV1_createRequest_v1_401 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 401 }, schema: RequestControllerV1_createRequest_v1_401 });
var RequestControllerV1_createRequest_v1_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 404 }, schema: RequestControllerV1_createRequest_v1_404 });
var RequestControllerV1_createRequest_v1_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_createRequest_v1", kind: "response", status: 429 }, schema: RequestControllerV1_createRequest_v1_429 });
var RequestControllerV1_getRequestStatus_v1_200 = zod.z.object({ "hasBeenPaid": zod.z.boolean().optional(), "paymentReference": zod.z.string().optional(), "requestId": zod.z.string().optional(), "isListening": zod.z.boolean().optional(), "txHash": zod.z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getRequestStatus_v1_200 });
var RequestControllerV1_getRequestStatus_v1_401 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getRequestStatus_v1_401 });
var RequestControllerV1_getRequestStatus_v1_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getRequestStatus_v1_404 });
var RequestControllerV1_getRequestStatus_v1_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestStatus_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getRequestStatus_v1_429 });
var RequestControllerV1_stopRecurrenceRequest_v1_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 200 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_200 });
var RequestControllerV1_stopRecurrenceRequest_v1_401 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 401 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_401 });
var RequestControllerV1_stopRecurrenceRequest_v1_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 404 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_404 });
var RequestControllerV1_stopRecurrenceRequest_v1_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_stopRecurrenceRequest_v1", kind: "response", status: 429 }, schema: RequestControllerV1_stopRecurrenceRequest_v1_429 });
var RequestControllerV1_getPaymentCalldata_v1_200 = zod.z.union([zod.z.object({ "transactions": zod.z.array(zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]).optional(), "hex": zod.z.string().optional() }).passthrough() }).passthrough()), "metadata": zod.z.object({ "stepsRequired": zod.z.number(), "needsApproval": zod.z.boolean(), "approvalTransactionIndex": zod.z.number().nullable().optional(), "hasEnoughBalance": zod.z.boolean(), "hasEnoughGas": zod.z.boolean() }).passthrough() }).passthrough(), zod.z.object({ "paymentIntentId": zod.z.string(), "paymentIntent": zod.z.string(), "approvalPermitPayload": zod.z.string().nullable().optional(), "approvalCalldata": zod.z.object({ "to": zod.z.string().optional(), "data": zod.z.string().optional(), "value": zod.z.string().optional() }).passthrough().nullable().optional(), "metadata": zod.z.object({ "supportsEIP2612": zod.z.boolean() }).passthrough() }).passthrough()]);
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getPaymentCalldata_v1_200 });
var RequestControllerV1_getPaymentCalldata_v1_400 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 400 }, schema: RequestControllerV1_getPaymentCalldata_v1_400 });
var RequestControllerV1_getPaymentCalldata_v1_401 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getPaymentCalldata_v1_401 });
var RequestControllerV1_getPaymentCalldata_v1_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getPaymentCalldata_v1_404 });
var RequestControllerV1_getPaymentCalldata_v1_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getPaymentCalldata_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getPaymentCalldata_v1_429 });
var RequestControllerV1_getRequestPaymentRoutes_v1_200 = zod.z.object({ "routes": zod.z.array(zod.z.object({ "id": zod.z.string(), "fee": zod.z.number(), "feeBreakdown": zod.z.array(zod.z.object({ "type": zod.z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": zod.z.enum(["sending", "receiving", "proxying", "refunding", "overall"]).optional(), "provider": zod.z.string().optional(), "amount": zod.z.string().optional(), "amountInUSD": zod.z.string().optional(), "currency": zod.z.string().optional(), "receiverAddress": zod.z.string().optional(), "network": zod.z.string().optional(), "rateProvider": zod.z.string().optional() }).passthrough()).optional(), "speed": zod.z.union([zod.z.string(), zod.z.number()]), "price_impact": zod.z.number().optional(), "chain": zod.z.string(), "token": zod.z.string() }).passthrough()) }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 200 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_200 });
var RequestControllerV1_getRequestPaymentRoutes_v1_400 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 400 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_400 });
var RequestControllerV1_getRequestPaymentRoutes_v1_401 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 401 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_401 });
var RequestControllerV1_getRequestPaymentRoutes_v1_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 404 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_404 });
var RequestControllerV1_getRequestPaymentRoutes_v1_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_getRequestPaymentRoutes_v1", kind: "response", status: 429 }, schema: RequestControllerV1_getRequestPaymentRoutes_v1_429 });
var RequestControllerV1_sendPaymentIntent_v1_Request = zod.z.object({ "signedPaymentIntent": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough(), "signedApprovalPermit": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "request", variant: "application/json" }, schema: RequestControllerV1_sendPaymentIntent_v1_Request });
var RequestControllerV1_sendPaymentIntent_v1_401 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 401 }, schema: RequestControllerV1_sendPaymentIntent_v1_401 });
var RequestControllerV1_sendPaymentIntent_v1_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 404 }, schema: RequestControllerV1_sendPaymentIntent_v1_404 });
var RequestControllerV1_sendPaymentIntent_v1_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV1_sendPaymentIntent_v1", kind: "response", status: 429 }, schema: RequestControllerV1_sendPaymentIntent_v1_429 });
var RequestControllerV2_createRequest_v2_Request = zod.z.object({ "payer": zod.z.string().optional(), "payee": zod.z.string().optional(), "amount": zod.z.string(), "invoiceCurrency": zod.z.string(), "paymentCurrency": zod.z.string(), "recurrence": zod.z.object({ "startDate": zod.z.string(), "frequency": zod.z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) }).passthrough().optional(), "isCryptoToFiatAvailable": zod.z.boolean().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().optional(), "reference": zod.z.string().optional(), "originalRequestId": zod.z.string().optional(), "originalRequestPaymentReference": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "request", variant: "application/json" }, schema: RequestControllerV2_createRequest_v2_Request });
var RequestControllerV2_createRequest_v2_201 = zod.z.object({ "paymentReference": zod.z.string().optional(), "requestId": zod.z.string().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 201 }, schema: RequestControllerV2_createRequest_v2_201 });
var RequestControllerV2_createRequest_v2_400 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 400 }, schema: RequestControllerV2_createRequest_v2_400 });
var RequestControllerV2_createRequest_v2_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 404 }, schema: RequestControllerV2_createRequest_v2_404 });
var RequestControllerV2_createRequest_v2_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_createRequest_v2", kind: "response", status: 429 }, schema: RequestControllerV2_createRequest_v2_429 });
var RequestControllerV2_getRequestStatus_v2_200 = zod.z.object({ "hasBeenPaid": zod.z.boolean().optional(), "paymentReference": zod.z.string().optional(), "requestId": zod.z.string().optional(), "isListening": zod.z.boolean().optional(), "txHash": zod.z.string().nullable().optional(), "recurrence": zod.z.object({}).passthrough().optional(), "originalRequestId": zod.z.string().optional(), "status": zod.z.string().optional(), "isCryptoToFiatAvailable": zod.z.boolean().optional(), "originalRequestPaymentReference": zod.z.string().optional(), "payments": zod.z.array(zod.z.object({}).passthrough()).optional(), "isRecurrenceStopped": zod.z.boolean().optional(), "customerInfo": zod.z.object({ "firstName": zod.z.string().optional(), "lastName": zod.z.string().optional(), "email": zod.z.string().optional(), "address": zod.z.object({ "street": zod.z.string().optional(), "city": zod.z.string().optional(), "state": zod.z.string().optional(), "postalCode": zod.z.string().optional(), "country": zod.z.string().optional() }).passthrough().optional() }).passthrough().nullable().optional(), "reference": zod.z.string().nullable().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getRequestStatus_v2_200 });
var RequestControllerV2_getRequestStatus_v2_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getRequestStatus_v2_404 });
var RequestControllerV2_getRequestStatus_v2_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getRequestStatus_v2_429 });
var RequestControllerV2_updateRequest_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 200 }, schema: RequestControllerV2_updateRequest_v2_200 });
var RequestControllerV2_updateRequest_v2_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 404 }, schema: RequestControllerV2_updateRequest_v2_404 });
var RequestControllerV2_updateRequest_v2_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_updateRequest_v2", kind: "response", status: 429 }, schema: RequestControllerV2_updateRequest_v2_429 });
var RequestControllerV2_getPaymentCalldata_v2_200 = zod.z.union([zod.z.object({ "transactions": zod.z.array(zod.z.object({ "data": zod.z.string(), "to": zod.z.string(), "value": zod.z.object({ "type": zod.z.enum(["BigNumber"]).optional(), "hex": zod.z.string().optional() }).passthrough() }).passthrough()), "metadata": zod.z.object({ "stepsRequired": zod.z.number(), "needsApproval": zod.z.boolean(), "approvalTransactionIndex": zod.z.number().nullable().optional(), "hasEnoughBalance": zod.z.boolean(), "hasEnoughGas": zod.z.boolean() }).passthrough() }).passthrough(), zod.z.object({ "paymentIntentId": zod.z.string(), "paymentIntent": zod.z.string(), "approvalPermitPayload": zod.z.string().nullable().optional(), "approvalCalldata": zod.z.object({ "to": zod.z.string().optional(), "data": zod.z.string().optional(), "value": zod.z.string().optional() }).passthrough().nullable().optional(), "metadata": zod.z.object({ "supportsEIP2612": zod.z.boolean() }).passthrough() }).passthrough()]);
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getPaymentCalldata_v2_200 });
var RequestControllerV2_getPaymentCalldata_v2_400 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 400 }, schema: RequestControllerV2_getPaymentCalldata_v2_400 });
var RequestControllerV2_getPaymentCalldata_v2_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getPaymentCalldata_v2_404 });
var RequestControllerV2_getPaymentCalldata_v2_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getPaymentCalldata_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getPaymentCalldata_v2_429 });
var RequestControllerV2_getRequestPaymentRoutes_v2_200 = zod.z.object({ "routes": zod.z.array(zod.z.object({ "id": zod.z.string(), "fee": zod.z.number(), "feeBreakdown": zod.z.array(zod.z.object({ "type": zod.z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(), "stage": zod.z.enum(["sending", "receiving", "proxying", "refunding", "overall"]).optional(), "provider": zod.z.string().optional(), "amount": zod.z.string().optional(), "amountInUSD": zod.z.string().optional(), "currency": zod.z.string().optional(), "receiverAddress": zod.z.string().optional(), "network": zod.z.string().optional(), "rateProvider": zod.z.string().optional() }).passthrough()).optional(), "speed": zod.z.union([zod.z.string(), zod.z.number()]), "price_impact": zod.z.number().optional(), "chain": zod.z.string(), "token": zod.z.string() }).passthrough()) }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 200 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_200 });
var RequestControllerV2_getRequestPaymentRoutes_v2_400 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 400 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_400 });
var RequestControllerV2_getRequestPaymentRoutes_v2_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 404 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_404 });
var RequestControllerV2_getRequestPaymentRoutes_v2_429 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 429 }, schema: RequestControllerV2_getRequestPaymentRoutes_v2_429 });
var RequestControllerV2_sendPaymentIntent_v2_Request = zod.z.object({ "signedPaymentIntent": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough(), "signedApprovalPermit": zod.z.object({ "signature": zod.z.string(), "nonce": zod.z.string(), "deadline": zod.z.string() }).passthrough().optional() }).passthrough();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "request", variant: "application/json" }, schema: RequestControllerV2_sendPaymentIntent_v2_Request });
var RequestControllerV2_sendPaymentIntent_v2_200 = zod.z.unknown();
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 200 }, schema: RequestControllerV2_sendPaymentIntent_v2_200 });
var RequestControllerV2_sendPaymentIntent_v2_404 = ErrorEnvelopeSchema6;
schemaRegistry.register({ key: { operationId: "RequestControllerV2_sendPaymentIntent_v2", kind: "response", status: 404 }, schema: RequestControllerV2_sendPaymentIntent_v2_404 });
var RequestControllerV2_sendPaymentIntent_v2_429 = ErrorEnvelopeSchema6;
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

// src/request.client.ts
function createRequestClient(options) {
  const http = createHttpClient(options);
  return {
    http,
    currencies: createCurrenciesApi(http),
    clientIds: createClientIdsApi(http),
    requests: createRequestsApi(http),
    payouts: createPayoutsApi(http),
    payments: createPaymentsApi(http),
    payer: createPayerApi(http),
    pay: createPayApi(http)
  };
}
function createRequestClientFromEnv(options) {
  const env = options?.env ?? process.env;
  const baseUrl = env.REQUEST_API_URL ?? env.REQUEST_SDK_BASE_URL;
  const apiKey = env.REQUEST_API_KEY ?? env.REQUEST_SDK_API_KEY;
  const clientId = env.REQUEST_CLIENT_ID ?? env.REQUEST_SDK_CLIENT_ID;
  return createRequestClient({ baseUrl, apiKey, clientId });
}

// src/core/config/request-environment.config.ts
var RequestEnvironment = {
  production: "https://api.request.network",
  // Legacy placeholder for partner-managed sandboxes; Request does not operate a public staging host.
  staging: "https://api.stage.request.network",
  local: "http://127.0.0.1:8080"
};

// src/domains/requests/v1/index.ts
var v1_exports4 = {};
__export(v1_exports4, {
  createRequestsV1Api: () => createRequestsV1Api
});

// src/domains/requests/v1/requests.v1.facade.ts
var OP_CREATE3 = "RequestControllerV1_createRequest_v1";
var OP_PAYMENT_ROUTES2 = "RequestControllerV1_getRequestPaymentRoutes_v1";
var OP_PAYMENT_CALLDATA2 = "RequestControllerV1_getPaymentCalldata_v1";
var OP_REQUEST_STATUS2 = "RequestControllerV1_getRequestStatus_v1";
var OP_SEND_PAYMENT_INTENT2 = "RequestControllerV1_sendPaymentIntent_v1";
var OP_STOP_RECURRENCE = "RequestControllerV1_stopRecurrenceRequest_v1";
var KIND_CALLDATA2 = "calldata";
var KIND_PAYMENT_INTENT2 = "paymentIntent";
function isPaymentIntentPayload2(payload) {
  return "paymentIntentId" in payload;
}
function isCalldataPayload2(payload) {
  return "transactions" in payload;
}
function createRequestsV1Api(http) {
  return {
    async create(body, options) {
      return requestJson(http, {
        operationId: OP_CREATE3,
        method: "POST",
        path: "/v1/request",
        body,
        requestSchemaKey: { operationId: OP_CREATE3, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP_CREATE3, kind: "response", status: 201 },
        description: "Create legacy request",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async getPaymentRoutes(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}/routes`;
      return requestJson(http, {
        operationId: OP_PAYMENT_ROUTES2,
        method: "GET",
        path,
        query: buildRequestQuery({
          wallet: options.wallet,
          amount: options.amount,
          feePercentage: options.feePercentage,
          feeAddress: options.feeAddress
        }),
        schemaKey: { operationId: OP_PAYMENT_ROUTES2, kind: "response", status: 200 },
        description: "Legacy payment routes",
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        validation: options.validation,
        meta: options.meta
      });
    },
    async getPaymentCalldata(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}/pay`;
      const query = buildRequestQuery({
        wallet: options?.wallet,
        chain: options?.chain,
        token: options?.token,
        amount: options?.amount
      });
      const raw = await requestJson(http, {
        operationId: OP_PAYMENT_CALLDATA2,
        method: "GET",
        path,
        query,
        schemaKey: { operationId: OP_PAYMENT_CALLDATA2, kind: "response", status: 200 },
        description: "Legacy payment calldata",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
      if (isCalldataPayload2(raw)) {
        return { kind: KIND_CALLDATA2, ...raw };
      }
      if (isPaymentIntentPayload2(raw)) {
        return { kind: KIND_PAYMENT_INTENT2, ...raw };
      }
      throw new ValidationError("Unexpected payment calldata response", raw);
    },
    async getRequestStatus(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}`;
      const rawStatus = await requestJson(http, {
        operationId: OP_REQUEST_STATUS2,
        method: "GET",
        path,
        schemaKey: { operationId: OP_REQUEST_STATUS2, kind: "response", status: 200 },
        description: "Legacy request status",
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
      return normalizeLegacyStatusResponse(rawStatus);
    },
    async sendPaymentIntent(paymentIntentId, body, options) {
      const path = `/v1/request/${encodeURIComponent(paymentIntentId)}/send`;
      await requestVoid(http, {
        operationId: OP_SEND_PAYMENT_INTENT2,
        method: "POST",
        path,
        body,
        requestSchemaKey: { operationId: OP_SEND_PAYMENT_INTENT2, kind: "request", variant: "application/json" },
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    },
    async stopRecurrence(paymentReference, options) {
      const path = `/v1/request/${encodeURIComponent(paymentReference)}/stop-recurrence`;
      await requestVoid(http, {
        operationId: OP_STOP_RECURRENCE,
        method: "PATCH",
        path,
        signal: options?.signal,
        timeoutMs: options?.timeoutMs,
        validation: options?.validation,
        meta: options?.meta
      });
    }
  };
}

// src/webhooks/index.ts
var webhooks_exports = {};
__export(webhooks_exports, {
  DEFAULT_SIGNATURE_ALGORITHM: () => DEFAULT_SIGNATURE_ALGORITHM,
  DEFAULT_SIGNATURE_HEADER: () => DEFAULT_SIGNATURE_HEADER,
  RequestWebhookSignatureError: () => RequestWebhookSignatureError,
  WEBHOOK_EVENT_NAMES: () => WEBHOOK_EVENT_NAMES,
  WebhookDispatcher: () => WebhookDispatcher,
  createWebhookDispatcher: () => createWebhookDispatcher,
  createWebhookMiddleware: () => createWebhookMiddleware,
  events: () => events_exports,
  getWebhookSchema: () => getWebhookSchema,
  isRequestWebhookSignatureError: () => isRequestWebhookSignatureError,
  parseWebhookEvent: () => parseWebhookEvent,
  testing: () => testing_webhook_exports,
  verifyWebhookSignature: () => verifyWebhookSignature
});

// src/webhooks/errors.webhook.ts
var RequestWebhookSignatureError = class _RequestWebhookSignatureError extends Error {
  static code = "ERR_REQUEST_WEBHOOK_SIGNATURE_VERIFICATION_FAILED";
  code = _RequestWebhookSignatureError.code;
  statusCode = 401;
  headerName;
  signature;
  timestamp;
  reason;
  constructor(message, options) {
    const { headerName, signature, timestamp, reason, cause } = options;
    super(message, { cause });
    this.name = "RequestWebhookSignatureError";
    this.headerName = headerName;
    this.signature = signature;
    this.timestamp = timestamp ?? null;
    this.reason = reason;
  }
};
function isRequestWebhookSignatureError(error) {
  return error instanceof RequestWebhookSignatureError;
}

// src/webhooks/headers.webhook.ts
function coerceHeaderValue(value) {
  if (value == null) return void 0;
  if (Array.isArray(value)) {
    const first = value.find((item) => item.length > 0);
    return first ?? void 0;
  }
  return typeof value === "string" ? value : String(value);
}
function isFetchHeaders(input) {
  return typeof Headers !== "undefined" && input instanceof Headers;
}
function normaliseHeaders2(headers) {
  const result = {};
  if (!headers) return result;
  if (isFetchHeaders(headers)) {
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }
  for (const [key, value] of Object.entries(headers)) {
    const coerced = coerceHeaderValue(value);
    if (coerced != null) {
      result[key.toLowerCase()] = coerced;
    }
  }
  return result;
}
function pickHeader(headers, headerName) {
  if (!headers) return void 0;
  const lower = headerName.toLowerCase();
  if (isFetchHeaders(headers)) {
    const value = headers.get(headerName);
    return value ?? void 0;
  }
  const record = headers;
  const direct = record[headerName];
  if (typeof direct === "string") {
    return direct;
  }
  if (direct != null) {
    const coercedDirect = coerceHeaderValue(direct);
    if (coercedDirect) return coercedDirect;
  }
  const fallback = record[lower];
  if (typeof fallback === "string") {
    return fallback;
  }
  if (fallback != null) {
    return coerceHeaderValue(fallback);
  }
  return void 0;
}

// src/webhooks/signature.webhook.ts
var DEFAULT_SIGNATURE_HEADER = "x-request-network-signature";
var DEFAULT_SIGNATURE_ALGORITHM = "sha256";
var HEX_SIGNATURE_PATTERN = /^[0-9a-f]+$/i;
function toBuffer(rawBody) {
  if (typeof rawBody === "string") {
    return buffer.Buffer.from(rawBody, "utf8");
  }
  if (rawBody instanceof ArrayBuffer) {
    return buffer.Buffer.from(rawBody);
  }
  return buffer.Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
}
function stripAlgorithmPrefix(signature, headerName) {
  const trimmed = signature.trim();
  const equalityIndex = trimmed.indexOf("=");
  if (equalityIndex === -1) {
    return trimmed;
  }
  const prefix = trimmed.slice(0, equalityIndex).toLowerCase();
  if (prefix !== DEFAULT_SIGNATURE_ALGORITHM) {
    throw new RequestWebhookSignatureError("Unsupported signature algorithm", {
      headerName,
      signature,
      timestamp: null,
      reason: "invalid_format"
    });
  }
  return trimmed.slice(equalityIndex + 1);
}
function parseSignatureValue(signature, headerName) {
  const stripped = stripAlgorithmPrefix(signature, headerName);
  const trimmed = stripped.trim();
  if (!trimmed || !HEX_SIGNATURE_PATTERN.test(trimmed)) {
    throw new RequestWebhookSignatureError("Invalid webhook signature format", {
      headerName,
      signature,
      timestamp: null,
      reason: "invalid_format"
    });
  }
  const lower = trimmed.toLowerCase();
  if (lower.length % 2 !== 0) {
    throw new RequestWebhookSignatureError("Invalid webhook signature length", {
      headerName,
      signature,
      timestamp: null,
      reason: "invalid_format"
    });
  }
  const digest = buffer.Buffer.from(lower, "hex");
  return { normalisedHex: lower, buffer: digest };
}
function computeHmac(secret, body) {
  return crypto.createHmac(DEFAULT_SIGNATURE_ALGORITHM, secret).update(body).digest();
}
function isReadonlyStringArray(value) {
  return Array.isArray(value);
}
function toSecretArray(secret) {
  return isReadonlyStringArray(secret) ? [...secret] : [secret];
}
function parseTimestamp(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    if (numeric > 1e12) {
      return Math.trunc(numeric);
    }
    if (numeric > 1e9) {
      return Math.trunc(numeric);
    }
    return Math.trunc(numeric * 1e3);
  }
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}
function resolveTimestamp(options, headers, headerName) {
  if (typeof options.timestamp === "number") {
    return options.timestamp;
  }
  if (!options.timestampHeader) {
    return null;
  }
  const headerValue = pickHeader(headers, options.timestampHeader);
  if (!headerValue) {
    return null;
  }
  const parsed = parseTimestamp(headerValue);
  if (parsed == null) {
    throw new RequestWebhookSignatureError("Invalid webhook timestamp header", {
      headerName: options.timestampHeader,
      signature: pickHeader(headers, headerName) ?? null,
      timestamp: null,
      reason: "invalid_format"
    });
  }
  return parsed;
}
function verifyWebhookSignature(options) {
  const {
    rawBody,
    secret,
    headers: rawHeaders,
    signature: explicitSignature,
    headerName = DEFAULT_SIGNATURE_HEADER,
    toleranceMs,
    now = () => Date.now()
  } = options;
  const headers = normaliseHeaders2(rawHeaders);
  const signatureValue = explicitSignature ?? pickHeader(headers, headerName);
  if (!signatureValue) {
    throw new RequestWebhookSignatureError(`Missing webhook signature header: ${headerName}`, {
      headerName,
      signature: null,
      timestamp: null,
      reason: "missing_signature"
    });
  }
  const { normalisedHex, buffer: signatureBuffer } = parseSignatureValue(signatureValue, headerName);
  const timestamp = resolveTimestamp(options, headers, headerName);
  if (typeof toleranceMs === "number" && toleranceMs >= 0 && timestamp != null) {
    const distance = Math.abs(now() - timestamp);
    if (distance > toleranceMs) {
      throw new RequestWebhookSignatureError("Webhook signature timestamp outside tolerance", {
        headerName,
        signature: normalisedHex,
        timestamp,
        reason: "tolerance_exceeded"
      });
    }
  }
  const bodyBuffer = toBuffer(rawBody);
  const secrets = toSecretArray(secret);
  if (secrets.length === 0) {
    throw new RequestWebhookSignatureError("No webhook secrets configured", {
      headerName,
      signature: normalisedHex,
      timestamp,
      reason: "invalid_signature"
    });
  }
  const digests = secrets.map((candidate) => computeHmac(candidate, bodyBuffer));
  const digestLength = digests[0].length;
  if (signatureBuffer.length !== digestLength) {
    throw new RequestWebhookSignatureError("Webhook signature length mismatch", {
      headerName,
      signature: normalisedHex,
      timestamp,
      reason: "invalid_format"
    });
  }
  for (let index = 0; index < digests.length; index += 1) {
    const digest = digests[index];
    if (crypto.timingSafeEqual(signatureBuffer, digest)) {
      return {
        signature: normalisedHex,
        matchedSecret: secrets[index],
        timestamp: timestamp ?? null,
        headers
      };
    }
  }
  throw new RequestWebhookSignatureError("Invalid webhook signature", {
    headerName,
    signature: normalisedHex,
    timestamp,
    reason: "invalid_signature"
  });
}
var COMPLIANCE_KYC_STATUSES = [
  "not_started",
  "initiated",
  "pending",
  "approved",
  "rejected",
  "failed",
  "completed"
];
var COMPLIANCE_AGREEMENT_STATUSES = [
  "not_started",
  "pending",
  "completed",
  "rejected",
  "failed",
  "signed"
];
var PAYMENT_FAILED_SUB_STATUSES = ["failed", "bounced", "insufficient_funds"];
var PAYMENT_PROCESSING_SUB_STATUSES = [
  "initiated",
  "pending_internal_assessment",
  "ongoing_checks",
  "sending_fiat",
  "fiat_sent",
  "bounced",
  "retry_required",
  "processing"
];
var PAYMENT_DETAIL_STATUSES = ["approved", "failed", "pending", "verified"];
var webhookBaseSchema = zod.z.object({
  event: zod.z.string()
}).passthrough();
var paymentConfirmedSchema = webhookBaseSchema.extend({
  event: zod.z.literal("payment.confirmed")
});
var paymentFailedSchema = webhookBaseSchema.extend({
  event: zod.z.literal("payment.failed"),
  subStatus: zod.z.enum(PAYMENT_FAILED_SUB_STATUSES).optional(),
  failureReason: zod.z.string().optional(),
  retryAfter: zod.z.string().optional()
});
var paymentProcessingSchema = webhookBaseSchema.extend({
  event: zod.z.literal("payment.processing"),
  subStatus: zod.z.enum(PAYMENT_PROCESSING_SUB_STATUSES)
});
var paymentDetailUpdatedSchema = webhookBaseSchema.extend({
  event: zod.z.literal("payment_detail.updated"),
  status: zod.z.enum(PAYMENT_DETAIL_STATUSES),
  paymentDetailsId: zod.z.string().optional(),
  paymentAccountId: zod.z.string().optional(),
  rejectionMessage: zod.z.string().optional()
});
var complianceUpdatedSchema = webhookBaseSchema.extend({
  event: zod.z.literal("compliance.updated"),
  kycStatus: zod.z.enum(COMPLIANCE_KYC_STATUSES).optional(),
  agreementStatus: zod.z.enum(COMPLIANCE_AGREEMENT_STATUSES).optional(),
  isCompliant: zod.z.boolean().optional()
});
var paymentPartialSchema = webhookBaseSchema.extend({
  event: zod.z.literal("payment.partial")
});
var paymentRefundedSchema = webhookBaseSchema.extend({
  event: zod.z.literal("payment.refunded"),
  refundedTo: zod.z.string(),
  refundAmount: zod.z.string()
});
var requestRecurringSchema = webhookBaseSchema.extend({
  event: zod.z.literal("request.recurring"),
  originalRequestId: zod.z.string(),
  originalRequestPaymentReference: zod.z.string()
});
var webhookEventSchemas = {
  "payment.confirmed": paymentConfirmedSchema,
  "payment.failed": paymentFailedSchema,
  "payment.processing": paymentProcessingSchema,
  "payment_detail.updated": paymentDetailUpdatedSchema,
  "compliance.updated": complianceUpdatedSchema,
  "payment.partial": paymentPartialSchema,
  "payment.refunded": paymentRefundedSchema,
  "request.recurring": requestRecurringSchema
};
var WEBHOOK_EVENT_NAMES = Object.freeze(Object.keys(webhookEventSchemas));
for (const [eventName, schema] of Object.entries(webhookEventSchemas)) {
  schemaRegistry.register({
    key: { operationId: eventName, kind: "webhook" },
    schema
  });
}
function getWebhookSchema(event) {
  return webhookEventSchemas[event];
}

// src/webhooks/parser.webhook.ts
function ensureBuffer(rawBody) {
  if (typeof rawBody === "string") {
    return buffer.Buffer.from(rawBody, "utf8");
  }
  if (rawBody instanceof ArrayBuffer) {
    return buffer.Buffer.from(rawBody);
  }
  return buffer.Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
}
function normaliseBody(rawBody) {
  const buffer = ensureBuffer(rawBody);
  const view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  return { buffer, view };
}
function parseJsonBody(buffer) {
  try {
    const text = buffer.toString("utf8");
    return JSON.parse(text);
  } catch (error) {
    throw new ValidationError("Invalid webhook JSON payload", error);
  }
}
function resolveEventName(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Webhook payload must be a JSON object");
  }
  const candidate = body.event;
  if (typeof candidate !== "string" || candidate.length === 0) {
    throw new ValidationError("Webhook payload missing `event` field");
  }
  return candidate;
}
function assertWebhookEventName(name) {
  if (!WEBHOOK_EVENT_NAMES.includes(name)) {
    throw new ValidationError(`Unknown webhook event: ${name}`);
  }
}
function verifySignatureIfRequired(options, buffer, headers) {
  if (options.skipSignatureVerification) {
    return null;
  }
  return verifyWebhookSignature({
    rawBody: buffer,
    secret: options.secret,
    headers,
    signature: options.signature,
    headerName: options.headerName,
    toleranceMs: options.toleranceMs,
    timestampHeader: options.timestampHeader,
    now: options.now
  });
}
function parseWebhookEvent(options) {
  const { buffer, view } = normaliseBody(options.rawBody);
  const headers = options.skipSignatureVerification ? normaliseHeaders2(options.headers) : void 0;
  const verification = verifySignatureIfRequired(options, buffer, options.headers);
  const normalisedHeaders = verification?.headers ?? headers ?? normaliseHeaders2(options.headers);
  const signature = verification?.signature ?? options.signature ?? pickHeader(normalisedHeaders, options.headerName ?? DEFAULT_SIGNATURE_HEADER) ?? null;
  const matchedSecret = verification?.matchedSecret ?? null;
  const timestamp = verification?.timestamp ?? null;
  const jsonBody = parseJsonBody(buffer);
  const eventName = resolveEventName(jsonBody);
  assertWebhookEventName(eventName);
  const schema = getWebhookSchema(eventName);
  if (!schema) {
    throw new ValidationError(`No schema registered for webhook event ${eventName}`);
  }
  const parsed = parseWithSchema({
    schema,
    value: jsonBody,
    description: `Webhook event ${eventName}`
  });
  if (!parsed.success || !parsed.data) {
    const cause = parsed.error instanceof Error ? parsed.error : new ValidationError(`Invalid payload for webhook event ${eventName}`, parsed.error);
    throw cause;
  }
  const typedEventName = eventName;
  const payload = parsed.data;
  return {
    event: typedEventName,
    payload,
    signature,
    matchedSecret,
    timestamp,
    rawBody: view,
    headers: normalisedHeaders
  };
}

// src/webhooks/dispatcher.webhook.ts
function ensureHandlerSet(store, event) {
  let set = store.get(event);
  if (!set) {
    set = /* @__PURE__ */ new Set();
    store.set(event, set);
  }
  return set;
}
var WebhookDispatcher = class {
  handlers = /* @__PURE__ */ new Map();
  on(event, handler) {
    const set = ensureHandlerSet(this.handlers, event);
    const wrapped = handler;
    set.add(wrapped);
    return () => {
      const existing = this.handlers.get(event);
      if (!existing) return;
      existing.delete(wrapped);
      if (existing.size === 0) {
        this.handlers.delete(event);
      }
    };
  }
  once(event, handler) {
    const disposeRef = {};
    const wrapped = async (evt, context) => {
      disposeRef.dispose?.();
      await handler(evt, context);
    };
    const dispose = this.on(event, wrapped);
    disposeRef.dispose = dispose;
    return dispose;
  }
  off(event, handler) {
    const set = this.handlers.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.handlers.delete(event);
    }
  }
  clear() {
    this.handlers.clear();
  }
  handlerCount(event) {
    if (event) {
      return this.handlers.get(event)?.size ?? 0;
    }
    let total = 0;
    for (const set of this.handlers.values()) {
      total += set.size;
    }
    return total;
  }
  async dispatch(event, context = {}) {
    const set = this.handlers.get(event.event);
    if (!set || set.size === 0) {
      return;
    }
    const handlers = Array.from(set);
    for (const handler of handlers) {
      await handler(event, context);
    }
  }
  /**
   * Syntactic sugar for strongly typed handler registration that returns the original handler for chaining.
   */
  register(event, handler) {
    this.on(event, handler);
    return handler;
  }
};
function createWebhookDispatcher() {
  return new WebhookDispatcher();
}

// src/webhooks/testing.webhook.ts
var testing_webhook_exports = {};
__export(testing_webhook_exports, {
  DEFAULT_TEST_WEBHOOK_SECRET: () => DEFAULT_TEST_WEBHOOK_SECRET,
  createMockWebhookRequest: () => createMockWebhookRequest,
  createMockWebhookResponse: () => createMockWebhookResponse,
  generateTestWebhookSignature: () => generateTestWebhookSignature,
  isWebhookVerificationBypassed: () => isWebhookVerificationBypassed,
  setWebhookVerificationBypass: () => setWebhookVerificationBypass,
  withWebhookVerificationDisabled: () => withWebhookVerificationDisabled
});
var DEFAULT_TEST_WEBHOOK_SECRET = "whsec_test_secret";
var inMemoryBypass = false;
function toBuffer2(body) {
  if (typeof body === "string") {
    return buffer.Buffer.from(body, "utf8");
  }
  if (body instanceof ArrayBuffer) {
    return buffer.Buffer.from(body);
  }
  if (ArrayBuffer.isView(body)) {
    const view = body;
    return buffer.Buffer.from(view.buffer, view.byteOffset, view.byteLength);
  }
  return buffer.Buffer.from(JSON.stringify(body));
}
function generateTestWebhookSignature(rawBody, secret = DEFAULT_TEST_WEBHOOK_SECRET) {
  const buffer = toBuffer2(rawBody);
  return crypto.createHmac(DEFAULT_SIGNATURE_ALGORITHM, secret).update(buffer).digest("hex");
}
function isWebhookVerificationBypassed() {
  if (typeof process !== "undefined" && process.env.REQUEST_WEBHOOK_DISABLE_VERIFICATION === "true") {
    return true;
  }
  return inMemoryBypass;
}
function setWebhookVerificationBypass(enabled) {
  inMemoryBypass = enabled;
}
async function withWebhookVerificationDisabled(fn) {
  const previous = inMemoryBypass;
  inMemoryBypass = true;
  try {
    return await fn();
  } finally {
    inMemoryBypass = previous;
  }
}
function createMockWebhookRequest(options) {
  const { payload, secret = DEFAULT_TEST_WEBHOOK_SECRET, headerName = DEFAULT_SIGNATURE_HEADER, headers } = options;
  const rawBody = toBuffer2(payload);
  const signature = generateTestWebhookSignature(rawBody, secret);
  const req = {
    headers: {
      ...headers ?? {},
      [headerName]: signature
    },
    rawBody,
    body: rawBody
  };
  return req;
}
function createMockWebhookResponse() {
  return {
    statusCode: 200,
    body: void 0,
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.headersSent = true;
      return this;
    },
    send(payload) {
      this.body = payload;
      this.headersSent = true;
      return this;
    }
  };
}

// src/webhooks/middleware.webhook.ts
var DEFAULT_ATTACH_PROPERTY = "webhook";
function isArrayBufferView(value) {
  return Boolean(value) && ArrayBuffer.isView(value);
}
function isBinaryLike(value) {
  return typeof value === "string" || value instanceof ArrayBuffer || isArrayBufferView(value);
}
var defaultGetRawBody = (req) => {
  const carrier = req;
  if (isBinaryLike(carrier.rawBody)) {
    return carrier.rawBody;
  }
  if (isBinaryLike(carrier.body)) {
    return carrier.body;
  }
  return null;
};
var defaultDispatchContext = (req, res, event) => ({
  req,
  res,
  event
});
async function handleSuccess(parsed, req, res, options) {
  const {
    dispatcher,
    onEvent,
    logger,
    attachProperty = DEFAULT_ATTACH_PROPERTY,
    buildDispatchContext = defaultDispatchContext
  } = options;
  Reflect.set(req, attachProperty, parsed);
  if (logger?.debug) {
    logger.debug("Webhook event verified", { event: parsed.event, signature: parsed.signature });
  }
  if (dispatcher) {
    const context = buildDispatchContext(req, res, parsed);
    await dispatcher.dispatch(parsed, context);
  }
  if (onEvent) {
    await onEvent(parsed, req, res);
  }
}
async function handleError(error, req, res, options) {
  const { logger, onError } = options;
  if (error instanceof RequestWebhookSignatureError) {
    logger?.warn?.("Webhook signature verification failed", {
      error,
      header: error.headerName,
      reason: error.reason
    });
    if (!res.headersSent) {
      res.status(error.statusCode).json({
        error: "invalid_webhook_signature",
        reason: error.reason
      });
    }
    return;
  }
  logger?.error?.("Webhook middleware error", { error });
  if (onError) {
    await onError(error, req, res);
  }
}
function createWebhookMiddleware(options) {
  const {
    secret,
    headerName,
    timestampHeader,
    toleranceMs,
    getRawBody = defaultGetRawBody,
    skipVerification,
    autoNext = true
  } = options;
  if (!secret || Array.isArray(secret) && secret.length === 0) {
    throw new Error("createWebhookMiddleware requires at least one webhook secret");
  }
  const handler = async (req, res, next) => {
    const rawBody = getRawBody(req);
    if (!isBinaryLike(rawBody)) {
      const bodyError = new Error("Webhook middleware requires the raw request body. Configure express.raw() or supply getRawBody.");
      await handleError(bodyError, req, res, options);
      if (!res.headersSent && autoNext) {
        next(bodyError);
      }
      return;
    }
    const shouldSkip = skipVerification?.(req) ?? isWebhookVerificationBypassed();
    try {
      const parsed = parseWebhookEvent({
        rawBody,
        headers: req.headers,
        secret,
        headerName,
        timestampHeader,
        toleranceMs,
        skipSignatureVerification: shouldSkip
      });
      await handleSuccess(parsed, req, res, options);
      if (autoNext) {
        next();
      }
    } catch (error) {
      await handleError(error, req, res, options);
      if (!res.headersSent && autoNext) {
        const err = error instanceof Error ? error : new Error("Webhook middleware handler failed", { cause: error });
        next(err);
      }
    }
  };
  return handler;
}

// src/webhooks/events/index.ts
var events_exports = {};
__export(events_exports, {
  COMPLIANCE_AGREEMENT_STATUSES: () => COMPLIANCE_AGREEMENT_STATUSES2,
  COMPLIANCE_KYC_STATUSES: () => COMPLIANCE_KYC_STATUSES2,
  COMPLIANCE_UPDATED_EVENT: () => COMPLIANCE_UPDATED_EVENT,
  PAYMENT_CONFIRMED_EVENT: () => PAYMENT_CONFIRMED_EVENT,
  PAYMENT_DETAIL_STATUSES: () => PAYMENT_DETAIL_STATUSES2,
  PAYMENT_DETAIL_UPDATED_EVENT: () => PAYMENT_DETAIL_UPDATED_EVENT,
  PAYMENT_FAILED_EVENT: () => PAYMENT_FAILED_EVENT,
  PAYMENT_PARTIAL_EVENT: () => PAYMENT_PARTIAL_EVENT,
  PAYMENT_PROCESSING_EVENT: () => PAYMENT_PROCESSING_EVENT,
  PAYMENT_PROCESSING_STAGES: () => PAYMENT_PROCESSING_STAGES,
  PAYMENT_REFUNDED_EVENT: () => PAYMENT_REFUNDED_EVENT,
  REQUEST_RECURRING_EVENT: () => REQUEST_RECURRING_EVENT,
  assertComplianceUpdatedEvent: () => assertComplianceUpdatedEvent,
  assertPaymentConfirmedEvent: () => assertPaymentConfirmedEvent,
  assertPaymentDetailUpdatedEvent: () => assertPaymentDetailUpdatedEvent,
  assertPaymentFailedEvent: () => assertPaymentFailedEvent,
  assertPaymentPartialEvent: () => assertPaymentPartialEvent,
  assertPaymentProcessingEvent: () => assertPaymentProcessingEvent,
  assertPaymentRefundedEvent: () => assertPaymentRefundedEvent,
  assertRequestRecurringEvent: () => assertRequestRecurringEvent,
  complianceStatusSummary: () => complianceStatusSummary,
  createEventPredicate: () => createEventPredicate,
  isAgreementRejected: () => isAgreementRejected,
  isBouncedFailure: () => isBouncedFailure,
  isComplianceUpdatedEvent: () => isComplianceUpdatedEvent,
  isInsufficientFundsFailure: () => isInsufficientFundsFailure,
  isKycComplete: () => isKycComplete,
  isPaymentConfirmedEvent: () => isPaymentConfirmedEvent,
  isPaymentDetailApproved: () => isPaymentDetailApproved,
  isPaymentDetailPending: () => isPaymentDetailPending,
  isPaymentDetailRejected: () => isPaymentDetailRejected,
  isPaymentDetailUpdatedEvent: () => isPaymentDetailUpdatedEvent,
  isPaymentDetailVerified: () => isPaymentDetailVerified,
  isPaymentFailedEvent: () => isPaymentFailedEvent,
  isPaymentPartialEvent: () => isPaymentPartialEvent,
  isPaymentProcessingEvent: () => isPaymentProcessingEvent,
  isPaymentRefundedEvent: () => isPaymentRefundedEvent,
  isProcessingTerminalStatus: () => isProcessingTerminalStatus,
  isRequestRecurringEvent: () => isRequestRecurringEvent,
  isRetryRequired: () => isRetryRequired,
  onComplianceUpdated: () => onComplianceUpdated,
  onPaymentConfirmed: () => onPaymentConfirmed,
  onPaymentDetailUpdated: () => onPaymentDetailUpdated,
  onPaymentFailed: () => onPaymentFailed,
  onPaymentPartial: () => onPaymentPartial,
  onPaymentProcessing: () => onPaymentProcessing,
  onPaymentRefunded: () => onPaymentRefunded,
  onRequestRecurring: () => onRequestRecurring,
  processingStageLabel: () => processingStageLabel,
  registerEventHandler: () => registerEventHandler
});

// src/webhooks/events/base.event.ts
function registerEventHandler(dispatcher, event, handler) {
  return dispatcher.on(event, async (parsed, dispatchContext) => {
    await handler(parsed.payload, { event: parsed, dispatchContext });
  });
}
function createEventPredicate(event) {
  return (parsed) => parsed.event === event;
}

// src/webhooks/events/payment-confirmed.event.ts
var PAYMENT_CONFIRMED_EVENT = "payment.confirmed";
var isPaymentConfirmedEvent = createEventPredicate(PAYMENT_CONFIRMED_EVENT);
function onPaymentConfirmed(dispatcher, handler) {
  return registerEventHandler(dispatcher, PAYMENT_CONFIRMED_EVENT, handler);
}
function assertPaymentConfirmedEvent(event) {
  if (event.event !== PAYMENT_CONFIRMED_EVENT) {
    throw new TypeError(`Expected payment.confirmed event. Received ${event.event}.`);
  }
}

// src/webhooks/events/payment-failed.event.ts
var PAYMENT_FAILED_EVENT = "payment.failed";
var isPaymentFailedEvent = createEventPredicate(PAYMENT_FAILED_EVENT);
function onPaymentFailed(dispatcher, handler) {
  return registerEventHandler(dispatcher, PAYMENT_FAILED_EVENT, handler);
}
function assertPaymentFailedEvent(event) {
  if (event.event !== PAYMENT_FAILED_EVENT) {
    throw new TypeError(`Expected payment.failed event. Received ${event.event}.`);
  }
}
function isBouncedFailure(payload) {
  return payload.subStatus === "bounced";
}
function isInsufficientFundsFailure(payload) {
  return payload.subStatus === "insufficient_funds";
}

// src/webhooks/events/payment-processing.event.ts
var PAYMENT_PROCESSING_EVENT = "payment.processing";
var PAYMENT_PROCESSING_STAGES = Object.freeze([
  "initiated",
  "pending_internal_assessment",
  "ongoing_checks",
  "processing",
  "sending_fiat",
  "fiat_sent",
  "bounced",
  "retry_required"
]);
var TERMINAL_STAGES = /* @__PURE__ */ new Set(["fiat_sent", "bounced", "retry_required"]);
var STAGE_LABELS = {
  initiated: "Transfer initiated",
  pending_internal_assessment: "Pending internal assessment",
  ongoing_checks: "Ongoing compliance checks",
  processing: "Processing payment",
  sending_fiat: "Sending fiat to recipient",
  fiat_sent: "Fiat delivered",
  bounced: "Payment bounced",
  retry_required: "Retry required"
};
var isPaymentProcessingEvent = createEventPredicate(PAYMENT_PROCESSING_EVENT);
function onPaymentProcessing(dispatcher, handler) {
  return registerEventHandler(dispatcher, PAYMENT_PROCESSING_EVENT, handler);
}
function assertPaymentProcessingEvent(event) {
  if (event.event !== PAYMENT_PROCESSING_EVENT) {
    throw new TypeError(`Expected payment.processing event. Received ${event.event}.`);
  }
}
function isProcessingTerminalStatus(stage) {
  return TERMINAL_STAGES.has(stage);
}
function processingStageLabel(stage) {
  return STAGE_LABELS[stage];
}
function isRetryRequired(stage) {
  return stage === "retry_required";
}

// src/webhooks/events/payment-detail-updated.event.ts
var PAYMENT_DETAIL_UPDATED_EVENT = "payment_detail.updated";
var PAYMENT_DETAIL_STATUSES2 = Object.freeze([
  "approved",
  "failed",
  "pending",
  "verified"
]);
var isPaymentDetailUpdatedEvent = createEventPredicate(PAYMENT_DETAIL_UPDATED_EVENT);
function onPaymentDetailUpdated(dispatcher, handler) {
  return registerEventHandler(dispatcher, PAYMENT_DETAIL_UPDATED_EVENT, handler);
}
function assertPaymentDetailUpdatedEvent(event) {
  if (event.event !== PAYMENT_DETAIL_UPDATED_EVENT) {
    throw new TypeError(`Expected payment_detail.updated event. Received ${event.event}.`);
  }
}
function isPaymentDetailApproved(payload) {
  return payload.status === "approved";
}
function isPaymentDetailRejected(payload) {
  return payload.status === "failed";
}
function isPaymentDetailPending(payload) {
  return payload.status === "pending";
}
function isPaymentDetailVerified(payload) {
  return payload.status === "verified";
}

// src/webhooks/events/compliance-updated.event.ts
var COMPLIANCE_UPDATED_EVENT = "compliance.updated";
var COMPLIANCE_KYC_STATUSES2 = Object.freeze([
  "initiated",
  "pending",
  "approved",
  "rejected",
  "failed"
]);
var COMPLIANCE_AGREEMENT_STATUSES2 = Object.freeze([
  "not_started",
  "pending",
  "completed",
  "rejected",
  "failed",
  "signed"
]);
var AGREEMENT_REJECTED_STATES = /* @__PURE__ */ new Set(["rejected", "failed"]);
var isComplianceUpdatedEvent = createEventPredicate(COMPLIANCE_UPDATED_EVENT);
function onComplianceUpdated(dispatcher, handler) {
  return registerEventHandler(dispatcher, COMPLIANCE_UPDATED_EVENT, handler);
}
function assertComplianceUpdatedEvent(event) {
  if (event.event !== COMPLIANCE_UPDATED_EVENT) {
    throw new TypeError(`Expected compliance.updated event. Received ${event.event}.`);
  }
}
function isKycComplete(payload) {
  return payload.kycStatus === "approved";
}
function isAgreementRejected(payload) {
  const status = payload.agreementStatus;
  if (!status) return false;
  return AGREEMENT_REJECTED_STATES.has(status);
}
function complianceStatusSummary(payload) {
  const parts = [];
  const kyc = payload.kycStatus ? payload.kycStatus.replace(/_/g, " ") : "unknown";
  const agreement = payload.agreementStatus ? payload.agreementStatus.replace(/_/g, " ") : "unknown";
  parts.push(`KYC: ${kyc}`);
  parts.push(`Agreement: ${agreement}`);
  if (payload.clientUserId) {
    const clientUserId = typeof payload.clientUserId === "string" ? payload.clientUserId : JSON.stringify(payload.clientUserId);
    parts.push(`Client user: ${clientUserId}`);
  }
  return parts.join(" | ");
}

// src/webhooks/events/payment-partial.event.ts
var PAYMENT_PARTIAL_EVENT = "payment.partial";
var isPaymentPartialEvent = createEventPredicate(PAYMENT_PARTIAL_EVENT);
function onPaymentPartial(dispatcher, handler) {
  return registerEventHandler(dispatcher, PAYMENT_PARTIAL_EVENT, handler);
}
function assertPaymentPartialEvent(event) {
  if (event.event !== PAYMENT_PARTIAL_EVENT) {
    throw new TypeError(`Expected payment.partial event. Received ${event.event}.`);
  }
}

// src/webhooks/events/payment-refunded.event.ts
var PAYMENT_REFUNDED_EVENT = "payment.refunded";
var isPaymentRefundedEvent = createEventPredicate(PAYMENT_REFUNDED_EVENT);
function onPaymentRefunded(dispatcher, handler) {
  return registerEventHandler(dispatcher, PAYMENT_REFUNDED_EVENT, handler);
}
function assertPaymentRefundedEvent(event) {
  if (event.event !== PAYMENT_REFUNDED_EVENT) {
    throw new TypeError(`Expected payment.refunded event. Received ${event.event}.`);
  }
}

// src/webhooks/events/request-recurring.event.ts
var REQUEST_RECURRING_EVENT = "request.recurring";
var isRequestRecurringEvent = createEventPredicate(REQUEST_RECURRING_EVENT);
function onRequestRecurring(dispatcher, handler) {
  return registerEventHandler(dispatcher, REQUEST_RECURRING_EVENT, handler);
}
function assertRequestRecurringEvent(event) {
  if (event.event !== REQUEST_RECURRING_EVENT) {
    throw new TypeError(`Expected request.recurring event. Received ${event.event}.`);
  }
}

exports.DEFAULT_RETRY_CONFIG = DEFAULT_RETRY_CONFIG;
exports.RequestApiError = RequestApiError;
exports.RequestEnvironment = RequestEnvironment;
exports.SchemaRegistry = SchemaRegistry;
exports.ValidationError = ValidationError;
exports.browserFetchAdapter = browserFetchAdapter;
exports.buildRequestApiError = buildRequestApiError;
exports.clientIds = client_ids_exports;
exports.computeRetryDelay = computeRetryDelay;
exports.createHttpClient = createHttpClient;
exports.createRequestClient = createRequestClient;
exports.createRequestClientFromEnv = createRequestClientFromEnv;
exports.currencies = currencies_exports;
exports.currenciesV1 = v1_exports;
exports.isRequestApiError = isRequestApiError;
exports.nodeFetchAdapter = nodeFetchAdapter;
exports.parseWithRegistry = parseWithRegistry;
exports.parseWithSchema = parseWithSchema;
exports.pay = pay_exports;
exports.payV1 = v1_exports2;
exports.payer = payer_exports;
exports.payerV1 = v1_exports3;
exports.payerV2 = v2_exports;
exports.payments = payments_exports;
exports.payouts = payouts_exports;
exports.requests = requests_exports;
exports.requestsV1 = v1_exports4;
exports.schemaRegistry = schemaRegistry;
exports.shouldRetryRequest = shouldRetryRequest;
exports.webhooks = webhooks_exports;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map