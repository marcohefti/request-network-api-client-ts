import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_FAILED_EVENT = "payment.failed" as const;

export type PaymentFailedEventName = typeof PAYMENT_FAILED_EVENT;

export const PAYMENT_FAILED_SUB_STATUSES = Object.freeze(["failed", "bounced", "insufficient_funds"] as const);

export type PaymentFailedSubStatus = (typeof PAYMENT_FAILED_SUB_STATUSES)[number];

export type PaymentFailedPayload = WebhookPayload<PaymentFailedEventName>;

export type PaymentFailedContext = WebhookEventHandlerContext<PaymentFailedEventName>;

export type PaymentFailedHandler = WebhookEventHandler<PaymentFailedEventName>;

export const isPaymentFailedEvent = createEventPredicate<PaymentFailedEventName>(PAYMENT_FAILED_EVENT);

export function onPaymentFailed(dispatcher: WebhookDispatcher, handler: PaymentFailedHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_FAILED_EVENT, handler);
}

export function assertPaymentFailedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentFailedEventName> {
  if (event.event !== PAYMENT_FAILED_EVENT) {
    throw new TypeError(`Expected payment.failed event. Received ${event.event}.`);
  }
}

export function isBouncedFailure(payload: Pick<PaymentFailedPayload, "subStatus">): boolean {
  return payload.subStatus === "bounced";
}

export function isInsufficientFundsFailure(payload: Pick<PaymentFailedPayload, "subStatus">): boolean {
  return payload.subStatus === "insufficient_funds";
}
