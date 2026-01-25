import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../src/core/errors/request-api.error";
import { createHttpClient } from "../../src/core/http/client.factory";
import { server } from "../msw/setup";
import { TEST_BASE_URL } from "../utils/test-env";

const BAD_REQUEST = "BAD_REQUEST";
const INVALID_INPUT = "Invalid input";
const PROBLEM_BASE_URL = "http://localhost";
const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID = "req-123";
const PROBLEM_REQUEST_ID = "req-problem-1";
const DETAIL_HINT = { hint: "wrong value" } as const;

describe("HTTP error mapping", () => {
  it("maps 400 JSON error payload to RequestApiError", async () => {
    const http = createHttpClient({ baseUrl: TEST_BASE_URL });

    await expect(http.get("/bad", { meta: { captureErrorContext: true } })).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (!isRequestApiError(error)) {
        return false;
      }
      expect(error.status).toBe(400);
      expect(error.code).toBe(BAD_REQUEST);
      expect(error.message).toBe(INVALID_INPUT);
      expect(error.requestId).toBe(REQUEST_ID);
      expect(error.detail).toEqual(DETAIL_HINT);
      expect(error.errors?.[0]?.field).toBe("network");
      expect(error.meta).toMatchObject({
        request: {
          method: "GET",
          url: `${TEST_BASE_URL}/bad`,
        },
        response: {
          status: 400,
          headers: {
            [REQUEST_ID_HEADER]: REQUEST_ID,
          },
        },
      });
      return true;
    });
  });

  it("maps application/problem+json error payload to RequestApiError (operationId provided)", async () => {
    const baseUrl = PROBLEM_BASE_URL;
    server.use(
      http.get(`${baseUrl}/problem`, () =>
        HttpResponse.json(
          {
            status: 400,
            code: BAD_REQUEST,
            message: INVALID_INPUT,
            detail: DETAIL_HINT,
            errors: [{ field: "wallet", message: "Invalid Ethereum address" }],
          },
          {
            status: 400,
            headers: {
              "content-type": "application/problem+json",
              [REQUEST_ID_HEADER]: PROBLEM_REQUEST_ID,
            },
          },
        ),
      ),
    );

    const httpClient = createHttpClient({ baseUrl });

    await expect(
      httpClient.get("/problem", {
        meta: {
          operationId: "RequestControllerV2_getPaymentCalldata_v2",
          captureErrorContext: true,
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (!isRequestApiError(error)) {
        return false;
      }
      expect(error.status).toBe(400);
      expect(error.code).toBe(BAD_REQUEST);
      expect(error.message).toBe(INVALID_INPUT);
      expect(error.requestId).toBe(PROBLEM_REQUEST_ID);
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
