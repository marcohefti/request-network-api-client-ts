import type { NextFunction, Request, RequestHandler, Response } from "express-serve-static-core";

import type { WebhookDispatchContext, WebhookDispatcher } from "./dispatcher.webhook";
import { RequestWebhookSignatureError } from "./errors.webhook";
import type { ParsedWebhookEvent } from "./parser.webhook";
import { parseWebhookEvent } from "./parser.webhook";
import type { WebhookEventName } from "./schemas.webhook";
import { isWebhookVerificationBypassed } from "./testing.webhook";

type BinaryLike = ArrayBuffer | ArrayBufferView | string;

export interface WebhookLogger {
  debug?(message: string, context?: Record<string, unknown>): void;
  info?(message: string, context?: Record<string, unknown>): void;
  warn?(message: string, context?: Record<string, unknown>): void;
  error?(message: string, context?: Record<string, unknown>): void;
}

export interface BuildDispatchContext {
  (req: Request, res: Response, event: ParsedWebhookEvent): WebhookDispatchContext;
}

export type ShouldSkipVerification = (req: Request) => boolean;

export type GetRawBody = (req: Request) => BinaryLike | null | undefined;

interface RawBodyCarrier {
  rawBody?: BinaryLike;
}

export interface CreateWebhookMiddlewareOptions {
  readonly secret: string | readonly string[];
  readonly headerName?: string;
  readonly timestampHeader?: string;
  readonly toleranceMs?: number;
  readonly dispatcher?: WebhookDispatcher;
  readonly onEvent?: (event: ParsedWebhookEvent, req: Request, res: Response) => void | Promise<void>;
  readonly onError?: (error: unknown, req: Request, res: Response) => void | Promise<void>;
  readonly logger?: WebhookLogger;
  readonly getRawBody?: GetRawBody;
  readonly skipVerification?: ShouldSkipVerification;
  readonly attachProperty?: string;
  readonly buildDispatchContext?: BuildDispatchContext;
  readonly autoNext?: boolean;
}

const DEFAULT_ATTACH_PROPERTY = "webhook";

function isArrayBufferView(value: unknown): value is ArrayBufferView {
  return Boolean(value) && ArrayBuffer.isView(value as ArrayBufferView);
}

function isBinaryLike(value: unknown): value is BinaryLike {
  return typeof value === "string" || value instanceof ArrayBuffer || isArrayBufferView(value);
}

const defaultGetRawBody: GetRawBody = (req) => {
  const carrier = req as Request & RawBodyCarrier;
  if (isBinaryLike(carrier.rawBody)) {
    return carrier.rawBody;
  }
  if (isBinaryLike(carrier.body)) {
    return carrier.body;
  }
  return null;
};

const defaultDispatchContext: BuildDispatchContext = (req, res, event) => ({
  req,
  res,
  event,
});

async function handleSuccess(
  parsed: ParsedWebhookEvent,
  req: Request,
  res: Response,
  options: CreateWebhookMiddlewareOptions,
): Promise<void> {
  const {
    dispatcher,
    onEvent,
    logger,
    attachProperty = DEFAULT_ATTACH_PROPERTY,
    buildDispatchContext = defaultDispatchContext,
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

async function handleError(
  error: unknown,
  req: Request,
  res: Response,
  options: CreateWebhookMiddlewareOptions,
): Promise<void> {
  const { logger, onError } = options;

  if (error instanceof RequestWebhookSignatureError) {
    logger?.warn?.("Webhook signature verification failed", {
      error,
      header: error.headerName,
      reason: error.reason,
    });

    if (!res.headersSent) {
      res.status(error.statusCode).json({
        error: "invalid_webhook_signature",
        reason: error.reason,
      });
    }
    return;
  }

  logger?.error?.("Webhook middleware error", { error });

  if (onError) {
    await onError(error, req, res);
  }
}

export function createWebhookMiddleware(options: CreateWebhookMiddlewareOptions): RequestHandler {
  const {
    secret,
    headerName,
    timestampHeader,
    toleranceMs,
    getRawBody = defaultGetRawBody,
    skipVerification,
    autoNext = true,
  } = options;

  if (!secret || (Array.isArray(secret) && secret.length === 0)) {
    throw new Error("createWebhookMiddleware requires at least one webhook secret");
  }

  const handler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        skipSignatureVerification: shouldSkip,
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

  return handler as unknown as RequestHandler;
}

export type WebhookRequest<E extends WebhookEventName = WebhookEventName> = Request & {
  webhook?: ParsedWebhookEvent<E>;
};
