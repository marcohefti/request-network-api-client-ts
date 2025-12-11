import {
  type HttpAdapter,
  type HttpClient,
  type HttpClientConfig,
  type HttpRequest,
  type HttpResponse,
  type Interceptor,
  type LogLevel,
  type QuerySerializer,
  type RequestOptions,
  type RuntimeValidationConfig,
  type RuntimeValidationOption,
  buildUrl,
  composeInterceptors,
} from "./http.types";
import { buildCredentialHeaders, type CredentialOptions } from "../auth/credential-header.builder";
import { buildRequestApiError } from "../errors/request-api.error";
import { nodeFetchAdapter } from "./adapters/node-fetch.adapter";
import { createLoggingInterceptor } from "./interceptors/logging.interceptor";
import { createRetryInterceptor, type RetryInterceptorOptions } from "./interceptors/retry.interceptor";
import { cloneRuntimeValidation, mergeRuntimeValidation, normaliseRuntimeValidation } from "./validation.config";
import type { SchemaKey } from "../../validation/schema.registry";
import { parseWithRegistry } from "../../validation/zod.helpers";

export interface CreateClientOptions {
  baseUrl?: string;
  apiKey?: string;
  clientId?: string;
  origin?: string;
  headers?: Record<string, string>;
  adapter?: HttpAdapter;
  interceptors?: Interceptor[];
  logger?: (event: string, meta?: Record<string, unknown>) => void;
  retry?: RetryInterceptorOptions;
  querySerializer?: QuerySerializer;
  userAgent?: string;
  sdkInfo?: {
    name: string;
    version?: string;
  };
  logLevel?: LogLevel;
  runtimeValidation?: RuntimeValidationOption;
}

const DEFAULT_BASE_URL = "https://api.request.network";

function buildTelemetryHeaders(userAgent?: string, sdkInfo?: CreateClientOptions["sdkInfo"]): Record<string, string> {
  const headers: Record<string, string> = {};
  if (userAgent) headers["user-agent"] = userAgent;
  if (sdkInfo?.name) headers["x-sdk"] = sdkInfo.version ? `${sdkInfo.name}/${sdkInfo.version}` : sdkInfo.name;
  return headers;
}

function buildHeaders(credentials: CredentialOptions, defaults?: Record<string, string>, extra?: Record<string, string>): Record<string, string> {
  return {
    ...buildCredentialHeaders(credentials),
    ...(defaults ?? {}),
    ...(extra ?? {}),
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if ((value && typeof value === "object") || Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function mapToError(res: HttpResponse, req: HttpRequest, validation: RuntimeValidationConfig): never {
  const operationId = req.meta?.operationId;
  const rawPayload = asRecord(res.data);
  let payload = rawPayload;

  if (validation.errors && operationId) {
    const schemaKey: SchemaKey = { operationId, kind: "response", status: res.status };
    const parsed = parseWithRegistry({
      key: schemaKey,
      value: rawPayload ?? res.data,
      description: `Error response for ${operationId}`,
      skipOnMissingSchema: true,
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
    fallbackMessage: res.text ?? `HTTP ${String(res.status)}`,
  });
  throw error;
}

export function createHttpClient(options: CreateClientOptions = {}): HttpClient {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const adapter = options.adapter ?? nodeFetchAdapter;
  const defaults = { ...buildTelemetryHeaders(options.userAgent, options.sdkInfo), ...(options.headers ?? {}) };
  const creds: CredentialOptions = { apiKey: options.apiKey, clientId: options.clientId, origin: options.origin };

  const userInterceptors = options.interceptors ?? [];
  const logLevel: LogLevel = options.logLevel ?? (options.logger ? "info" : "silent");
  const runtimeValidation = normaliseRuntimeValidation(options.runtimeValidation);

  function buildBaseInterceptors(meta?: RequestOptions["meta"]): Interceptor[] {
    const retryCfg = meta?.retry ?? options.retry?.config;
    const retryOptions: RetryInterceptorOptions = {
      ...(options.retry ?? {}),
      logger: options.retry?.logger ?? options.logger,
      logLevel: options.retry?.logLevel ?? logLevel,
    };
    if (retryCfg) {
      retryOptions.config = retryCfg;
    }
    return [createRetryInterceptor(retryOptions), createLoggingInterceptor({ logger: options.logger, level: logLevel })];
  }

  const cfg: HttpClientConfig = {
    baseUrl,
    defaultHeaders: buildHeaders(creds, defaults),
    adapter,
    logger: options.logger,
    querySerializer: options.querySerializer,
    logLevel,
  };

  async function dispatch(req: HttpRequest): Promise<HttpResponse> {
    // Compose interceptors: per-request -> user-provided -> base (retry, logging)
    const perRequestInterceptors = req.meta?.interceptors ?? [];
    const baseInterceptors = buildBaseInterceptors(req.meta);
    const all = [...perRequestInterceptors, ...userInterceptors, ...baseInterceptors];
    const terminal = (r: HttpRequest) => cfg.adapter.send(r);
    const chain = composeInterceptors(terminal, all);
    return chain(req);
  }

  async function request(init: RequestOptions): Promise<{ status: number; headers: Record<string, string>; data: unknown }> {
    const serializer = init.querySerializer ?? cfg.querySerializer;
    const url = buildUrl(cfg.baseUrl, init.path, init.query, serializer);
    const headers = { ...(cfg.defaultHeaders ?? {}), ...(init.headers ?? {}) };
    const req: HttpRequest = {
      method: init.method,
      url,
      headers,
      body: init.body,
      signal: init.signal,
      timeoutMs: init.timeoutMs,
      meta: init.meta,
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
    get: (path, init) => request({ ...(init ?? {}), path, method: "GET" }),
    post: (path, body, init) => request({ ...(init ?? {}), path, method: "POST", body }),
    put: (path, body, init) => request({ ...(init ?? {}), path, method: "PUT", body }),
    patch: (path, body, init) => request({ ...(init ?? {}), path, method: "PATCH", body }),
    delete: (path, init) => {
      const { body, ...rest } = init ?? {};
      return request({ ...rest, path, method: "DELETE", body });
    },
    head: (path, init) => request({ ...(init ?? {}), path, method: "HEAD" }),
    options: (path, init) => request({ ...(init ?? {}), path, method: "OPTIONS" }),
    getRuntimeValidationConfig: () => cloneRuntimeValidation(runtimeValidation),
  } satisfies HttpClient;
}
