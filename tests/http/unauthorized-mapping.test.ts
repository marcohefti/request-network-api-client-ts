import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../src/core/errors/request-api.error";
import { createHttpClient } from "../../src/core/http/client.factory";
import { server } from "../msw/setup";

describe("401/403 mapping", () => {
  it("maps 401 without JSON body", async () => {
    const baseUrl = "http://localhost";
    server.use(
      http.get(`${baseUrl}/unauth`, () => HttpResponse.text("", { status: 401 })),
    );
    const httpClient = createHttpClient({ baseUrl });
    await expect(httpClient.get("/unauth", { meta: { captureErrorContext: true } })).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (!isRequestApiError(error)) {
        return false;
      }
      expect(error.status).toBe(401);
      expect(error.code).toBe("HTTP_401");
      expect(error.meta).toMatchObject({
        request: {
          method: "GET",
          url: `${baseUrl}/unauth`,
        },
        response: {
          status: 401,
        },
      });
      return true;
    });
  });
});
