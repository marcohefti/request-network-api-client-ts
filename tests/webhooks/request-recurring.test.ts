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

const REQUEST_RECURRING_FIXTURE = "request-recurring.json";
const REQUEST_RECURRING_EVENT = "request.recurring" as const;

describe("webhooks.request.recurring", () => {
  it("invokes handler when recurring request is created", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.RequestRecurringHandler>();
    webhooks.events.onRequestRecurring(dispatcher, handler);

    const payload = loadFixture(REQUEST_RECURRING_FIXTURE) as webhooks.events.RequestRecurringPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledOnce();
    const [[eventPayload, context]] = handler.mock.calls;
    expect(eventPayload.event).toBe(REQUEST_RECURRING_EVENT);
    expect(eventPayload.originalRequestId).toBe("req_original1234567890");
    expect(context.dispatchContext.req).toBe(req);
    expect(next).toHaveBeenCalledOnce();
    expect(res.headersSent).toBe(false);
  });

  it("supports event predicates", () => {
    const payload = loadFixture(REQUEST_RECURRING_FIXTURE);
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isRequestRecurringEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertRequestRecurringEvent(parsed);
    }).not.toThrow();
  });
});
