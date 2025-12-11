# Scope & Positioning

This document clarifies what this client is, what it's not, and when to use it vs the official Request Network protocol SDK.

## What This Is

A typed API client for the Request Network hosted REST API (v2), usable in Node (API key, Node 20+) and Browser/Edge (client ID).

### Focus Areas

- Product/integration flows:
  - Requests/invoices
  - Payouts (single, batch, recurring)
  - Payment routes
  - Payment intents
  - Payer/compliance (KYC, banking details)
  - Client IDs
  - Currencies
- Consistent errors (status/code/requestId/retryAfterMs)
- Retry/backoff with exponential backoff and Retry-After header support
- Small helpers for common tasks

### Key Features

- TypeScript-first with types generated from OpenAPI spec
- Runtime validation via Zod schemas
- Fetch-based HTTP client (works in Node 20+ and modern browsers)
- Webhook signature verification and event handlers
- Subpath exports for tree-shaking (`@marcohefti/request-network-api-client/requests`)
- Support for both REST v2 and legacy v1 endpoints

## What This Is Not

- **Not the official Request protocol SDK** - This is not `@requestnetwork/*`.
- **Not a wallet/signature toolkit** - No signer/key management.
- **Does not talk directly to Request Nodes** - Does not send on-chain transactions.
- **No direct "pay tx" abstractions** - Beyond normalizing transactions returned by the REST API.

## Decision Rules: When to Use Which

### Use This Client When

You call hosted REST endpoints:
- `/v2/request` - Create and manage requests
- `/v2/payouts` - Create payouts
- `/v2/payer` - Manage compliance and banking details
- `/v2/currencies` - List currencies and conversion routes
- `/v2/client-ids` - Manage client IDs
- `/v2/payments` - Search payment history

You authenticate with:
- **API key** (server-side)
- **Client ID** (browser/frontend)

You want:
- Typed inputs/outputs
- Consistent errors
- Retry/backoff
- Easy domain facades
- Webhook helpers

### Use the Official Protocol SDK When

You need to:
- Create/update requests directly on-chain via a Request Node
- Manage wallets/signers
- Low-level control over transactions
- Build a dapp that operates at the protocol layer

The official SDK targets the protocol (on-chain) and doesn't package the REST v2 flows (payer/compliance, payouts, routes, client IDs) as first-class methods.

### Can I Mix Them?

Yes. The two are complementary:

- Use the official protocol SDK (`@requestnetwork/*`) for protocol logic and signer usage.
- Use this API client (`@marcohefti/request-network-api-client`) for hosted REST endpoints.

Keep protocol-facing code separate from REST API integrations.

## FAQ

### Why not just use the official SDK?

The official SDK targets the protocol (on-chain) and doesn't package the REST v2 flows (payer/compliance, payouts, routes, client IDs) as first-class methods. This client wraps the hosted REST API to make integrations (apps, plugins) feel Stripe-simple.

### Is this official?

No, this is a community-maintained client. It's built to consume the public Request Network REST API and provides a better developer experience for REST integrations.

### Does this support the protocol SDK's features?

No. This client only covers the hosted REST API surface. For protocol features (on-chain request creation, signing, Request Node interactions), use the official `@requestnetwork/*` packages.

### Can I use this in the browser?

Yes. The client works in modern browsers and edge runtimes (Cloudflare Workers, Vercel Edge Functions, etc.) that support the Fetch API. Use a Client ID for browser authentication.

### Does this work with self-hosted Request Nodes?

No. This client is designed for the hosted Request Network REST API. For self-hosted nodes, use the official protocol SDK.

### What about webhooks?

This client includes webhook signature verification, event parsing, middleware, and testing utilities. See [WEBHOOKS.md](./WEBHOOKS.md) for details.

## Compatibility

- **Node.js**: 20.x, 22.x, 24.x
- **Browsers**: Modern browsers with Fetch API support
- **Edge Runtimes**: Cloudflare Workers, Vercel Edge, Deno, Bun

## See Also

- [QUICK-START.md](./QUICK-START.md) - Installation and basic usage
- [DOMAINS.md](./DOMAINS.md) - Domain API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and internals
- [Official Request Network Docs](https://docs.request.network/) - Protocol documentation
