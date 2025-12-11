import { describe, expect, it } from "vitest";

import { buildPath } from "../../src/core/http/path.builder";

describe("buildPath", () => {
  it("replaces placeholders with encoded values", () => {
    const result = buildPath("/v2/requests/{requestId}/payouts/{payoutId}", {
      requestId: "req 123",
      payoutId: "pay/abc",
    });
    expect(result).toBe("/v2/requests/req%20123/payouts/pay%2Fabc");
  });

  it("falls back to empty string when parameters are missing", () => {
    const result = buildPath("/v2/requests/{requestId}/metadata/{key}", {});
    expect(result).toBe("/v2/requests//metadata/");
  });
});
