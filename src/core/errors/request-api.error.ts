export interface RequestErrorSource {
  pointer?: string;
  parameter?: string;
}

export interface RequestErrorDetail {
  message: string;
  code?: string;
  field?: string;
  source?: RequestErrorSource;
  meta?: Record<string, unknown>;
}

export interface RequestErrorMetadata {
  status: number;
  code: string;
  message: string;
  detail?: unknown;
  errors?: RequestErrorDetail[];
  requestId?: string;
  correlationId?: string;
  retryAfterMs?: number;
  headers?: Record<string, string | undefined>;
  meta?: Record<string, unknown>;
  cause?: unknown;
}

const REQUEST_ERROR_NAME = "RequestApiError";

export class RequestApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly detail?: unknown;
  public readonly errors?: RequestErrorDetail[];
  public readonly requestId?: string;
  public readonly correlationId?: string;
  public readonly retryAfterMs?: number;
  public readonly headers?: Record<string, string | undefined>;
  public readonly meta?: Record<string, unknown>;

  constructor(metadata: RequestErrorMetadata) {
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

  toJSON(): Record<string, unknown> {
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
      meta: this.meta,
    };
  }
}

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";
export const RETRY_AFTER_HEADER = "retry-after";

export interface ErrorHeaderLookup {
  get(name: string): string | undefined;
}

export type HeaderLike = Record<string, string | undefined> | ErrorHeaderLookup | undefined;

export function normaliseHeaders(headers: HeaderLike): Record<string, string | undefined> | undefined {
  if (!headers) {
    return undefined;
  }

  if (typeof (headers as ErrorHeaderLookup).get === "function") {
    const lookup = headers as ErrorHeaderLookup;
    return {
      [REQUEST_ID_HEADER]: lookup.get(REQUEST_ID_HEADER),
      [CORRELATION_ID_HEADER]: lookup.get(CORRELATION_ID_HEADER),
      [RETRY_AFTER_HEADER]: lookup.get(RETRY_AFTER_HEADER),
    };
  }

  return {
    [REQUEST_ID_HEADER]: (headers as Record<string, string | undefined>)[REQUEST_ID_HEADER],
    [CORRELATION_ID_HEADER]: (headers as Record<string, string | undefined>)[CORRELATION_ID_HEADER],
    [RETRY_AFTER_HEADER]: (headers as Record<string, string | undefined>)[RETRY_AFTER_HEADER],
  };
}

export interface ErrorPayloadLike {
  status?: number;
  code?: string;
  message?: string;
  detail?: unknown;
  errors?: unknown;
  [key: string]: unknown;
}

export function parseRetryAfter(headerValue?: string): number | undefined {
  if (!headerValue) {
    return undefined;
  }

  const numeric = Number(headerValue);
  if (!Number.isNaN(numeric)) {
    return numeric * 1000;
  }

  const parsedDate = Date.parse(headerValue);
  if (Number.isNaN(parsedDate)) {
    return undefined;
  }

  const delay = parsedDate - Date.now();
  return delay > 0 ? delay : 0;
}

export interface BuildRequestApiErrorOptions {
  payload?: ErrorPayloadLike | null;
  status: number;
  headers?: HeaderLike;
  fallbackMessage?: string;
  meta?: Record<string, unknown>;
  cause?: unknown;
}

export function buildRequestApiError(options: BuildRequestApiErrorOptions): RequestApiError {
  const { payload, status, headers, fallbackMessage, meta, cause } = options;
  const normalisedHeaders = normaliseHeaders(headers);
  const retryAfterHeader = normalisedHeaders?.[RETRY_AFTER_HEADER];
  const retryAfterMs = parseRetryAfter(retryAfterHeader);

  const code = typeof payload?.code === "string" && payload.code.length > 0 ? payload.code : `HTTP_${String(status)}`;
  const message = typeof payload?.message === "string" && payload.message.length > 0 ? payload.message : fallbackMessage ?? "Request Network API error";

  const maybeErrors = Array.isArray(payload?.errors) ? (payload.errors as unknown[]) : undefined;
  const errors = maybeErrors?.filter(Boolean) as RequestErrorDetail[] | undefined;

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
    cause,
  });
}

export function isRequestApiError(error: unknown): error is RequestApiError {
  return error instanceof RequestApiError || (typeof error === "object" && error !== null && (error as { name?: string }).name === REQUEST_ERROR_NAME);
}
