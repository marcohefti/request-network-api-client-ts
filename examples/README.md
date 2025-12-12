# Examples

This folder contains minimal, copy‑pasteable examples for @marcohefti/request-network-api-client.

## Prerequisites

- Node.js 20.x+
- pnpm 10.17.1
- A Request Network API key (for the Node example) or a Client ID (for the Browser example)

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
