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

const PAYMENT_FAILED_FIXTURE = "payment-failed.json";
const PAYMENT_FAILED_EVENT = "payment.failed" as const;

describe("webhooks.payment.failed", () => {
  it("invokes handler with failure metadata", async () => {
    const payload = loadFixture(PAYMENT_FAILED_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentFailedHandler>();

    webhooks.events.onPaymentFailed(dispatcher, handler);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });

    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledTimes(1);
    const [[eventPayload, context]] = handler.mock.calls;
    expect(eventPayload.event).toBe(PAYMENT_FAILED_EVENT);
    expect(eventPayload.subStatus).toBe("insufficient_funds");
    expect(eventPayload.failureReason).toBe("Insufficient fiat liquidity");
    expect(eventPayload.retryAfter).toBe("2025-08-29T18:25:45.995Z");
    expect(context.event.signature).toBe(signature);
    expect(context.dispatchContext.req).toBe(req);

    expect(req.webhook?.event).toBe(PAYMENT_FAILED_EVENT);
    expect(next).toHaveBeenCalledOnce();
    expect(res.headersSent).toBe(false);
  });

  it("rejects tampered failures", async () => {
    const payload = loadFixture(PAYMENT_FAILED_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentFailedHandler>();
    webhooks.events.onPaymentFailed(dispatcher, handler);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });

    const tamperedPayload = { ...payload, failureReason: "Different" };
    const tamperedRawBody = serialisePayload(tamperedPayload);
    const req = createRequest(tamperedRawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "invalid_webhook_signature", reason: "invalid_signature" });
    expect(next).not.toHaveBeenCalled();
    expect(req.webhook).toBeUndefined();
  });

  it("propagates handler errors during dispatch", async () => {
    const payload = loadFixture(PAYMENT_FAILED_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const dispatcher = webhooks.createWebhookDispatcher();
    const error = new Error("boom");

    webhooks.events.onPaymentFailed(dispatcher, () => {
      throw error;
    });

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    await expect(dispatcher.dispatch(parsed, { source: "unit-test" })).rejects.toBe(error);
  });

  it("narrow subStatus with helper predicates", () => {
    const payload = loadFixture(PAYMENT_FAILED_FIXTURE);
    const bouncedPayload = { ...payload, subStatus: "bounced" as const };
    const failedPayload = { ...payload, subStatus: "failed" as const };

    if (webhooks.events.isBouncedFailure(bouncedPayload)) {
      expect(bouncedPayload.subStatus).toBe("bounced");
    } else {
      throw new Error("Expected bounced payload to narrow");
    }

    expect(webhooks.events.isBouncedFailure(payload)).toBe(false);
    expect(webhooks.events.isInsufficientFundsFailure(payload)).toBe(true);
    expect(webhooks.events.isInsufficientFundsFailure(failedPayload)).toBe(false);

    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);
    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isPaymentFailedEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertPaymentFailedEvent(parsed);
    }).not.toThrow();
  });
});
