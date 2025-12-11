import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { LiveScenario } from "./helpers/scenario";
import type { RequestClient } from "../../../src";
import { ensureLiveSuite } from "../../utils/env.utils";

const env = ensureLiveSuite();

if (!env) {
  // Suite declared as skipped; no further execution.
} else {
  const suiteEnv = env;
  const SUITE_NAME = "live integration";
  const SUITE_LOG_PREFIX = `[request-api-client] ${SUITE_NAME}`;
  const AMOUNT = process.env.REQUEST_PAYMENT_AMOUNT?.trim() ?? "5";
  const INVOICE_CURRENCY = process.env.REQUEST_INVOICE_CURRENCY?.trim() ?? "USD";

  const REQUIRED_ENV = {
    REQUEST_API_KEY: "API key",
    REQUEST_PAYEE_WALLET: "payee wallet",
    REQUEST_PAYER_WALLET: "payer wallet",
    REQUEST_PAYMENT_CURRENCY: "payment currency",
    REQUEST_PAYMENT_NETWORK: "payment network",
  } as const;

  const missingVars = Object.keys(REQUIRED_ENV).filter((key) => {
    const value = process.env[key];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingVars.length > 0) {
    describe.skip(`${SUITE_NAME} | missing env`, () => {
      test.skip(
        `requires ${missingVars.join(", ")} to run live integration suite`,
        () => {
          /* no-op */
        },
      );
    });
  } else {
    const payeeWallet = (process.env.REQUEST_PAYEE_WALLET ?? "").trim();
    const payerWallet = (process.env.REQUEST_PAYER_WALLET ?? "").trim();
    const paymentCurrency = (process.env.REQUEST_PAYMENT_CURRENCY ?? "").trim();
    const clientUserId = process.env.REQUEST_CLIENT_USER_ID?.trim();
    const payoutWallet = process.env.REQUEST_PAYOUT_PAYEE_WALLET?.trim();
    const paymentNetwork = process.env.REQUEST_PAYMENT_NETWORK?.trim();
    const NOTICE_PAYOUT_SKIPPED = "payout skipped" as const;

    type SuiteNoticeLevel = "info" | "warn";

    function emitSuiteNotice(level: SuiteNoticeLevel, message: string, payload: Record<string, unknown>): void {
      const stream = level === "warn" ? process.stderr : process.stdout;
      stream.write(
        `${SUITE_LOG_PREFIX} | ${message} ${JSON.stringify({
          ...payload,
          baseUrl: suiteEnv.baseUrl,
          paymentCurrency,
          paymentNetwork,
        })}\n`,
      );
    }

    const currencyNetwork = paymentCurrency.split("-").pop();
    if (paymentNetwork && currencyNetwork && !paymentNetwork.endsWith(currencyNetwork)) {
      emitSuiteNotice("warn", "payment currency/network mismatch", {
        paymentCurrency,
        paymentNetwork,
      });
    }

    describe(`${SUITE_NAME} | request lifecycle`, () => {
      let client: RequestClient;
      let scenario: LiveScenario;
      let createdRequestId: string | undefined;
      let paymentIntentId: string | undefined;
      let paymentReference: string | undefined;
      const reference = `live-${Date.now().toString(36)}`;

      beforeAll(async () => {
        scenario = await LiveScenario.initialise({
          env: suiteEnv,
          logger: emitSuiteNotice,
          clientUserId,
          initialPaymentDetailsId: process.env.REQUEST_PAYMENT_DETAILS_ID?.trim(),
          payoutWallet,
          offRampEnabled: false,
        });
        client = scenario.clientInstance;
        if (clientUserId) {
          emitSuiteNotice("info", "off-ramp prerequisites skipped", { clientUserId });
        }
      });

      afterAll(() => {
        if (createdRequestId) {
          emitSuiteNotice("info", "request created", {
            requestId: createdRequestId,
            paymentIntentId,
            paymentReference,
            reference,
            amount: AMOUNT,
            invoiceCurrency: INVOICE_CURRENCY,
          });
        }
      });

      test(
        "creates a request and inspects status, routes, calldata, and payments",
        async () => {
          const { requestId, paymentReference: createdReference } = await scenario.createRequest({
            payeeWallet,
            amount: AMOUNT,
            invoiceCurrency: INVOICE_CURRENCY,
            paymentCurrency,
            reference,
          });

          createdRequestId = requestId;
          paymentReference = createdReference;

          expect(createdRequestId, "requestId should be provided").toBeDefined();
          if (!createdRequestId) return;

          const status = await scenario.getRequestStatus(createdRequestId);
          expect(status.kind === "pending" || status.kind === "unknown").toBeTruthy();
          expect(status.requestId).toBe(createdRequestId);
          expect(status.paymentReference).toBe(paymentReference);

          const routes = await scenario.getPaymentRoutes({
            requestId: createdRequestId,
            wallet: payerWallet,
            amount: AMOUNT,
          });
          expect(Array.isArray(routes.routes)).toBe(true);
          if (routes.routes.length > 0) {
            const firstRoute = routes.routes[0] as (Record<string, unknown> & { id?: unknown; chain?: unknown; token?: unknown }) | undefined;
            if (firstRoute) {
              expect(typeof firstRoute.id).toBe("string");
              expect(typeof firstRoute.chain).toBe("string");
              expect(typeof firstRoute.token).toBe("string");
            }
          }
          if (routes.routes.length === 0) {
            emitSuiteNotice("warn", "payment routes empty", { requestId: createdRequestId, wallet: payerWallet });
          }

          const calldata = await scenario.getPaymentCalldata({
            requestId: createdRequestId,
            wallet: payerWallet,
            amount: AMOUNT,
          });

          if (calldata.kind === "paymentIntent") {
            expect(typeof calldata.paymentIntentId).toBe("string");
            paymentIntentId = calldata.paymentIntentId;
            emitSuiteNotice("info", "payment intent prepared", {
              requestId: createdRequestId,
              paymentIntentId,
            });
          } else {
            expect(calldata.kind).toBe("calldata");
            expect(Array.isArray(calldata.transactions)).toBe(true);
            emitSuiteNotice("warn", "payment calldata returned raw transactions", {
              requestId: createdRequestId,
            });
          }

          const paymentSearch = await client.payments.search({ requestId: createdRequestId });
          expect(Array.isArray(paymentSearch.payments)).toBe(true);
          expect(paymentSearch.pagination).toBeDefined();

          const conversion = await client.currencies.getConversionRoutes(paymentCurrency);
          expect(conversion.currencyId).toBe(paymentCurrency);

          emitSuiteNotice("info", NOTICE_PAYOUT_SKIPPED, {
            reason: "off-ramp flows disabled for live wallet-to-wallet coverage",
          });
        },
        120_000,
      );
    });
  }
}
