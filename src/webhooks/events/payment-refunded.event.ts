import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_REFUNDED_EVENT = "payment.refunded" as const;

export type PaymentRefundedEventName = typeof PAYMENT_REFUNDED_EVENT;

export type PaymentRefundedPayload = WebhookPayload<PaymentRefundedEventName>;

export type PaymentRefundedContext = WebhookEventHandlerContext<PaymentRefundedEventName>;

export type PaymentRefundedHandler = WebhookEventHandler<PaymentRefundedEventName>;

export const isPaymentRefundedEvent = createEventPredicate<PaymentRefundedEventName>(PAYMENT_REFUNDED_EVENT);

export function onPaymentRefunded(dispatcher: WebhookDispatcher, handler: PaymentRefundedHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_REFUNDED_EVENT, handler);
}

export function assertPaymentRefundedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentRefundedEventName> {
  if (event.event !== PAYMENT_REFUNDED_EVENT) {
    throw new TypeError(`Expected payment.refunded event. Received ${event.event}.`);
  }
}
