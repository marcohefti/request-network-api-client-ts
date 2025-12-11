import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const REQUEST_RECURRING_EVENT = "request.recurring" as const;

export type RequestRecurringEventName = typeof REQUEST_RECURRING_EVENT;

export type RequestRecurringPayload = WebhookPayload<RequestRecurringEventName>;

export type RequestRecurringContext = WebhookEventHandlerContext<RequestRecurringEventName>;

export type RequestRecurringHandler = WebhookEventHandler<RequestRecurringEventName>;

export const isRequestRecurringEvent = createEventPredicate<RequestRecurringEventName>(REQUEST_RECURRING_EVENT);

export function onRequestRecurring(dispatcher: WebhookDispatcher, handler: RequestRecurringHandler): () => void {
  return registerEventHandler(dispatcher, REQUEST_RECURRING_EVENT, handler);
}

export function assertRequestRecurringEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<RequestRecurringEventName> {
  if (event.event !== REQUEST_RECURRING_EVENT) {
    throw new TypeError(`Expected request.recurring event. Received ${event.event}.`);
  }
}
