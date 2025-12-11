# Webhook Test Plan

This directory will host unit suites for the webhook module as phases 2-6 land.
Planned coverage:

- Signature verifier: success path, tampered payload, multi-secret rotation, timestamp tolerance failures.
- Express middleware: valid requests (200), missing raw body (400), invalid signature (401), dispatcher invocation ordering, skip-verification toggle.
- Dispatcher: handler registration/unregistration, once-handlers, error bubbling, contextual data propagation.
- Event helpers (per phase): happy path fixtures for each event, predicate helpers/type narrowing, middleware integration (typed payload attached to request).
- Parity guard: ensure `WEBHOOK_EVENT_NAMES` matches `@request-suite/request-client-contracts/specs/webhooks/request-network-webhooks.json` and fails when an event is missing helpers.

Fixtures live under `@request-suite/request-client-contracts/fixtures/webhooks/<event>.json`, signed with the shared helper introduced in Phase 7. Keep the fixture set aligned with `@request-suite/request-client-contracts/specs/webhooks/request-network-webhooks.json` and commit updates in the contracts package first, then adjust tests if payloads change.

## Implemented so far

- `payment.confirmed`: helper coverage with middleware + dispatcher assertions (`tests/webhooks/payment-confirmed.test.ts`).
- `payment.failed`: failure metadata, predicate guards, and dispatcher error propagation (`tests/webhooks/payment-failed.test.ts`).
- `payment.processing`: stage helpers, terminal-state predicates, invalid stage validation, middleware signature enforcement (`tests/webhooks/payment-processing.test.ts`).
- `payment_detail.updated`: approval/rejection predicates, optional metadata assertions, middleware tamper guards (`tests/webhooks/payment-detail-updated.test.ts`).
- `compliance.updated`: KYC/agreements predicates, summary helper, tampered payload rejection (`tests/webhooks/compliance-updated.test.ts`).
- Parity guard ensures exported event names match the spec (`tests/webhooks/event-parity.test.ts`).
