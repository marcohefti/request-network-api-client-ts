import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createCurrenciesV1Api } from "../../../src/domains/currencies/v1";
import { createRequestClient } from "../../../src/request.client";
import { ValidationError } from "../../../src/validation/zod.helpers";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Currencies v1 facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });
  const legacyCurrencies = createCurrenciesV1Api(client.http);

  it("lists legacy currencies", async () => {
    const tokens = await client.currencies.legacy.list();
    expect(Array.isArray(tokens)).toBe(true);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0]?.id).toBeDefined();

    const firstOnly = await legacyCurrencies.list({ firstOnly: "true" });
    expect(firstOnly).toHaveLength(1);
    expect(firstOnly[0]?.symbol).toBe("USDC");
  });

  it("gets conversion routes for legacy currency", async () => {
    const routes = await client.currencies.legacy.getConversionRoutes("USD");
    expect(routes.currencyId).toBe("USD");
    expect(routes.conversionRoutes[0]?.symbol).toBe("DAI");
  });

  it("throws validation error on malformed legacy currency response", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v1/currencies`, () => HttpResponse.json({ invalid: true }, { status: 200 })),
    );

    await expect(client.currencies.legacy.list()).rejects.toBeInstanceOf(ValidationError);
  });

  it("maps 404 to RequestApiError for conversion routes", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v1/currencies/:currencyId/conversion-routes`, () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    await expect(client.currencies.legacy.getConversionRoutes("MISSING")).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      return true;
    });
  });
});
