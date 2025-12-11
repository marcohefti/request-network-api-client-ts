import type { RequestOptions } from "../../core/http/http.types";
import type { operations } from "../../generated/openapi-types";

type QueryValue = string | number | boolean | (string | number | boolean)[];

/**
 * Builds a query object while stripping out undefined entries so the HTTP helper
 * does not emit spurious `param=undefined` pairs.
 */
export function buildRequestQuery(input?: Record<string, unknown>): RequestOptions["query"] | undefined {
  if (!input) return undefined;
  const entries = Object.entries(input).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries) as Record<string, QueryValue | undefined>;
}

type LegacyStatusApiResponse =
  operations["RequestControllerV1_getRequestStatus_v1"]["responses"][200]["content"]["application/json"];
type StatusApiResponseV2 =
  operations["RequestControllerV2_getRequestStatus_v2"]["responses"][200]["content"]["application/json"];

export interface RequestStatusAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface RequestStatusCustomerInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: RequestStatusAddress;
}

export type RequestStatusKind = "paid" | "pending" | "cancelled" | "overdue" | "unknown";

interface RequestStatusBase {
  paymentReference?: string;
  requestId?: string;
  isListening?: boolean;
  txHash: string | null;
  status?: string;
  recurrence?: Record<string, unknown>;
  originalRequestId?: string;
  originalRequestPaymentReference?: string;
  isRecurrenceStopped?: boolean;
  isCryptoToFiatAvailable?: boolean;
  payments?: Array<Record<string, unknown>>;
  customerInfo?: RequestStatusCustomerInfo | null;
  reference?: string | null;
  hasBeenPaid?: boolean;
}

export type RequestStatusResult =
  | (RequestStatusBase & { kind: "paid"; hasBeenPaid: true })
  | (RequestStatusBase & { kind: "pending"; hasBeenPaid?: boolean })
  | (RequestStatusBase & { kind: "cancelled"; hasBeenPaid?: boolean })
  | (RequestStatusBase & { kind: "overdue"; hasBeenPaid?: boolean })
  | (RequestStatusBase & { kind: "unknown"; hasBeenPaid?: boolean });

export type LegacyRequestStatusResult = Extract<RequestStatusResult, { kind: "paid" | "pending" }>;

const STATUS_KIND_MAP: Record<string, RequestStatusKind> = {
  paid: "paid",
  completed: "paid",
  settled: "paid",
  pending: "pending",
  processing: "pending",
  open: "pending",
  awaitingpayment: "pending",
  awaiting_payment: "pending",
  cancelled: "cancelled",
  canceled: "cancelled",
  voided: "cancelled",
  overdue: "overdue",
  expired: "overdue",
};

function normalizeReference(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value;
}

function normalizeCustomerInfo(value: RequestStatusCustomerInfo | null | undefined): RequestStatusCustomerInfo | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return {
    firstName: value.firstName ?? undefined,
    lastName: value.lastName ?? undefined,
    email: value.email ?? undefined,
    address: value.address
      ? {
          street: value.address.street ?? undefined,
          city: value.address.city ?? undefined,
          state: value.address.state ?? undefined,
          postalCode: value.address.postalCode ?? undefined,
          country: value.address.country ?? undefined,
        }
      : undefined,
  };
}

function normalizePayments(payments: StatusApiResponseV2["payments"]): Array<Record<string, unknown>> | undefined {
  if (!payments) return undefined;
  return payments.map((payment) => ({ ...payment })) as Array<Record<string, unknown>>;
}

function buildStatusBase(
  raw: LegacyStatusApiResponse | StatusApiResponseV2,
  overrides?: Partial<RequestStatusBase>,
): RequestStatusBase {
  return {
    paymentReference: raw.paymentReference ?? undefined,
    requestId: raw.requestId ?? undefined,
    isListening: "isListening" in raw ? raw.isListening ?? undefined : undefined,
    txHash: raw.txHash ?? null,
    hasBeenPaid: raw.hasBeenPaid ?? false,
    status: "status" in raw ? (raw).status ?? undefined : undefined,
    recurrence:
      "recurrence" in raw ? ((raw).recurrence as Record<string, unknown> | undefined) : undefined,
    originalRequestId: "originalRequestId" in raw ? (raw).originalRequestId ?? undefined : undefined,
    originalRequestPaymentReference:
      "originalRequestPaymentReference" in raw
        ? (raw).originalRequestPaymentReference ?? undefined
        : undefined,
    isRecurrenceStopped:
      "isRecurrenceStopped" in raw ? (raw).isRecurrenceStopped ?? undefined : undefined,
    isCryptoToFiatAvailable:
      "isCryptoToFiatAvailable" in raw
        ? (raw).isCryptoToFiatAvailable ?? undefined
        : undefined,
    payments: "payments" in raw ? normalizePayments((raw).payments) : undefined,
    customerInfo:
      "customerInfo" in raw
        ? normalizeCustomerInfo(
            (raw).customerInfo as RequestStatusCustomerInfo | null | undefined,
          )
        : undefined,
    reference:
      "reference" in raw ? normalizeReference((raw).reference ?? null) : undefined,
    ...overrides,
  };
}

export function normalizeLegacyStatusResponse(raw: LegacyStatusApiResponse): LegacyRequestStatusResult {
  if (raw.hasBeenPaid) {
    return {
      kind: "paid",
      ...buildStatusBase(raw, { hasBeenPaid: true }),
      hasBeenPaid: true,
    };
  }

  return {
    kind: "pending",
    ...buildStatusBase(raw, { hasBeenPaid: false }),
    hasBeenPaid: false,
  };
}

export function normalizeRequestStatusResponse(raw: StatusApiResponseV2): RequestStatusResult {
  const statusKey = raw.status?.trim().toLowerCase();
  const mapped = statusKey ? STATUS_KIND_MAP[statusKey] : undefined;
  const kind: RequestStatusKind = raw.hasBeenPaid
    ? "paid"
    : mapped ?? (statusKey ? "unknown" : "pending");

  if (kind === "paid") {
    return {
      kind,
      ...buildStatusBase(raw, { hasBeenPaid: true }),
      hasBeenPaid: true,
    };
  }

  return {
    kind,
    ...buildStatusBase(raw, { hasBeenPaid: false }),
    hasBeenPaid: false,
  };
}
