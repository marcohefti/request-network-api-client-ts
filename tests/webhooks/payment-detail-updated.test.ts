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

const PAYMENT_DETAIL_EVENT = "payment_detail.updated" as const;

const STATUS_FIXTURES = {
  approved: "payment-detail-approved.json",
  failed: "payment-detail-failed.json",
  pending: "payment-detail-pending.json",
  verified: "payment-detail-verified.json",
} as const;

describe("webhooks.payment_detail.updated", () => {
  it("invokes handler with detailed payload and status predicates", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentDetailUpdatedHandler>();
    webhooks.events.onPaymentDetailUpdated(dispatcher, handler);

    const payload = loadFixture(STATUS_FIXTURES.approved) as webhooks.events.PaymentDetailUpdatedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledTimes(1);
    const [[eventPayload, context]] = handler.mock.calls;
    expect(eventPayload.event).toBe(PAYMENT_DETAIL_EVENT);
    expect(eventPayload.paymentAccountId).toBe("acct_approved_123");
    expect(webhooks.events.isPaymentDetailApproved(eventPayload)).toBe(true);
    expect(webhooks.events.isPaymentDetailRejected(eventPayload)).toBe(false);
    expect(context.dispatchContext.req).toBe(req);
    expect(req.webhook?.payload.status).toBe("approved");
    expect(next).toHaveBeenCalledOnce();
  });

  it("covers all status predicates", () => {
    const approved = loadFixture(STATUS_FIXTURES.approved) as webhooks.events.PaymentDetailUpdatedPayload;
    const failed = loadFixture(STATUS_FIXTURES.failed) as webhooks.events.PaymentDetailUpdatedPayload;
    const pending = loadFixture(STATUS_FIXTURES.pending) as webhooks.events.PaymentDetailUpdatedPayload;
    const verified = loadFixture(STATUS_FIXTURES.verified) as webhooks.events.PaymentDetailUpdatedPayload;

    expect(webhooks.events.isPaymentDetailApproved(approved)).toBe(true);
    expect(webhooks.events.isPaymentDetailRejected(approved)).toBe(false);
    expect(webhooks.events.isPaymentDetailPending(approved)).toBe(false);

    expect(webhooks.events.isPaymentDetailApproved(failed)).toBe(false);
    expect(webhooks.events.isPaymentDetailRejected(failed)).toBe(true);
    expect(webhooks.events.isPaymentDetailPending(failed)).toBe(false);

    expect(webhooks.events.isPaymentDetailPending(pending)).toBe(true);

    expect(webhooks.events.isPaymentDetailVerified(verified)).toBe(true);
    expect(webhooks.events.isPaymentDetailApproved(verified)).toBe(false);
    expect(webhooks.events.isPaymentDetailRejected(verified)).toBe(false);
    expect(webhooks.events.isPaymentDetailPending(verified)).toBe(false);
  });

  it("rejects tampered payloads", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.PaymentDetailUpdatedHandler>();
    webhooks.events.onPaymentDetailUpdated(dispatcher, handler);

    const payload = loadFixture(STATUS_FIXTURES.failed) as webhooks.events.PaymentDetailUpdatedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const tamperedRawBody = serialisePayload({ ...payload, status: "approved" });
    const req = createRequest(tamperedRawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "invalid_webhook_signature", reason: "invalid_signature" });
    expect(next).not.toHaveBeenCalled();
  });

  it("type guards narrow parsed events", () => {
    const payload = loadFixture(STATUS_FIXTURES.pending) as webhooks.events.PaymentDetailUpdatedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isPaymentDetailUpdatedEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertPaymentDetailUpdatedEvent(parsed);
    }).not.toThrow();
  });
});
