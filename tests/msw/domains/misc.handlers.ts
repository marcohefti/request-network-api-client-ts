import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const miscHandlers = [
  http.get(`${TEST_BASE_URL}/bad`, () =>
    HttpResponse.json(
      {
        message: "Invalid input",
        code: "BAD_REQUEST",
        detail: { hint: "wrong value" },
        errors: [
          {
            message: "field is required",
            code: "required",
            field: "network",
          },
        ],
      },
      {
        status: 400,
        headers: {
          "x-request-id": "req-123",
        },
      },
    ),
  ),
];
