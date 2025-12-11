import { DEFAULT_COMPLIANCE_PAYLOAD, DEFAULT_PAYMENT_DETAILS_PAYLOAD } from "./payloads";
import type { ScenarioLogger } from "./types";
import type { RequestClient } from "../../../../src";
import { isRequestApiError } from "../../../../src";

interface ComplianceState {
  complianceProvisioned: boolean;
}

interface PaymentDetailsState {
  paymentDetailsId?: string;
}

type CreatePaymentDetailsResponse = Awaited<
  ReturnType<RequestClient["payer"]["createPaymentDetails"]>
>;
type GetPaymentDetailsResponse = Awaited<
  ReturnType<RequestClient["payer"]["getPaymentDetails"]>
>;

export async function ensureComplianceData(params: {
  client: RequestClient;
  clientUserId: string;
  logger: ScenarioLogger;
  state: ComplianceState;
}): Promise<void> {
  const { client, clientUserId, logger, state } = params;
  if (state.complianceProvisioned) {
    return;
  }

  try {
    await client.payer.createComplianceData({
      ...DEFAULT_COMPLIANCE_PAYLOAD,
      clientUserId,
    });
    state.complianceProvisioned = true;
    logger("info", "compliance.provisioned", { clientUserId });
  } catch (error) {
    if (isRequestApiError(error)) {
      if (error.status === 409) {
        state.complianceProvisioned = true;
        logger("warn", "compliance.conflict", { clientUserId, message: error.message });
        return;
      }

      logger("warn", "compliance.validationError", {
        clientUserId,
        status: error.status,
        code: error.code,
        errors: error.errors,
        detail: error.detail,
      });
    }
    throw error;
  }
}

export async function ensurePaymentDetails(params: {
  client: RequestClient;
  clientUserId: string;
  logger: ScenarioLogger;
  state: PaymentDetailsState;
}): Promise<string | undefined> {
  const { client, clientUserId, logger, state } = params;

  const cached = state.paymentDetailsId ?? useEnvPaymentDetailsId(clientUserId, logger);
  if (cached) {
    state.paymentDetailsId = cached;
    return cached;
  }

  try {
    const created = await client.payer.createPaymentDetails(clientUserId, DEFAULT_PAYMENT_DETAILS_PAYLOAD);
    const id = extractPaymentDetailsId(created);
    if (id) {
      state.paymentDetailsId = id;
      logger("info", "paymentDetails.provisioned", { clientUserId, paymentDetailsId: id });
      return id;
    }

    logger("warn", "paymentDetails.createdWithoutId", { clientUserId, response: created });
    return undefined;
  } catch (error) {
    if (!isRequestApiError(error)) {
      throw error;
    }

    const existingId = await fetchExistingPaymentDetailsId(client, clientUserId);
    if (existingId) {
      state.paymentDetailsId = existingId;
      logger("warn", "paymentDetails.reusedAfterLookup", {
        clientUserId,
        paymentDetailsId: existingId,
        status: error.status,
        code: error.code,
        detail: error.detail,
        errors: error.errors,
      });
      return existingId;
    }

    logger("warn", "paymentDetails.error", {
      clientUserId,
      status: error.status,
      code: error.code,
      errors: error.errors,
      detail: error.detail,
    });

    throw error;
  }
}

function useEnvPaymentDetailsId(clientUserId: string, logger: ScenarioLogger): string | undefined {
  const value = process.env.REQUEST_PAYMENT_DETAILS_ID?.trim();
  if (!value) {
    return undefined;
  }
  logger("info", "paymentDetails.reused", { clientUserId, paymentDetailsId: value });
  return value;
}

function extractPaymentDetailsId(response: CreatePaymentDetailsResponse): string | undefined {
  return extractIdFromDetail((response as { payment_detail?: unknown }).payment_detail);
}

async function fetchExistingPaymentDetailsId(
  client: RequestClient,
  clientUserId: string,
): Promise<string | undefined> {
  const fetched: GetPaymentDetailsResponse = await client.payer.getPaymentDetails(clientUserId);
  const details = Array.isArray(fetched.paymentDetails) ? fetched.paymentDetails : [];
  for (const detail of details) {
    const id = extractIdFromDetail(detail);
    if (id) {
      return id;
    }
  }
  return undefined;
}

function extractIdFromDetail(detail: unknown): string | undefined {
  if (!detail || typeof detail !== "object") {
    return undefined;
  }
  const value = (detail as { id?: unknown }).id;
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
