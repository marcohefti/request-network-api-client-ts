import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_CONFIRMED_EVENT = "payment.confirmed" as const;

export type PaymentConfirmedEventName = typeof PAYMENT_CONFIRMED_EVENT;

export type PaymentConfirmedPayload = WebhookPayload<PaymentConfirmedEventName>;

export type PaymentConfirmedContext = WebhookEventHandlerContext<PaymentConfirmedEventName>;

export type PaymentConfirmedHandler = WebhookEventHandler<PaymentConfirmedEventName>;

export const isPaymentConfirmedEvent = createEventPredicate<PaymentConfirmedEventName>(PAYMENT_CONFIRMED_EVENT);

export function onPaymentConfirmed(dispatcher: WebhookDispatcher, handler: PaymentConfirmedHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_CONFIRMED_EVENT, handler);
}

export function assertPaymentConfirmedEvent(
  event: ParsedWebhookEvent,
): asserts event is ParsedWebhookEvent<PaymentConfirmedEventName> {
  if (event.event !== PAYMENT_CONFIRMED_EVENT) {
    throw new TypeError(`Expected payment.confirmed event. Received ${event.event}.`);
  }
}
