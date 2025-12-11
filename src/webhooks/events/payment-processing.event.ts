import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_PROCESSING_EVENT = "payment.processing" as const;

export type PaymentProcessingEventName = typeof PAYMENT_PROCESSING_EVENT;

export const PAYMENT_PROCESSING_STAGES = Object.freeze([
  "initiated",
  "pending_internal_assessment",
  "ongoing_checks",
  "processing",
  "sending_fiat",
  "fiat_sent",
  "bounced",
  "retry_required",
] as const);

export type PaymentProcessingStage = (typeof PAYMENT_PROCESSING_STAGES)[number];

export type PaymentProcessingPayload = WebhookPayload<PaymentProcessingEventName>;

export type PaymentProcessingContext = WebhookEventHandlerContext<PaymentProcessingEventName>;

export type PaymentProcessingHandler = WebhookEventHandler<PaymentProcessingEventName>;

const TERMINAL_STAGES = new Set<PaymentProcessingStage>(["fiat_sent", "bounced", "retry_required"]);

const STAGE_LABELS: Record<PaymentProcessingStage, string> = {
  initiated: "Transfer initiated",
  pending_internal_assessment: "Pending internal assessment",
  ongoing_checks: "Ongoing compliance checks",
  processing: "Processing payment",
  sending_fiat: "Sending fiat to recipient",
  fiat_sent: "Fiat delivered",
  bounced: "Payment bounced",
  retry_required: "Retry required",
};

export const isPaymentProcessingEvent = createEventPredicate<PaymentProcessingEventName>(PAYMENT_PROCESSING_EVENT);

export function onPaymentProcessing(dispatcher: WebhookDispatcher, handler: PaymentProcessingHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_PROCESSING_EVENT, handler);
}

export function assertPaymentProcessingEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentProcessingEventName> {
  if (event.event !== PAYMENT_PROCESSING_EVENT) {
    throw new TypeError(`Expected payment.processing event. Received ${event.event}.`);
  }
}

export function isProcessingTerminalStatus(stage: PaymentProcessingStage): boolean {
  return TERMINAL_STAGES.has(stage);
}

export function processingStageLabel(stage: PaymentProcessingStage): string {
  return STAGE_LABELS[stage];
}

export function isRetryRequired(stage: PaymentProcessingStage): boolean {
  return stage === "retry_required";
}
