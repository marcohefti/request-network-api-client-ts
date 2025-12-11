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

const PAYMENT_PARTIAL_FIXTURE = "payment-partial.json";
const PAYMENT_PARTIAL_EVENT = "payment.partial" as const;

describe("webhooks.payment.partial", () => {
  it("invokes handler for partial payments", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentPartialHandler>();
    webhooks.events.onPaymentPartial(dispatcher, handler);

    const payload = loadFixture(PAYMENT_PARTIAL_FIXTURE) as webhooks.events.PaymentPartialPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledOnce();
    const [[eventPayload, context]] = handler.mock.calls;
    expect(eventPayload.event).toBe(PAYMENT_PARTIAL_EVENT);
    expect(eventPayload.amount).toBe("50.0");
    expect(context.dispatchContext.req).toBe(req);
    expect(next).toHaveBeenCalledOnce();
    expect(res.headersSent).toBe(false);
  });

  it("parses partial payments via helpers", () => {
    const payload = loadFixture(PAYMENT_PARTIAL_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isPaymentPartialEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertPaymentPartialEvent(parsed);
    }).not.toThrow();
  });
});
