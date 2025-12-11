import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const payHandlers = [
  http.post(`${TEST_BASE_URL}/v1/pay`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    const payee = typeof payload.payee === "string" ? payload.payee : "payee";
    return HttpResponse.json({ requestId: `legacy-pay-${payee.slice(-4)}` }, { status: 201 });
  }),
];
