import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const payeeDestinationHandlers = [
  http.get(`${TEST_BASE_URL}/v2/payee-destination/signing-data`, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json(
      {
        nonce: "nonce-1",
        walletAddress: url.searchParams.get("walletAddress"),
        action: url.searchParams.get("action"),
        tokenAddress: url.searchParams.get("tokenAddress"),
        chainId: url.searchParams.get("chainId"),
      },
      { status: 200 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v2/payee-destination`, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json(
      {
        id: "base:0xabc:0xdef",
        walletAddress: url.searchParams.get("walletAddress"),
        active: true,
      },
      { status: 200 },
    );
  }),
  http.post(`${TEST_BASE_URL}/v2/payee-destination`, async ({ request }) => {
    const payload = (await request.json()) as { nonce?: string };
    return HttpResponse.json({ created: true, nonce: payload.nonce ?? null }, { status: 201 });
  }),
  http.get(`${TEST_BASE_URL}/v2/payee-destination/:destinationId`, ({ params }) => {
    const { destinationId } = params as { destinationId: string };
    if (destinationId === "missing") {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }
    return HttpResponse.json({ destinationId, active: true }, { status: 200 });
  }),
  http.delete(`${TEST_BASE_URL}/v2/payee-destination/:destinationId`, async ({ params, request }) => {
    const { destinationId } = params as { destinationId: string };
    const payload = (await request.json()) as { nonce?: string };
    return HttpResponse.json(
      { deactivated: true, destinationId, nonce: payload.nonce ?? null },
      { status: 200 },
    );
  }),
];
