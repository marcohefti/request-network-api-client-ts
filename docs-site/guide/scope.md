# Scope & Positioning

What this is
- A typed API client for the Request Network hosted REST API (v2), usable in Node (API key, Node 20+) and Browser/Edge (client ID).
- Focused on product/integration flows: requests/invoices, payouts, payment routes, payment intents, payer/compliance, client IDs, currencies.
- Provides consistent errors (status/code/requestId/retryAfterMs), retry/backoff, and small helpers for common tasks.

What this is not
- Not the official Request protocol SDK and not a wallet/signature toolkit.
- Does not talk directly to Request Nodes or send on‑chain transactions.
- No signer/key management. No direct “pay tx” abstractions (beyond normalizing transactions returned by the REST API).

When to use which (decision rules)
- Use this client when:
  - You call hosted REST endpoints (/v2/request, /v2/payouts, /v2/payer, /v2/currencies, /v2/client-ids).
  - You authenticate with an API key (server) or client ID (browser).
  - You want typed inputs/outputs, consistent errors, retry/backoff, and easy domain facades.
- Use the official protocol SDK (`@requestnetwork/*`) when:
  - You need to create/update requests directly on-chain via a Request Node.
  - You already manage wallets/signers and want low-level control over transactions.
  - You’re building a dapp that operates at the protocol layer.

FAQ
- “Why not just use the official SDK?”
  - The official SDK targets the protocol (on‑chain) and doesn’t package the REST v2 flows (payer/compliance, payouts, routes, client IDs) as first‑class methods. This client wraps the hosted REST API to make integrations (apps, plugins) feel Stripe‑simple.
- “Can I mix them?”
  - Yes. Keep protocol logic and signer usage in your protocol‑facing code. Call this API client for hosted endpoints. They complement each other.

See also
- Before/After examples: [/guide/before-after](/guide/before-after)
- HTTP client details: [/guide/http-client](/guide/http-client)
