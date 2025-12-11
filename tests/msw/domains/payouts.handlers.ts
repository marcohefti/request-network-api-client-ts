import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const payoutsHandlers = [
  http.post(`${TEST_BASE_URL}/v2/payouts`, () => HttpResponse.json({ requestId: "payout-1" }, { status: 201 })),
  http.post(`${TEST_BASE_URL}/v2/payouts/batch`, () =>
    HttpResponse.json(
      {
        ERC20BatchPaymentTransaction: {
          to: "0xbridge",
          data: "0xdead",
          value: { type: "BigNumber", hex: "0x0" },
        },
      },
      { status: 201 },
    ),
  ),
  http.get(`${TEST_BASE_URL}/v2/payouts/recurring/:id`, ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ id, status: "active" });
  }),
  http.post(`${TEST_BASE_URL}/v2/payouts/recurring/:id`, () =>
    HttpResponse.json({ accepted: true }, { status: 201 }),
  ),
  http.patch(`${TEST_BASE_URL}/v2/payouts/recurring/:id`, () =>
    HttpResponse.json({ paused: true }, { status: 200 }),
  ),
];
