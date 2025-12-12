# Examples

This folder contains copy-pasteable examples for @marcohefti/request-network-api-client.

## Prerequisites

- Node.js 20.x+
- pnpm 10.17.1
- A Request Network API key (for the Node examples) or a Client ID (for the Browser example)
- Required environment variables:
  - `REQUEST_API_KEY` - Your API key from the Request API Portal
  - `REQUEST_PAYEE_WALLET` - Wallet address to receive payments (for invoice examples)
  - `REQUEST_PAYER_WALLET` - Wallet address to make payments (for invoice examples)

## Available Examples

### 1. Quick Start (Node)

Basic example showing simple API calls.

**Location:** `examples/node/quick-start.mjs`

### 2. Complete Invoice Flow

End-to-end example of creating a payment request, getting routes, retrieving payment calldata, and checking status.

**Location:** `examples/invoice-flow/create-and-pay.mjs`

**What it demonstrates:**
- Creating payment requests
- Fetching payment routes
- Getting payment calldata/intents
- Checking request status
- Error handling

**Run:**
```sh
export REQUEST_API_KEY=your_api_key
export REQUEST_PAYEE_WALLET=0xYourWallet
export REQUEST_PAYER_WALLET=0xPayerWallet
node examples/invoice-flow/create-and-pay.mjs
```

### 3. Error Handling & Retry Patterns

Comprehensive example showing different error handling scenarios and retry strategies.

**Location:** `examples/error-handling/retry-patterns.mjs`

**What it demonstrates:**
- Basic error handling with `isRequestApiError()`
- Handling specific error codes (401, 403, 404, 429)
- Custom retry policies
- Timeout handling
- Validation error handling
- Structured logging with `toJSON()`
- Graceful degradation
- Request cancellation with AbortController

**Run:**
```sh
export REQUEST_API_KEY=your_api_key
node examples/error-handling/retry-patterns.mjs
```

### 4. Batch Payouts

Example of creating multiple payouts in a single batch (useful for payroll or vendor payments).

**Location:** `examples/payouts/batch-payout.mjs`

**What it demonstrates:**
- Creating batch payouts
- Handling multiple recipients
- Batch operation best practices

**Run:**
```sh
export REQUEST_API_KEY=your_api_key
node examples/payouts/batch-payout.mjs
```

### 5. Webhooks

Webhook handling with Express, signature verification, and event dispatchers.

**Location:** `examples/webhooks/local-listener.ts`

See [docs/WEBHOOKS.md](../docs/WEBHOOKS.md) for detailed webhook setup instructions.

**Run:**
```sh
pnpm webhook:dev:all
```

### 6. Browser Example

Basic browser example using client ID authentication.

**Location:** `examples/browser/quick-start.html`

## Node - Quick Start

1. Build the client so Node can resolve the self‑reference import:

   ```sh
   pnpm build
   ```

2. Export your API key and run the script:

   ```sh
   export REQUEST_API_KEY=your_api_portal_key
   node examples/node/quick-start.mjs
   ```

   The script creates a client using explicit configuration, lists currencies, and performs a sample payments search.

## Browser - Quick Start

The browser example expects a bundler (Vite, Webpack, etc.) or an import map that points `@marcohefti/request-network-api-client` to the built ESM bundle.

1. Build the client:

   ```sh
   pnpm build
   ```

2. Use a tiny import map (for a quick local demo without a bundler):

   ```html
   <!doctype html>
   <html>
     <head>
       <meta charset="utf-8" />
       <script type="importmap">
         {
           "imports": {
           "@marcohefti/request-network-api-client": "/dist/esm/index.js"
           }
         }
       </script>
     </head>
     <body>
       <script type="module" src="/examples/browser/quick-start.html"></script>
     </body>
   </html>
   ```

   Serve the repo root with any static server (e.g., `npx http-server .`), set your Client ID inside `examples/browser/quick-start.html`, then open the page. The script fetches conversion routes and a sample payments search page.

### Notes

- Browser/Edge requires a Client ID. Browsers set the `Origin` header automatically.
- For advanced setups, prefer a bundler and import the package normally: `import { createRequestClient } from '@marcohefti/request-network-api-client'`.
- If you change code, rebuild with `pnpm build` before reloading examples.
