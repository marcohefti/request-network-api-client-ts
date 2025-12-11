import { Buffer } from "node:buffer";
import { createHmac } from "node:crypto";

import type { WebhookRequest } from "./middleware.webhook";
import { DEFAULT_SIGNATURE_ALGORITHM, DEFAULT_SIGNATURE_HEADER } from "./signature.webhook";

export const DEFAULT_TEST_WEBHOOK_SECRET = "whsec_test_secret";

let inMemoryBypass = false;

function toBuffer(body: unknown): Buffer {
  if (typeof body === "string") {
    return Buffer.from(body, "utf8");
  }
  if (body instanceof ArrayBuffer) {
    return Buffer.from(body);
  }
  if (ArrayBuffer.isView(body as ArrayBufferView)) {
    const view = body as ArrayBufferView;
    return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
  }
  return Buffer.from(JSON.stringify(body));
}

export function generateTestWebhookSignature(
  rawBody: ArrayBuffer | ArrayBufferView | string | object,
  secret: string = DEFAULT_TEST_WEBHOOK_SECRET,
): string {
  const buffer = toBuffer(rawBody);
  return createHmac(DEFAULT_SIGNATURE_ALGORITHM, secret).update(buffer).digest("hex");
}

export function isWebhookVerificationBypassed(): boolean {
  if (typeof process !== "undefined" && process.env.REQUEST_WEBHOOK_DISABLE_VERIFICATION === "true") {
    return true;
  }
  return inMemoryBypass;
}

export function setWebhookVerificationBypass(enabled: boolean): void {
  inMemoryBypass = enabled;
}

export async function withWebhookVerificationDisabled<T>(fn: () => T | Promise<T>): Promise<T> {
  const previous = inMemoryBypass;
  inMemoryBypass = true;
  try {
    return await fn();
  } finally {
    inMemoryBypass = previous;
  }
}

export interface CreateMockWebhookRequestOptions {
  payload: unknown;
  secret?: string;
  headerName?: string;
  headers?: Record<string, string>;
}

export interface MockWebhookResponse {
  statusCode: number;
  body: unknown;
  headersSent: boolean;
  status(code: number): this;
  json(payload: unknown): this;
  send(payload: unknown): this;
}

export function createMockWebhookRequest(options: CreateMockWebhookRequestOptions): WebhookRequest {
  const { payload, secret = DEFAULT_TEST_WEBHOOK_SECRET, headerName = DEFAULT_SIGNATURE_HEADER, headers } = options;
  const rawBody = toBuffer(payload);
  const signature = generateTestWebhookSignature(rawBody, secret);
  const req = {
    headers: {
      ...(headers ?? {}),
      [headerName]: signature,
    },
    rawBody,
    body: rawBody,
  } as unknown as WebhookRequest;
  return req;
}

export function createMockWebhookResponse(): MockWebhookResponse {
  return {
    statusCode: 200,
    body: undefined,
    headersSent: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      this.headersSent = true;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      this.headersSent = true;
      return this;
    },
  };
}
