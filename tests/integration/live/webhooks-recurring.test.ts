import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { pingPublicWebhookEndpoint, startCloudflareTunnel } from "./helpers/cloudflare";
import { LiveScenario } from "./helpers/scenario";
import { startWebhookHarness } from "./helpers/webhook-harness";
import type { RequestClient } from "../../../src";
import { createRequestsV1Api } from "../../../src/domains/requests/v1";
import { ensureLiveSuite } from "../../utils/env.utils";

const REQUIRED_WEBHOOK_ENV = ["REQUEST_WEBHOOK_SECRET"] as const;
const SUITE_TITLE = "[request-api-client] recurring webhook integration";

function hasWebhookPrereqs(): boolean {
  return REQUIRED_WEBHOOK_ENV.every((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

const suiteEnv = ensureLiveSuite();

if (!suiteEnv || !hasWebhookPrereqs()) {
  const missing = REQUIRED_WEBHOOK_ENV.filter((key) => {
    const raw = process.env[key];
    return typeof raw !== "string" || raw.trim().length === 0;
  });
  const message = !suiteEnv
    ? "request live suite prerequisites missing"
    : `webhook env missing: ${missing.join(", ")}`;

  describe.skip(SUITE_TITLE, () => {
    test.skip(message, () => {
      /* intentionally skipped */
    });
  });
} else {
  const secretEnv = process.env.REQUEST_WEBHOOK_SECRET ?? "";
  const secret = secretEnv.trim();
  const publicUrlEnv = process.env.REQUEST_WEBHOOK_PUBLIC_URL ?? "";
  const tunnelHostnameEnv = process.env.REQUEST_WEBHOOK_TUNNEL_HOSTNAME ?? "";
  const publicUrl =
    publicUrlEnv.trim().length > 0
      ? publicUrlEnv.trim()
      : tunnelHostnameEnv.trim().length > 0
        ? `https://${tunnelHostnameEnv.trim()}`
        : undefined;

  if (!publicUrl) {
    describe.skip(SUITE_TITLE, () => {
      test.skip(
        "Provide REQUEST_WEBHOOK_PUBLIC_URL or REQUEST_WEBHOOK_TUNNEL_HOSTNAME so the test can resolve the public listener URL",
        () => {
          /* intentionally skipped */
        },
      );
    });
  } else {
    describe(SUITE_TITLE, () => {
      let client: RequestClient;
      let scenario: LiveScenario;
      let harness: Awaited<ReturnType<typeof startWebhookHarness>> | undefined;
      let webhookPort: number;
      let stopTunnel: (() => Promise<void>) | undefined;

      const tunnelMode = process.env.REQUEST_WEBHOOK_TUNNEL_AUTO === "0" ? "none" : "spawn";

      beforeAll(async () => {
        const startedHarness = await startWebhookHarness({ secret });
        harness = startedHarness;
        webhookPort = startedHarness.port;
        process.env.REQUEST_WEBHOOK_PORT = String(webhookPort);

        scenario = await LiveScenario.initialise({
          env: suiteEnv,
          logger: (level, message, context) => {
            const stream = level === "warn" ? process.stderr : process.stdout;
            stream.write(`[request-api-client] live webhook | ${message} ${JSON.stringify(context)}\n`);
          },
          offRampEnabled: false,
        });

        client = scenario.clientInstance;

        const tunnelHandle = await startCloudflareTunnel({ port: webhookPort, mode: tunnelMode });
        if (tunnelHandle) {
          stopTunnel = () => tunnelHandle.stop();
        } else {
          stopTunnel = undefined;
        }

        await pingPublicWebhookEndpoint(publicUrl, 15_000);
      }, 120_000);

      afterAll(async () => {
        if (harness) {
          await harness.close();
        }
        if (stopTunnel) {
          await stopTunnel();
        }
      });

      test(
        "creates recurring request, observes webhook, and stops recurrence",
        async () => {
          const activeHarness = harness;
          if (!activeHarness) {
            throw new Error("Webhook harness did not start correctly");
          }
          activeHarness.clearEvents();

          const startDate = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // five minutes from now

          const { requestId, paymentReference } = await scenario.createRequest({
            payeeWallet: (process.env.REQUEST_PAYEE_WALLET ?? "").trim(),
            amount: process.env.REQUEST_PAYMENT_AMOUNT?.trim() ?? "5",
            invoiceCurrency: process.env.REQUEST_INVOICE_CURRENCY?.trim() ?? "USD",
            paymentCurrency: (process.env.REQUEST_PAYMENT_CURRENCY ?? "").trim(),
            reference: `recurring-${Date.now().toString(36)}`,
            recurrence: {
              startDate,
              frequency: "DAILY",
            },
          });

          expect(requestId).toBeDefined();
          expect(paymentReference).toBeDefined();

          if (!requestId || !paymentReference) {
            throw new Error("Recurring request creation did not return identifiers");
          }

          const recurringEvent = await activeHarness.waitForEvent("request.recurring", { timeoutMs: 240_000 });
          expect(recurringEvent.payload).toBeDefined();

          const requestsV1 = createRequestsV1Api(client.http);
          await expect(requestsV1.stopRecurrence(paymentReference)).resolves.toBeUndefined();

          await waitForRequestStatus(
            async () => scenario.getRequestStatus(requestId),
            (status) => status.isRecurrenceStopped === true,
            { timeoutMs: 120_000 },
          );
        },
        600_000,
      );
    });
  }
}

interface WaitForStatusOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

async function waitForRequestStatus<T>(
  getter: () => Promise<T>,
  predicate: (status: T) => boolean,
  options?: WaitForStatusOptions,
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 60_000;
  const intervalMs = options?.intervalMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  let last: T;

  while (Date.now() < deadline) {
    last = await getter();
    if (predicate(last)) {
      return last;
    }
    await delay(intervalMs);
  }

  throw new Error(`Timed out waiting for request status after ${String(timeoutMs)}ms`);
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
