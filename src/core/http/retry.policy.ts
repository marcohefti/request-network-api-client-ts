import { isRequestApiError } from "../errors/request-api.error";

export type RetryJitter = "none" | "full" | "half";

export interface RetryConfig {
  /**
   * Maximum attempts including the first request.
   * Set to 1 to disable retries.
   */
  maxAttempts: number;
  /**
   * Delay applied to the first retry attempt.
   */
  initialDelayMs: number;
  /**
   * Upper bound for calculated backoff delays.
   */
  maxDelayMs: number;
  /**
   * Multiplicative factor applied on each retry (exponential backoff).
   */
  backoffFactor: number;
  /**
   * Jitter strategy applied to the computed delay.
   */
  jitter: RetryJitter;
  /**
   * Predicate deciding if a retry should occur for the provided status code.
   * When specified, supersedes {@link retryStatusCodes}.
   */
  shouldRetry?: (context: RetryDecisionInput) => boolean;
  /**
   * HTTP status codes that are eligible for retries (when `shouldRetry` is not supplied).
   */
  retryStatusCodes: number[];
  /**
   * Methods considered for retries (enforced by the interceptor). Defaults to idempotent methods.
   */
  allowedMethods?: string[];
}

export interface RetryDecisionInput {
  attempt: number;
  response?: RetryResponseLike;
  error?: unknown;
}

export interface RetryResponseLike {
  status: number;
  headers?: Record<string, string | undefined>;
  /**
   * Optional retry-after header value for transport adapters that expose parsed metadata.
   */
  retryAfterMs?: number;
}

export interface RetryDecision {
  retry: boolean;
  delayMs?: number;
  reason?: string;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 250,
  maxDelayMs: 5_000,
  backoffFactor: 2,
  jitter: "full",
  retryStatusCodes: [408, 425, 429, 500, 502, 503, 504],
  allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"],
};

export function shouldRetryRequest(config: RetryConfig, input: RetryDecisionInput): RetryDecision {
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
    const statusFromError = isRequestApiError(input.error) ? input.error.status : undefined;
    const status = input.response?.status ?? statusFromError;
    if (typeof status !== "number" || !config.retryStatusCodes.includes(status)) {
      return { retry: false, reason: "status-not-retriable" };
    }
  }

  const delay = computeRetryDelay(config, input);
  return { retry: true, delayMs: delay, reason: "retry-scheduled" };
}

export function computeRetryDelay(config: RetryConfig, input: RetryDecisionInput): number {
  const retryAfter = input.response?.retryAfterMs ?? extractRetryAfterFromError(input.error);
  if (retryAfter !== undefined && retryAfter >= 0) {
    return clampDelay(retryAfter, config.maxDelayMs);
  }

  const attemptIndex = input.attempt - 1;
  const exponential = config.initialDelayMs * Math.pow(config.backoffFactor, attemptIndex);
  const jittered = applyJitter(exponential, config.jitter);
  return clampDelay(jittered, config.maxDelayMs);
}

interface HasRetryAfter {
  retryAfterMs?: unknown;
}

function hasRetryAfter(x: unknown): x is HasRetryAfter {
  return typeof x === "object" && x !== null && "retryAfterMs" in (x as HasRetryAfter);
}

function extractRetryAfterFromError(err: unknown): number | undefined {
  if (isRequestApiError(err)) {
    return err.retryAfterMs;
  }
  if (hasRetryAfter(err) && typeof err.retryAfterMs === "number") {
    return err.retryAfterMs;
  }
  return undefined;
}

function clampDelay(delay: number, maxDelay: number): number {
  if (delay < 0) {
    return 0;
  }
  return delay > maxDelay ? maxDelay : delay;
}

function applyJitter(delay: number, jitter: RetryJitter): number {
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

function randomInRange(min: number, max: number): number {
  if (min >= max) {
    return min;
  }
  return min + Math.random() * (max - min);
}
