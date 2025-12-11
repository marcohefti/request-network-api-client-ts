import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_PARTIAL_EVENT = "payment.partial" as const;

export type PaymentPartialEventName = typeof PAYMENT_PARTIAL_EVENT;

export type PaymentPartialPayload = WebhookPayload<PaymentPartialEventName>;

export type PaymentPartialContext = WebhookEventHandlerContext<PaymentPartialEventName>;

export type PaymentPartialHandler = WebhookEventHandler<PaymentPartialEventName>;

export const isPaymentPartialEvent = createEventPredicate<PaymentPartialEventName>(PAYMENT_PARTIAL_EVENT);

export function onPaymentPartial(dispatcher: WebhookDispatcher, handler: PaymentPartialHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_PARTIAL_EVENT, handler);
}

export function assertPaymentPartialEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentPartialEventName> {
  if (event.event !== PAYMENT_PARTIAL_EVENT) {
    throw new TypeError(`Expected payment.partial event. Received ${event.event}.`);
  }
}
