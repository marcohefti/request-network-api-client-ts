export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

import type { RetryConfig } from "./retry.policy";

export interface RuntimeValidationConfig {
  requests: boolean;
  responses: boolean;
  errors: boolean;
}

export type RuntimeValidationOption = boolean | Partial<RuntimeValidationConfig>;

export type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | QueryPrimitive[];
export type QueryRecord = Record<string, QueryValue | undefined>;
export type QuerySerializerFn = (params: {
  key: string;
  value: QueryValue;
  set: (key: string, value: string) => void;
  append: (key: string, value: string) => void;
}) => void;
export type QuerySerializer = "comma" | "repeat" | QuerySerializerFn;
export type LogLevel = "silent" | "error" | "info" | "debug";

export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  meta?: {
    operationId?: string;
    retry?: Partial<RetryConfig>;
    interceptors?: Interceptor[];
    validation?: RuntimeValidationOption;
    [key: string]: unknown;
  };
}

export interface HttpResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  data?: unknown;
  text?: string;
}

export interface HttpAdapter {
  send(request: HttpRequest): Promise<HttpResponse>;
}

export type NextHandler = (req: HttpRequest) => Promise<HttpResponse>;
export type Interceptor = (req: HttpRequest, next: NextHandler) => Promise<HttpResponse>;

export interface RequestOptions {
  path: string;
  method: HttpMethod;
  query?: QueryRecord;
  querySerializer?: QuerySerializer;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  meta?: HttpRequest["meta"];
}

export interface RetryOptions {
  attempt: number;
}

export interface Logger {
  (event: string, meta?: Record<string, unknown>): void;
}

export interface HttpClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  adapter: HttpAdapter;
  interceptors?: Interceptor[];
  logger?: Logger;
  querySerializer?: QuerySerializer;
  logLevel?: LogLevel;
}

export interface HttpClient {
  request(options: RequestOptions): Promise<{ status: number; headers: Record<string, string>; data: unknown }>; // throws on non-2xx
  get(path: string, init?: Omit<RequestOptions, "path" | "method" | "body">): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  post(path: string, body?: unknown, init?: Omit<RequestOptions, "path" | "method">): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  put(path: string, body?: unknown, init?: Omit<RequestOptions, "path" | "method">): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  patch(path: string, body?: unknown, init?: Omit<RequestOptions, "path" | "method">): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  delete(path: string, init?: Omit<RequestOptions, "path" | "method"> & { body?: unknown }): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  head(path: string, init?: Omit<RequestOptions, "path" | "method" | "body">): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  options(path: string, init?: Omit<RequestOptions, "path" | "method" | "body">): Promise<{ status: number; headers: Record<string, string>; data: unknown }>;
  getRuntimeValidationConfig(): RuntimeValidationConfig;
}

function toQueryItems(value: QueryValue): string[] {
  const items = Array.isArray(value) ? value : [value];
  return items.map((item) => String(item));
}

function resolveQuerySerializer(serializer?: QuerySerializer): QuerySerializerFn {
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

export function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"], serializer?: QuerySerializer): string {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(base + cleanPath);

  if (!query) return url.toString();

  const serialize = resolveQuerySerializer(serializer);
  const params = url.searchParams;

  for (const key of Object.keys(query)) {
    const raw = query[key];
    if (raw === undefined) continue;
    serialize({
      key,
      value: raw,
      set: (k, value) => {
        params.delete(k);
        params.set(k, value);
      },
      append: (k, value) => {
        params.append(k, value);
      },
    });
  }

  return url.toString();
}

export function composeInterceptors(terminal: NextHandler, interceptors: readonly Interceptor[] = []): NextHandler {
  return interceptors.reduceRight<NextHandler>((next, interceptor) => {
    return (req) => interceptor(req, next);
  }, terminal);
}
