import { describe, expect, it } from "vitest";

import { shouldLog } from "../../src/core/http/interceptors/logger.utils";

describe("shouldLog", () => {
  it("respects log level hierarchy", () => {
    expect(shouldLog("debug", "info")).toBe(true);
    expect(shouldLog("info", "debug")).toBe(false);
    expect(shouldLog("error", "error")).toBe(true);
    expect(shouldLog("silent", "error")).toBe(false);
  });
});
