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

const PAYMENT_CONFIRMED_FIXTURE = "payment-confirmed.json";
const PAYMENT_CONFIRMED_EVENT = "payment.confirmed" as const;

describe("webhooks.payment.confirmed", () => {
  it("invokes registered handler with typed payload and context", async () => {
    const payload = loadFixture(PAYMENT_CONFIRMED_FIXTURE) as webhooks.events.PaymentConfirmedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentConfirmedHandler>();

    webhooks.events.onPaymentConfirmed(dispatcher, handler);

    const middleware = webhooks.createWebhookMiddleware({
      secret: TEST_SECRET,
      dispatcher,
    });

    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledTimes(1);
    const [[eventPayload, context]] = handler.mock.calls;
    expect(eventPayload.event).toBe(PAYMENT_CONFIRMED_EVENT);
    expect(eventPayload.requestId).toBe(payload.requestId);
    expect(eventPayload.paymentProcessor).toBe("request-network");
    expect(context.event.signature).toBe(signature);
    expect(context.event.payload.requestId).toBe(payload.requestId);
    expect(context.dispatchContext.req).toBe(req);
    expect(context.dispatchContext.res).toBe(res);

    expect(req.webhook?.event).toBe(PAYMENT_CONFIRMED_EVENT);
    expect(req.webhook?.payload.requestId).toBe(payload.requestId);
    expect(next).toHaveBeenCalledOnce();
    expect(res.headersSent).toBe(false);
  });

  it("rejects tampered payloads with signature error", async () => {
    const payload = loadFixture(PAYMENT_CONFIRMED_FIXTURE) as webhooks.events.PaymentConfirmedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentConfirmedHandler>();
    webhooks.events.onPaymentConfirmed(dispatcher, handler);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });

    const tamperedRawBody = serialisePayload({ ...payload, totalAmountPaid: "5.00" });
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

  it("dispatches handlers in registration order", async () => {
    const payload = loadFixture(PAYMENT_CONFIRMED_FIXTURE) as webhooks.events.PaymentConfirmedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const dispatcher = webhooks.createWebhookDispatcher();
    const calls: string[] = [];

    webhooks.events.onPaymentConfirmed(dispatcher, (eventPayload) => {
      const requestId = String(eventPayload.requestId ?? "");
      calls.push(`first:${requestId}`);
    });
    webhooks.events.onPaymentConfirmed(dispatcher, (_, ctx) => {
      const sig = ctx.event.signature ?? "";
      calls.push(`second:${sig}`);
    });

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    await dispatcher.dispatch(parsed, { source: "unit-test" });

    const expectedRequestId = String(payload.requestId ?? "");

    expect(calls).toEqual([`first:${expectedRequestId}`, `second:${signature}`]);
  });

  it("type guards narrow payment.confirmed events", () => {
    const payload = loadFixture(PAYMENT_CONFIRMED_FIXTURE) as webhooks.events.PaymentConfirmedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isPaymentConfirmedEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertPaymentConfirmedEvent(parsed);
    }).not.toThrow();
    expect(webhooks.WEBHOOK_EVENT_NAMES).toContain(PAYMENT_CONFIRMED_EVENT);
  });
});
