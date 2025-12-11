import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { webhooks } from "../../src";

const require = createRequire(import.meta.url);

describe("webhooks event parity", () => {
  it("matches the event identifiers defined in the webhook spec", () => {
    const specPath = require.resolve(
      "@request/request-network-api-contracts/specs/webhooks/request-network-webhooks.json"
    );
    const raw = readFileSync(specPath, "utf8");
    const spec = JSON.parse(raw) as { webhooks: Record<string, unknown> };
    const specEvents = Object.keys(spec.webhooks).sort();
    const exportedEvents = [...webhooks.WEBHOOK_EVENT_NAMES].sort();
    expect(exportedEvents).toEqual(specEvents);
  });
});
