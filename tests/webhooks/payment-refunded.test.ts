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

const PAYMENT_REFUNDED_FIXTURE = "payment-refunded.json";
const PAYMENT_REFUNDED_EVENT = "payment.refunded" as const;

describe("webhooks.payment.refunded", () => {
  it("invokes handler for refunds", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentRefundedHandler>();
    webhooks.events.onPaymentRefunded(dispatcher, handler);

    const payload = loadFixture(PAYMENT_REFUNDED_FIXTURE) as webhooks.events.PaymentRefundedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledOnce();
    const [eventPayload, context] = handler.mock.calls[0];
    expect(eventPayload.event).toBe(PAYMENT_REFUNDED_EVENT);
    expect(eventPayload.refundedTo.toLowerCase()).toContain("742d35cc");
    expect(eventPayload.refundAmount).toBe("100.0");
    expect(context.dispatchContext.req).toBe(req);
    expect(next).toHaveBeenCalledOnce();
    expect(res.headersSent).toBe(false);
  });

  it("parses refund events via helpers", () => {
    const payload = loadFixture(PAYMENT_REFUNDED_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isPaymentRefundedEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertPaymentRefundedEvent(parsed);
    }).not.toThrow();
  });
});
