# Request API Client - Webhook Setup

This guide shows how to configure a local webhook listener, expose it via Cloudflare Tunnel, and capture a signing secret so the live webhook tests can run without guesswork.

## Prerequisites

- Node.js ≥ 20.x and pnpm 10.17.1 (per repo toolchain)
- `pnpm install --filter "./packages/request-api-client"`
- An API key that can create webhooks in the Request API Portal
- Cloudflare Tunnel (`cloudflared`) installed locally
  - macOS: `brew install cloudflared`
  - Other platforms: see [Cloudflare’s docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/)

## 1. Populate the local env file

Update `env/request-api-client.local.env` (copy the `.example` if it doesn’t exist) and fill the credentials you already have:

```dotenv
REQUEST_API_KEY=...
REQUEST_CLIENT_ID=...
REQUEST_PAYEE_WALLET=...
REQUEST_PAYER_WALLET=...
REQUEST_PAYMENT_NETWORK=erc20-sepolia
REQUEST_PAYMENT_CURRENCY=USDC-sepolia
REQUEST_CLIENT_USER_ID=codex-sandbox-...
# Leave REQUEST_WEBHOOK_SECRET empty for now
# (Optional) REQUEST_WEBHOOK_PUBLIC_URL=
# (Optional) REQUEST_WEBHOOK_TUNNEL_HOSTNAME=
# (Optional) REQUEST_WEBHOOK_TUNNEL_NAME=
```

## 2. (Optional) Create a named Cloudflare tunnel

Quick tunnels (`*.trycloudflare.com`) rotate every time you restart. For a persistent developer URL (and only if your Cloudflare account manages a DNS zone you can edit):

```sh
pnpm dlx cloudflared login
pnpm dlx cloudflared tunnel create <tunnel-name>
pnpm dlx cloudflared tunnel route dns <tunnel-name> <subdomain.your-zone.example>
```

> Already authenticated? `cloudflared login` will refuse to overwrite an existing certificate (`~/.cloudflared/cert.pem`). In that case you can skip the login command and reuse the existing credentials.

Record the tunnel name and hostname in the env file so scripts can reuse them. Stick to hostnames covered by your Cloudflare certificate (for Universal SSL this means a single-level subdomain such as `webhook-dev.<your-zone>.<tld>`):

```dotenv
REQUEST_WEBHOOK_TUNNEL_NAME=<tunnel-name>
REQUEST_WEBHOOK_TUNNEL_HOSTNAME=webhook-dev.<your-zone>.<tld>
```

Skip this section if rotating quick tunnels is fine **or** if your Cloudflare login does not control a zone yet. The tooling still works without a named tunnel.

## 3. Start the listener + tunnel via pnpm

```sh
pnpm --filter "./packages/request-api-client" webhook:dev:all
```

What happens:

- `dev:webhook` launches the Express listener on `http://localhost:8787/webhook`. If `REQUEST_WEBHOOK_SECRET` is empty, it runs in verification-bypass mode so you can create the webhook first.
- `tunnel:webhook` launches Cloudflare Tunnel. It uses:
  - `pnpm dlx cloudflared tunnel run <REQUEST_WEBHOOK_TUNNEL_NAME>` when the name is present (persistent hostname).
  - `pnpm dlx cloudflared tunnel --url http://localhost:8787` otherwise (quick tunnel). Set `REQUEST_WEBHOOK_TUNNEL_HOSTNAME` to request a specific quick-tunnel hostname.

Leave the command running. Both processes stream logs and exit together when you press `Ctrl+C`. The scripts load `env/request-api-client.local.env` automatically, so you don’t have to export variables manually.

## 4. Register the webhook & capture the secret

1. Copy the public URL printed by Cloudflare (append `/webhook` if the suffix is missing).
2. Open the Request API Portal -> Webhooks -> “Create webhook”.
3. Paste the URL, select the events you need, and submit.
4. Copy the generated signing secret into `REQUEST_WEBHOOK_SECRET` inside `env/request-api-client.local.env`.
5. Restart `pnpm --filter "./packages/request-api-client" webhook:dev:all` so the listener picks up the new secret and re-enables verification.

Optionally, set `REQUEST_WEBHOOK_PUBLIC_URL` to the same URL so tooling and logs reference it explicitly.

## 5. Run live tests (optional)

Once the secret is in place (and the listener is running), you can hit staging flows and see real deliveries in the console. When running automated suites, the env vars are enough-no additional commands required.

## One-line scripts reference

```sh
# Start listener + tunnel (stop with Ctrl+C)
pnpm --filter "./packages/request-api-client" webhook:dev:all

# Listener only
pnpm --filter "./packages/request-api-client" dev:webhook

# Tunnel only (quick tunnel or named tunnel depending on env vars)
pnpm --filter "./packages/request-api-client" tunnel:webhook
```

Restart `webhook:dev:all` whenever you rotate secrets or change env vars.
