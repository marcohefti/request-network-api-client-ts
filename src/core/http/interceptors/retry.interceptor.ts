import { parseRetryAfter } from "../../errors/request-api.error";
import { type Interceptor, type LogLevel, type NextHandler, type HttpResponse } from "../http.types";
import { computeRetryDelay, DEFAULT_RETRY_CONFIG, shouldRetryRequest, type RetryConfig } from "../retry.policy";
import { shouldLog } from "./logger.utils";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryInterceptorOptions {
  config?: Partial<RetryConfig>;
  logger?: (event: string, meta?: Record<string, unknown>) => void;
  logLevel?: LogLevel;
}

export function createRetryInterceptor(options?: RetryInterceptorOptions): Interceptor {
  const cfg: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...(options?.config ?? {}) };

  const allowed = new Set((cfg as RetryConfig & { allowedMethods?: string[] }).allowedMethods ?? ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);
  const log = options?.logger;
  const level: LogLevel = options?.logLevel ?? "info";

  const RETRY_EVENT = "request:retry" as const;
  const RATE_LIMIT_EVENT = "rate-limit" as const;
  const DEFAULT_RETRY_REASON = "retry-scheduled";

  const emit = (event: typeof RETRY_EVENT | typeof RATE_LIMIT_EVENT, meta: Record<string, unknown>) => {
    const threshold: LogLevel = event === RETRY_EVENT ? "info" : "info";
    if (!log) return;
    if (!shouldLog(level, threshold)) return;
    log(event, meta);
  };

  const parseRetryAfterMs = (headers?: Record<string, string>): number | undefined => {
    if (!headers) return undefined;
    const header = headers["retry-after"] ?? headers["Retry-After"];
    return parseRetryAfter(header);
  };

  const scheduleRetry = async (delayMs: number, meta: Record<string, unknown>): Promise<void> => {
    emit(RETRY_EVENT, { ...meta, reason: meta.reason ?? DEFAULT_RETRY_REASON });
    if (delayMs > 0) {
      await sleep(delayMs);
    }
  };

  const maybeHandleResponse = async ({
    res,
    attempt,
    context,
    isAllowedMethod,
  }: {
    res: HttpResponse;
    attempt: number;
    context: { method: string; url: string; meta?: Record<string, unknown> };
    isAllowedMethod: boolean;
  }): Promise<boolean> => {
    if (res.ok) {
      return false;
    }

    const retryAfterMs = parseRetryAfterMs(res.headers);
    if (res.status === 429) {
      emit(RATE_LIMIT_EVENT, { ...context, status: res.status, attempt, retryAfterMs });
    }

    const decision = isAllowedMethod
      ? shouldRetryRequest(cfg, { attempt, response: { status: res.status, headers: res.headers, retryAfterMs } })
      : { retry: false };

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
      retryAfterMs,
    });
    return true;
  };

  const maybeHandleError = async ({
    error,
    attempt,
    context,
  }: {
    error: unknown;
    attempt: number;
    context: { method: string; url: string; meta?: Record<string, unknown> };
  }): Promise<boolean> => {
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
      error,
    });
    return true;
  };

  return async function retryInterceptor(req, next: NextHandler): Promise<HttpResponse> {
    const isAllowedMethod = allowed.has(req.method);
    for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
      try {
        const res = await next(req);
        const shouldRetry = await maybeHandleResponse({
          res,
          attempt,
          context: { method: req.method, url: req.url, meta: req.meta },
          isAllowedMethod,
        });
        if (!shouldRetry) {
          return res;
        }
        continue;
      } catch (error) {
        const shouldRetry = await maybeHandleError({
          error,
          attempt,
          context: { method: req.method, url: req.url, meta: req.meta },
        });
        if (shouldRetry) {
          continue;
        }
        throw error;
      }
    }
    // Fallback; should be unreachable due to returns/throws above
    return next(req);
  };
}
