import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_FAILED_EVENT = "payment.failed" as const;

export type PaymentFailedEventName = typeof PAYMENT_FAILED_EVENT;

export type PaymentFailedPayload = WebhookPayload<PaymentFailedEventName>;

export type PaymentFailedContext = WebhookEventHandlerContext<PaymentFailedEventName>;

export type PaymentFailedHandler = WebhookEventHandler<PaymentFailedEventName>;

export type PaymentFailedSubStatus = NonNullable<PaymentFailedPayload["subStatus"]>;

export const isPaymentFailedEvent = createEventPredicate<PaymentFailedEventName>(PAYMENT_FAILED_EVENT);

export function onPaymentFailed(dispatcher: WebhookDispatcher, handler: PaymentFailedHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_FAILED_EVENT, handler);
}

export function assertPaymentFailedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentFailedEventName> {
  if (event.event !== PAYMENT_FAILED_EVENT) {
    throw new TypeError(`Expected payment.failed event. Received ${event.event}.`);
  }
}

export function isBouncedFailure(payload: Pick<PaymentFailedPayload, "subStatus">): payload is PaymentFailedPayload & {
  subStatus: Extract<PaymentFailedSubStatus, "bounced">;
} {
  return payload.subStatus === "bounced";
}

export function isInsufficientFundsFailure(payload: Pick<PaymentFailedPayload, "subStatus">): payload is PaymentFailedPayload & {
  subStatus: Extract<PaymentFailedSubStatus, "insufficient_funds">;
} {
  return payload.subStatus === "insufficient_funds";
}
