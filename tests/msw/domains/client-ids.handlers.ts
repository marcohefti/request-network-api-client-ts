import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

const LABEL_INVALID_RESPONSE = "invalid-response" as const;
const LABEL_TRIGGER_ERROR = "trigger-error" as const;
const NOT_AN_ARRAY = "not-an-array";

export const clientIdHandlers = [
  http.post(`${TEST_BASE_URL}/v2/client-ids`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    const label = typeof payload.label === "string" ? payload.label : "unknown";

    if (label === LABEL_INVALID_RESPONSE) {
      return HttpResponse.json(
        {
          id: "client-1",
          label,
          allowedDomains: NOT_AN_ARRAY,
        },
        { status: 201 },
      );
    }

    if (label === LABEL_TRIGGER_ERROR) {
      return HttpResponse.json(
        [
          {
            message: "Broken envelope",
          },
        ],
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: "client-1",
        clientId: "client-external-id",
        label,
        allowedDomains: Array.isArray(payload.allowedDomains) ? payload.allowedDomains : [],
        feePercentage: payload.feePercentage ?? null,
        feeAddress: payload.feeAddress ?? null,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
