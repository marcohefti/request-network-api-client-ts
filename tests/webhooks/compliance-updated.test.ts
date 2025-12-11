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

const FIXTURES = {
  approved: "compliance-approved.json",
  rejected: "compliance-rejected.json",
  pending: "compliance-pending.json",
} as const;

describe("webhooks.compliance.updated", () => {
  it("invokes handler and exposes summary helpers", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.ComplianceUpdatedHandler>();
    webhooks.events.onComplianceUpdated(dispatcher, handler);

    const payload = loadFixture(FIXTURES.approved) as webhooks.events.ComplianceUpdatedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const req = createRequest(rawBody, signature);
    const res = createResponse();
    const next = vi.fn();

    await invokeMiddleware(middleware, req, res, next);

    expect(handler).toHaveBeenCalledTimes(1);
    const [[eventPayload]] = handler.mock.calls;
    expect(webhooks.events.isKycComplete(eventPayload)).toBe(true);
    expect(webhooks.events.isAgreementRejected(eventPayload)).toBe(false);
    expect(webhooks.events.complianceStatusSummary(eventPayload)).toContain("KYC: approved");
    expect(webhooks.events.complianceStatusSummary(eventPayload)).toContain("Agreement: signed");
    expect(eventPayload.isCompliant).toBe(true);
    expect(req.webhook?.payload.kycStatus).toBe("approved");
    expect(next).toHaveBeenCalledOnce();
  });

  it("identifies rejected agreement states", () => {
    const rejected = loadFixture(FIXTURES.rejected) as webhooks.events.ComplianceUpdatedPayload;
    expect(webhooks.events.isAgreementRejected(rejected)).toBe(true);

    const failedAgreement = { ...rejected, agreementStatus: "failed" as const };
    expect(webhooks.events.isAgreementRejected(failedAgreement)).toBe(true);

    const pending = loadFixture(FIXTURES.pending) as webhooks.events.ComplianceUpdatedPayload;
    expect(webhooks.events.isAgreementRejected(pending)).toBe(false);
    expect(webhooks.events.isKycComplete(pending)).toBe(false);
  });

  it("rejects tampered payloads", async () => {
    const dispatcher = webhooks.createWebhookDispatcher();
    const handler = vi.fn<webhooks.events.ComplianceUpdatedHandler>();
    webhooks.events.onComplianceUpdated(dispatcher, handler);

    const payload = loadFixture(FIXTURES.rejected) as webhooks.events.ComplianceUpdatedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const middleware = webhooks.createWebhookMiddleware({ secret: TEST_SECRET, dispatcher });
    const tamperedRawBody = serialisePayload({ ...payload, agreementStatus: "completed" });
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
    const payload = loadFixture(FIXTURES.pending) as webhooks.events.ComplianceUpdatedPayload;
    const rawBody = serialisePayload(payload);
    const signature = signPayload(rawBody, TEST_SECRET);

    const parsed = webhooks.parseWebhookEvent({
      rawBody,
      headers: {
        "x-request-network-signature": signature,
      },
      secret: TEST_SECRET,
    });

    expect(webhooks.events.isComplianceUpdatedEvent(parsed)).toBe(true);
    expect(() => {
      webhooks.events.assertComplianceUpdatedEvent(parsed);
    }).not.toThrow();
  });
});
