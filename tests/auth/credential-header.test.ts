import { describe, expect, it } from "vitest";

import { buildCredentialHeaders } from "../../src/core/auth/credential-header.builder";

const API_KEY = "api-123";
const CLIENT_ID = "client-abc";
const ORIGIN = "https://example.com";

describe("buildCredentialHeaders", () => {
  it("builds headers only for provided credentials", () => {
    expect(
      buildCredentialHeaders({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        origin: ORIGIN,
      }),
    ).toEqual({
      "x-api-key": API_KEY,
      "x-client-id": CLIENT_ID,
      Origin: ORIGIN,
    });
  });

  it("omits headers for missing credentials", () => {
    expect(buildCredentialHeaders({})).toEqual({});
  });
});
