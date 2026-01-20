import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../src/core/errors/request-api.error";
import { createHttpClient } from "../../src/core/http/client.factory";
import { TEST_BASE_URL } from "../utils/test-env";

describe("HTTP error mapping", () => {
  it("maps 400 JSON error payload to RequestApiError", async () => {
    const http = createHttpClient({ baseUrl: TEST_BASE_URL });

    await expect(http.get("/bad", { meta: { captureErrorContext: true } })).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (!isRequestApiError(error)) {
        return false;
      }
      expect(error.status).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toBe("Invalid input");
      expect(error.requestId).toBe("req-123");
      expect(error.detail).toEqual({ hint: "wrong value" });
      expect(error.errors?.[0]?.field).toBe("network");
      expect(error.meta).toMatchObject({
        request: {
          method: "GET",
          url: `${TEST_BASE_URL}/bad`,
        },
        response: {
          status: 400,
          headers: {
            "x-request-id": "req-123",
          },
        },
      });
      return true;
    });
  });

  it("redacts x-api-key from error metadata", async () => {
    const http = createHttpClient({ baseUrl: TEST_BASE_URL, apiKey: "super-secret" });

    await expect(http.get("/bad", { meta: { captureErrorContext: true } })).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (!isRequestApiError(error)) {
        return false;
      }
      const meta = error.meta as { request?: { headers?: Record<string, string> } } | undefined;
      expect(meta?.request?.headers?.["x-api-key"]).toBe("<redacted>");
      return true;
    });
  });
});
