import { describe, expect, it } from "vitest";

import { parseRetryAfter } from "../../src/core/errors/request-api.error";

describe("Retry-After parsing", () => {
  it("parses delta-seconds", () => {
    const ms = parseRetryAfter("3");
    expect(ms).toBe(3000);
  });

  it("parses HTTP-date", () => {
    const future = new Date(Date.now() + 1500).toUTCString();
    const ms = parseRetryAfter(future);
    expect(ms).toBeDefined();
    if (ms === undefined) {
      return;
    }
    expect(ms).toBeGreaterThanOrEqual(0);
    // Upper bound loose due to timer granularity
    expect(ms).toBeLessThan(5000);
  });
});
