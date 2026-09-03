import { type Interceptor, type LogLevel } from "../http.types";
import { shouldLog } from "./logger.utils";

export interface LoggingOptions {
  logger?: (event: string, meta?: Record<string, unknown>) => void;
  level?: LogLevel;
}

function redactUrl(url: string): string {
  // Secure-payment bearer tokens are path segments, and therefore must not be
  // leaked by the otherwise useful request lifecycle logs.
  return url.replace(/(\/secure-payments\/(?:multicall-payouts\/)?)([^/?#]+)/g, "$1<redacted>");
}

export function createLoggingInterceptor(options?: LoggingOptions): Interceptor {
  const log = options?.logger;
  const level: LogLevel = options?.level ?? "info";
  type LogEvent = "request:start" | "request:response" | "request:error";
  const EVENT_LEVEL: Record<LogEvent, LogLevel> = {
    "request:start": "debug",
    "request:response": "info",
    "request:error": "error",
  };

  const emit = (event: LogEvent, meta: Record<string, unknown>) => {
    if (!log) return;
    const threshold = EVENT_LEVEL[event];
    if (!shouldLog(level, threshold)) return;
    log(event, meta);
  };

  return async (req, next) => {
    const startedAt = Date.now();
    const url = redactUrl(req.url);
    emit("request:start", { method: req.method, url, meta: req.meta });
    try {
      const res = await next(req);
      const durationMs = Date.now() - startedAt;
      emit("request:response", { method: req.method, url, status: res.status, ok: res.ok, durationMs, meta: req.meta });
      return res;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      emit("request:error", { method: req.method, url, durationMs, error, meta: req.meta });
      throw error;
    }
  };
}
