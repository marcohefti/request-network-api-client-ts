import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { ValidationError } from "../../src/validation/zod.helpers";
import { createWebhookDispatcher, parseWebhookEvent, type WebhookEventName } from "../../src/webhooks";

const require = createRequire(import.meta.url);
const CLIENT_ID_LINKED = "client_id.linked";
const SECURE_PAYMENT_USER_EVENT = "secure-payment-user-event.json";
const FIXTURES = [
  [CLIENT_ID_LINKED, "client-id-linked.json"],
  ["kyt.screening.completed", "kyt-screening-completed.json"],
  ["secure_payment.access_rejected", "secure-payment-access-rejected.json"],
  ["secure_payment.user_event", SECURE_PAYMENT_USER_EVENT],
] as const satisfies ReadonlyArray<readonly [WebhookEventName, string]>;

function fixture(name: string): Record<string, unknown> {
  const fixturePath = require.resolve(`@marcohefti/request-network-api-contracts/fixtures/webhooks/${name}`);
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

describe("current orchestrator webhook events", () => {
  it("parses and dispatches every published fixture while preserving additive fields", async () => {
    const dispatcher = createWebhookDispatcher();
    const dispatched: string[] = [];

    for (const [eventName, fixtureName] of FIXTURES) {
      const body = { ...fixture(fixtureName), futureField: "preserved" };
      const parsed = parseWebhookEvent({
        rawBody: JSON.stringify(body),
        headers: {},
        secret: "unused",
        skipSignatureVerification: true,
      });
      const dispose = dispatcher.on(eventName, (event) => {
        dispatched.push(event.event);
        expect(event.payload).toMatchObject({ event: eventName, futureField: "preserved" });
      });
      await dispatcher.dispatch(parsed);
      dispose();
    }

    expect(dispatched).toEqual(FIXTURES.map(([eventName]) => eventName));
  });

  it("rejects a current event that omits required contract fields", () => {
    expect(() =>
      parseWebhookEvent({
        rawBody: JSON.stringify({ event: CLIENT_ID_LINKED }),
        headers: {},
        secret: "unused",
        skipSignatureVerification: true,
      }),
    ).toThrow(ValidationError);
  });

  it("accepts RFC 3339 timestamps with a timezone offset", () => {
    const body = {
      ...fixture(SECURE_PAYMENT_USER_EVENT),
      occurredAt: "2026-06-09T17:00:00.000+07:00",
      timestamp: "2026-06-09T17:00:01.000+07:00",
    };

    expect(
      parseWebhookEvent({
        rawBody: JSON.stringify(body),
        headers: {},
        secret: "unused",
        skipSignatureVerification: true,
      }).payload,
    ).toMatchObject({ occurredAt: body.occurredAt, timestamp: body.timestamp });
  });
});
