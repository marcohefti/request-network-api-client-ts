import { Buffer } from "node:buffer";
import type { ZodTypeAny } from "zod";

import { normaliseHeaders, pickHeader, type NormalisedHeaders, type WebhookHeaders } from "./headers.webhook";
import { WEBHOOK_EVENT_NAMES, getWebhookSchema } from "./schemas.webhook";
import type { WebhookEventName, WebhookPayload } from "./schemas.webhook";
import { DEFAULT_SIGNATURE_HEADER, verifyWebhookSignature, type VerifyWebhookSignatureResult } from "./signature.webhook";
import { ValidationError, parseWithSchema } from "../validation/zod.helpers";

export interface ParseWebhookEventOptions {
  readonly rawBody: ArrayBuffer | ArrayBufferView | string;
  readonly headers: WebhookHeaders;
  readonly secret: string | readonly string[];
  readonly headerName?: string;
  readonly signature?: string;
  readonly toleranceMs?: number;
  readonly timestampHeader?: string;
  readonly now?: () => number;
  readonly skipSignatureVerification?: boolean;
}

export interface ParsedWebhookEvent<E extends WebhookEventName = WebhookEventName> {
  readonly event: E;
  readonly payload: WebhookPayload<E>;
  readonly signature: string | null;
  readonly matchedSecret: string | null;
  readonly timestamp: number | null;
  readonly rawBody: Uint8Array;
  readonly headers: NormalisedHeaders;
}

function ensureBuffer(rawBody: ArrayBuffer | ArrayBufferView | string): Buffer {
  if (typeof rawBody === "string") {
    return Buffer.from(rawBody, "utf8");
  }
  if (rawBody instanceof ArrayBuffer) {
    return Buffer.from(rawBody);
  }
  return Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength);
}

function normaliseBody(rawBody: ArrayBuffer | ArrayBufferView | string): { buffer: Buffer; view: Uint8Array } {
  const buffer = ensureBuffer(rawBody);
  const view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  return { buffer, view };
}

function parseJsonBody(buffer: Buffer): unknown {
  try {
    const text = buffer.toString("utf8");
    return JSON.parse(text);
  } catch (error) {
    throw new ValidationError("Invalid webhook JSON payload", error);
  }
}

function resolveEventName(body: unknown): string {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Webhook payload must be a JSON object");
  }
  const candidate = (body as Record<string, unknown>).event;
  if (typeof candidate !== "string" || candidate.length === 0) {
    throw new ValidationError("Webhook payload missing `event` field");
  }
  return candidate;
}

function assertWebhookEventName(name: string): asserts name is WebhookEventName {
  if (!WEBHOOK_EVENT_NAMES.includes(name as WebhookEventName)) {
    throw new ValidationError(`Unknown webhook event: ${name}`);
  }
}

function verifySignatureIfRequired(
  options: ParseWebhookEventOptions,
  buffer: Buffer,
  headers: WebhookHeaders,
): VerifyWebhookSignatureResult | null {
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
    now: options.now,
  });
}

export function parseWebhookEvent<E extends WebhookEventName = WebhookEventName>(
  options: ParseWebhookEventOptions,
): ParsedWebhookEvent<E> {
  const { buffer, view } = normaliseBody(options.rawBody);
  const headers = options.skipSignatureVerification ? normaliseHeaders(options.headers) : undefined;
  const verification = verifySignatureIfRequired(options, buffer, options.headers);

  const normalisedHeaders = verification?.headers ?? headers ?? normaliseHeaders(options.headers);
  const signature =
    verification?.signature ??
    options.signature ??
    pickHeader(normalisedHeaders, options.headerName ?? DEFAULT_SIGNATURE_HEADER) ??
    null;
  const matchedSecret = verification?.matchedSecret ?? null;
  const timestamp = verification?.timestamp ?? null;

  const jsonBody = parseJsonBody(buffer);
  const eventName = resolveEventName(jsonBody);
  assertWebhookEventName(eventName);

  const schema = getWebhookSchema(eventName) as ZodTypeAny | undefined;
  if (!schema) {
    throw new ValidationError(`No schema registered for webhook event ${eventName}`);
  }

  const parsed = parseWithSchema<ZodTypeAny>({
    schema,
    value: jsonBody,
    description: `Webhook event ${eventName}`,
  });
  if (!parsed.success || !parsed.data) {
    const cause = parsed.error instanceof Error ? parsed.error : new ValidationError(`Invalid payload for webhook event ${eventName}`, parsed.error);
    throw cause;
  }

  const typedEventName = eventName as E;
  const payload = parsed.data as WebhookPayload<typeof typedEventName>;

  return {
    event: typedEventName,
    payload,
    signature,
    matchedSecret,
    timestamp,
    rawBody: view,
    headers: normalisedHeaders,
  };
}
