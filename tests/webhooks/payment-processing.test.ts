import { describe, expect, it, vi } from "vitest";

import {
  TEST_SECRET,
  createRequest,
  createResponse,
  invokeMiddleware,
  loadFixture,
  serialisePayload,
  signPayload,
} from "./test-helpers";
import { webhooks } from "../../src";

const PAYMENT_PROCESSING_FIXTURE = "payment-processing.json";
const PAYMENT_PROCESSING_EVENT = "payment.processing" as const;

const STAGES = webhooks.events.PAYMENT_PROCESSING_STAGES;

describe("webhooks.payment.processing", () => {
  it("invokes handler with stage metadata and helper utilities", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentProcessingHandler>();
    webhooks.events.onPaymentProcessing(dispatcher, handler);

    const payload = loadFixture(PAYMENT_PROCESSING_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledTimes(1);
    const [[eventPayload, context]] = handler.mock.calls;
    expect(eventPayload.event).toBe(PAYMENT_PROCESSING_EVENT);
    expect(eventPayload.subStatus).toBe("processing");
    expect(webhooks.events.processingStageLabel(eventPayload.subStatus)).toContain("Processing");
    expect(webhooks.events.isProcessingTerminalStatus(eventPayload.subStatus)).toBe(false);
    expect(webhooks.events.isRetryRequired(eventPayload.subStatus)).toBe(false);
    expect(context.dispatchContext.req).toBe(req);
    expect(req.webhook?.event).toBe(PAYMENT_PROCESSING_EVENT);
    expect(next).toHaveBeenCalledOnce();
    expect(res.headersSent).toBe(false);
  });

  it("evaluates all stages for terminal and retry helpers", () => {
    const terminal = new Set<string>();
    const retryStages: string[] = [];
    for (const stage of STAGES) {
      if (webhooks.events.isProcessingTerminalStatus(stage)) {
        terminal.add(stage);
      }
      if (webhooks.events.isRetryRequired(stage)) {
        retryStages.push(stage);
      }
      expect(webhooks.events.processingStageLabel(stage)).toBeDefined();
    }

    expect(terminal).toEqual(new Set(["fiat_sent", "bounced", "retry_required"]));
    expect(retryStages).toEqual(["retry_required"]);
  });

  it("rejects tampered payloads", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentProcessingHandler>();
    webhooks.events.onPaymentProcessing(dispatcher, handler);

    const payload = loadFixture(PAYMENT_PROCESSING_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const tamperedRawBody = serialisePayload({ ...payload, subStatus: "sending_fiat" });
    const req = createRequest(tamperedRawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "invalid_webhook_signature", reason: "invalid_signature" });
    expect(next).not.toHaveBeenCalled();
  });

  it("throws on unsupported stage values", () => {
    const payload = { ...loadFixture(PAYMENT_PROCESSING_FIXTURE), subStatus: "unknown_stage" };
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    expect(() =>
      webhooks.parseWebhookEvent({
        rawBody,
        headers: {
          "x-request-network-signature": signature,
        },
        secret: TEST_SECRET,
      }),
    ).toThrowError(/webhook event payment\.processing/i);
  });

  it("type guards narrow parsed events", () => {
    const payload = loadFixture(PAYMENT_PROCESSING_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isPaymentProcessingEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertPaymentProcessingEvent(parsed);
    }).not.toThrow();
  });
});
