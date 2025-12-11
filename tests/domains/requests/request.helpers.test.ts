import { describe, expect, it } from "vitest";

import { normalizeRequestStatusResponse, buildRequestQuery } from "../../../src/domains/requests/request.helpers";
import type { operations } from "../../../src/generated/openapi-types";

type StatusApiResponseV2 =
  operations["RequestControllerV2_getRequestStatus_v2"]["responses"][200]["content"]["application/json"];

function buildRawStatus(overrides: Partial<StatusApiResponseV2> = {}): StatusApiResponseV2 {
  return {
    requestId: "req-1",
    paymentReference: "ref-1",
    txHash: null,
    hasBeenPaid: false,
    status: "pending",
    ...overrides,
  };
}

describe("request.helpers.buildRequestQuery", () => {
  it("returns undefined when input is empty or only undefined values", () => {
    expect(buildRequestQuery()).toBeUndefined();
    expect(buildRequestQuery({ wallet: undefined, amount: undefined })).toBeUndefined();
  });

  it("preserves truthy query primitives and arrays", () => {
    const query = buildRequestQuery({
      wallet: "0xabc",
      amount: "10",
      includePaid: true,
      routes: ["direct", "bridge"],
    });

    expect(query).toStrictEqual({
      wallet: "0xabc",
      amount: "10",
      includePaid: true,
      routes: ["direct", "bridge"],
    });
  });
});

describe("request.helpers.normalizeRequestStatusResponse", () => {
  it("marks paid status when hasBeenPaid flag is true", () => {
    const result = normalizeRequestStatusResponse(buildRawStatus({ hasBeenPaid: true, status: "completed" }));
    expect(result.kind).toBe("paid");
    expect(result.hasBeenPaid).toBe(true);
  });

  it("maps cancelled and overdue variants", () => {
    const cancelled = normalizeRequestStatusResponse(buildRawStatus({ status: "canceled" }));
    expect(cancelled.kind).toBe("cancelled");

    const overdue = normalizeRequestStatusResponse(buildRawStatus({ status: "expired" }));
    expect(overdue.kind).toBe("overdue");
  });

  it("falls back to pending when status missing and unknown otherwise", () => {
    const pending = normalizeRequestStatusResponse(buildRawStatus({ status: undefined }));
    expect(pending.kind).toBe("pending");

    const unknown = normalizeRequestStatusResponse(buildRawStatus({ status: "mystery" }));
    expect(unknown.kind).toBe("unknown");
  });
});
