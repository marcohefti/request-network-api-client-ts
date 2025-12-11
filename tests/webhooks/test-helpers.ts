import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { webhooks } from "../../src";

export const TEST_SECRET = webhooks.testing.DEFAULT_TEST_WEBHOOK_SECRET;

const require = createRequire(import.meta.url);
const contractsPackagePath = require.resolve("@request/request-network-api-contracts/package.json");
const FIXTURES_DIR = path.join(path.dirname(contractsPackagePath), "fixtures", "webhooks");

export function loadFixture(name: string): Record<string, unknown> {
  const raw = readFileSync(path.join(FIXTURES_DIR, name), "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

export function serialisePayload(payload: unknown): Buffer {
  return Buffer.from(JSON.stringify(payload));
}

export function signPayload(body: Buffer, secret: string = TEST_SECRET): string {
  return webhooks.testing.generateTestWebhookSignature(body, secret);
}

export type MockResponse = webhooks.testing.MockWebhookResponse;

export function createRequest(rawBody: Buffer, signature: string): webhooks.WebhookRequest {
  return {
    headers: {
      [webhooks.DEFAULT_SIGNATURE_HEADER]: signature,
    },
    rawBody,
    body: rawBody,
  } as unknown as webhooks.WebhookRequest;
}

export function createResponse(): MockResponse {
  return webhooks.testing.createMockWebhookResponse();
}

export async function invokeMiddleware(
  handler: RequestHandler,
  req: webhooks.WebhookRequest,
  res: MockResponse,
  next: NextFunction,
): Promise<void> {
  const runnable = handler as unknown as (request: Request, response: Response, nextFn: NextFunction) => Promise<void>;
  await runnable(req as unknown as Request, res as unknown as Response, next);
}
