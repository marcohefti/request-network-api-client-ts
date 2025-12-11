import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const COMPLIANCE_UPDATED_EVENT = "compliance.updated" as const;

export type ComplianceUpdatedEventName = typeof COMPLIANCE_UPDATED_EVENT;

export type ComplianceUpdatedPayload = WebhookPayload<ComplianceUpdatedEventName>;

export type ComplianceUpdatedContext = WebhookEventHandlerContext<ComplianceUpdatedEventName>;

export type ComplianceUpdatedHandler = WebhookEventHandler<ComplianceUpdatedEventName>;

export type ComplianceKycStatus = NonNullable<ComplianceUpdatedPayload["kycStatus"]>;
export type ComplianceAgreementStatus = NonNullable<ComplianceUpdatedPayload["agreementStatus"]>;

export const COMPLIANCE_KYC_STATUSES = Object.freeze([
  "initiated",
  "pending",
  "approved",
  "rejected",
  "failed",
] as const satisfies readonly ComplianceKycStatus[]);

export const COMPLIANCE_AGREEMENT_STATUSES = Object.freeze([
  "not_started",
  "pending",
  "completed",
  "rejected",
  "failed",
  "signed",
] as const satisfies readonly ComplianceAgreementStatus[]);

const AGREEMENT_REJECTED_STATES = new Set<ComplianceAgreementStatus>(["rejected", "failed"]);

export const isComplianceUpdatedEvent = createEventPredicate<ComplianceUpdatedEventName>(COMPLIANCE_UPDATED_EVENT);

export function onComplianceUpdated(dispatcher: WebhookDispatcher, handler: ComplianceUpdatedHandler): () => void {
  return registerEventHandler(dispatcher, COMPLIANCE_UPDATED_EVENT, handler);
}

export function assertComplianceUpdatedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<ComplianceUpdatedEventName> {
  if (event.event !== COMPLIANCE_UPDATED_EVENT) {
    throw new TypeError(`Expected compliance.updated event. Received ${event.event}.`);
  }
}

export function isKycComplete(payload: ComplianceUpdatedPayload): boolean {
  return payload.kycStatus === "approved";
}

export function isAgreementRejected(payload: ComplianceUpdatedPayload): boolean {
  const status = payload.agreementStatus;
  if (!status) return false;
  return AGREEMENT_REJECTED_STATES.has(status);
}

export function complianceStatusSummary(payload: ComplianceUpdatedPayload): string {
  const parts: string[] = [];
  const kyc = payload.kycStatus ? payload.kycStatus.replace(/_/g, " ") : "unknown";
  const agreement = payload.agreementStatus ? payload.agreementStatus.replace(/_/g, " ") : "unknown";
  parts.push(`KYC: ${kyc}`);
  parts.push(`Agreement: ${agreement}`);
  if (payload.clientUserId) {
    const clientUserId =
      typeof payload.clientUserId === "string"
        ? payload.clientUserId
        : JSON.stringify(payload.clientUserId);
    parts.push(`Client user: ${clientUserId}`);
  }
  return parts.join(" | ");
}
