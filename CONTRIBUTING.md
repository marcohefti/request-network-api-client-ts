# Contributing to @marcohefti/request-network-api-client

Thanks for your interest in improving the Request Network API client.

This repository is a TypeScript/Node client for the hosted Request Network REST
API. Contributions should keep the package generic (no product-specific or
project-specific behaviour) and aligned with the published OpenAPI contract.

## Getting Started

- Node.js: >= 20 (CI covers 20 / 22 / 24).
- Package manager: pnpm 10.27.0 (recommended via `corepack enable pnpm@10.27.0`).

Install dependencies:

```bash
pnpm install
```

## Development Workflow

Before opening a PR, run:

- `pnpm lint` – lint the source and tests.
- `pnpm tsc` – TypeScript diagnostics (no emit).
- `pnpm test` – Vitest suite (unit + contract guards).
- `pnpm build` – build CJS/ESM bundles and types into `dist/`.

See `docs/TESTING.md` and `docs/ARCHITECTURE.md` for more detail on the test
strategy and module layout.

## Spec and Generated Types

The client is generated from the Request Network OpenAPI spec stored in
`@marcohefti/request-network-api-contracts`. When the upstream spec changes:

```bash
pnpm run prepare:spec
```

Then review and commit the updated spec, generated types, and Zod schemas.

## Reporting Issues and Proposing Changes

- Use GitHub issues for bugs and feature requests.
- Include reproduction steps, relevant Request API versions, and minimal code
  samples where possible.
- For larger changes, consider opening an issue first to discuss the approach
  before submitting a PR.

Security-sensitive issues should follow the guidance in `SECURITY.md`.
