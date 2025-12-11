import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

import { handlers } from "./handlers.server";

export const server = setupServer(...handlers);

const mockingEnabled = process.env.REQUEST_SUITE_DISABLE_MSW !== "1";

if (mockingEnabled) {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}
