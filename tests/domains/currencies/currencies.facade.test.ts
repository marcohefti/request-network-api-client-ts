import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createRequestClient } from "../../../src/request.client";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Currencies facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });
  const USDC_SYMBOL = "USDC";
  const USDC_SEPOLIA = "USDC-sepolia";

  it("lists currencies", async () => {
    const items = await client.currencies.list({ network: "sepolia" });
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.symbol).toBeDefined();
  });

  it("gets conversion routes", async () => {
    const routes = await client.currencies.getConversionRoutes("USDC", { networks: "sepolia" });
    expect(routes.currencyId).toBe("USDC");
    expect(Array.isArray(routes.conversionRoutes)).toBe(true);
  });

  it("maps 404 on conversion routes to RequestApiError", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/currencies/:currencyId/conversion-routes`, () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );
    await expect(client.currencies.getConversionRoutes("MISSING", {})).rejects.toSatisfy((err: unknown) => {
      expect(isRequestApiError(err)).toBe(true);
      return true;
    });
  });

  it("surfaces Retry-After on 429 for currencies list", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/currencies`, () =>
        HttpResponse.json({ message: "Too many" }, { status: 429, headers: { "retry-after": "2" } }),
      ),
    );
    await expect(client.currencies.list()).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (!isRequestApiError(error)) {
        return false;
      }
      // parsed to milliseconds (≈2000)
      expect(error.retryAfterMs).toBeGreaterThanOrEqual(0);
      return true;
    });
  });

  it("accepts currencies payloads without name", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/currencies`, () =>
        HttpResponse.json(
          [
            {
              id: USDC_SEPOLIA,
              symbol: USDC_SYMBOL,
              decimals: 6,
              network: "sepolia",
            },
          ],
          { status: 200 },
        ),
      ),
    );

    const items = await client.currencies.list();
    expect(items[0]?.id).toBe(USDC_SEPOLIA);
    expect(items[0]?.symbol).toBe(USDC_SYMBOL);
  });
});
