import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

const STATUS_COMPLETED = "completed";
const STATUS_PENDING = "pending";
const STATUS_APPROVED = "approved";
const STATUS_NOT_STARTED = "not_started";
const BANK_CHASE = "Chase";
const BANK_MONZO = "Monzo";
const AGREEMENT_URL = "https://compliance.example/agreement";
const KYC_URL = "https://compliance.example/kyc";

export const payerHandlers = [
  http.post(`${TEST_BASE_URL}/v1/payer`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      agreementUrl: AGREEMENT_URL,
      kycUrl: KYC_URL,
      status: { agreementStatus: STATUS_NOT_STARTED, kycStatus: STATUS_NOT_STARTED },
      userId: payload.clientUserId ?? "user-1",
    });
  }),
  http.get(`${TEST_BASE_URL}/v1/payer/:clientUserId`, ({ params }) => {
    const { clientUserId } = params as { clientUserId: string };
    return HttpResponse.json({
      kycStatus: STATUS_COMPLETED,
      agreementStatus: STATUS_COMPLETED,
      isCompliant: true,
      userId: `uuid-${clientUserId}`,
    });
  }),
  http.patch(`${TEST_BASE_URL}/v1/payer/:clientUserId`, () =>
    HttpResponse.json({ success: true }, { status: 200 }),
  ),
  http.post(`${TEST_BASE_URL}/v1/payer/:clientUserId/payment-details`, ({ params }) => {
    const { clientUserId } = params as { clientUserId: string };
    return HttpResponse.json(
      {
        payment_detail: {
          id: "pd-1",
          userId: clientUserId,
          bankName: BANK_CHASE,
          status: STATUS_APPROVED,
        },
      },
      { status: 201 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v1/payer/:clientUserId/payment-details`, ({ params }) => {
    const { clientUserId } = params as { clientUserId: string };
    return HttpResponse.json(
      {
        paymentDetails: [
          {
            id: "pd-1",
            userId: clientUserId,
            bankName: BANK_CHASE,
            status: STATUS_APPROVED,
          },
        ],
      },
      { status: 200 },
    );
  }),
  http.post(`${TEST_BASE_URL}/v2/payer`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      agreementUrl: AGREEMENT_URL,
      kycUrl: KYC_URL,
      status: { agreementStatus: STATUS_NOT_STARTED, kycStatus: STATUS_NOT_STARTED },
      userId: payload.clientUserId ?? "user-2",
    });
  }),
  http.get(`${TEST_BASE_URL}/v2/payer/:clientUserId`, ({ params }) => {
    const { clientUserId } = params as { clientUserId: string };
    return HttpResponse.json({
      kycStatus: STATUS_COMPLETED,
      agreementStatus: STATUS_COMPLETED,
      isCompliant: true,
      userId: `uuid-v2-${clientUserId}`,
    });
  }),
  http.patch(`${TEST_BASE_URL}/v2/payer/:clientUserId`, () =>
    HttpResponse.json({ success: true }, { status: 200 }),
  ),
  http.post(`${TEST_BASE_URL}/v2/payer/:clientUserId/payment-details`, ({ params }) => {
    const { clientUserId } = params as { clientUserId: string };
    return HttpResponse.json(
      {
        payment_detail: {
          id: "pd-2",
          userId: clientUserId,
          bankName: BANK_MONZO,
          status: STATUS_PENDING,
        },
      },
      { status: 201 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v2/payer/:clientUserId/payment-details`, ({ params }) => {
    const { clientUserId } = params as { clientUserId: string };
    return HttpResponse.json(
      {
        paymentDetails: [
          {
            id: "pd-2",
            userId: clientUserId,
            bankName: BANK_MONZO,
            status: STATUS_PENDING,
          },
        ],
      },
      { status: 200 },
    );
  }),
];
