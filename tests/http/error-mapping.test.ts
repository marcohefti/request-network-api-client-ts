import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../src/core/errors/request-api.error";
import { createHttpClient } from "../../src/core/http/client.factory";
import { TEST_BASE_URL } from "../utils/test-env";

describe("HTTP error mapping", () => {
  it("maps 400 JSON error payload to RequestApiError", async () => {
    const http = createHttpClient({ baseUrl: TEST_BASE_URL });

    await expect(http.get("/bad")).rejects.toSatisfy((error: unknown) => {
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
      return true;
    });
  });
});
