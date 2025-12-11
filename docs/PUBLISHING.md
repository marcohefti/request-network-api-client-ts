# @marcohefti/request-network-api-client – Publishing Checklist

Use this checklist when preparing public releases of
`@marcohefti/request-network-api-client` on npm. For now, the focus is a solid
0.5.x public line, with additional hardening items tracked for a future 1.0.0.

## 0.5.0 Public Release Checklist

### Repository & Package Metadata (0.5.x)
- [x] Client lives in its own Git repository with `package.json` pointing at `git@github.com:marcohefti/request-network-api-client-ts.git`.
- [x] Add top-level `LICENSE` file that matches `"license": "MIT"` in `package.json`.
- [x] Add minimal `CONTRIBUTING.md` (how to run tests, coding style, how to report issues).
- [x] Add minimal `SECURITY.md` (how to report vulnerabilities).
- [x] Ensure `"private": false` in `package.json`.
- [x] Add `"publishConfig": { "access": "public" }` to `package.json`.
- [x] Confirm package metadata is accurate:
  - `name: "@marcohefti/request-network-api-client"`
  - `description`, `keywords`, `repository`, and `engines.node` reflect current scope.

### Spec & Generated Types (0.5.x)
- [x] Run `pnpm run prepare:spec` and commit any changes:
  - `pnpm run fetch:openapi`
  - `pnpm run generate:types`
  - `pnpm run generate:zod`
- [x] Confirm the bundled OpenAPI spec comes from `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json` and matches the production Request API.

### Build, Lint, and Tests (0.5.x)
- [ ] From the repo root, run and pass:
  - `pnpm lint`
  - `pnpm tsc`
  - `pnpm test`
  - `pnpm build`
- [ ] Optionally run the full matrix locally before publishing:
  - `pnpm coverage`
  - `pnpm --filter "./packages/request-network-api-client-ts" coverage:matrix` (or `test:matrix`) from the monorepo root.

### Documentation & Examples (0.5.x)
- [x] Keep `README.md` minimal: purpose, installation, quick start, compatibility, and links into `docs/*.md` and `docs-site/`.
- [ ] Ensure `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/ENDPOINTS.md`, and `docs/WEBHOOKS.md` are fresh enough to match the 0.5.0 surface (no obvious lies or deprecated flows).
- [ ] Ensure at least one runnable example in `examples/` works against the current Request API (e.g., a Node script that lists currencies).
- [ ] (Optional for 0.5.x) Generate and publish TypeDoc (or similar) API reference, linked from `README.md`.
- [ ] (Optional for 0.5.x) Keep the VitePress docs site (`docs-site/`) building locally via:
  - `pnpm docs:dev`
  - `pnpm docs:build`

### Quality & Support (0.5.x)
- [ ] Document versioning policy (SemVer with 0.x “breaking changes may occur” caveat) in `README.md`.
- [ ] Add a short “Support & issues” section in `README.md` pointing to the GitHub repo for bug reports and questions.
- [ ] Confirm error handling behaviour and retry defaults are described at a high level in `docs/WEBHOOKS.md`, `docs/ENDPOINTS.md`, or the docs site.

### Release Execution (0.5.0)
- [ ] Ensure you are logged into npm as `marcohefti` with 2FA configured for publish.
- [ ] From the TS client repository root, dry-run the publish:
  - `pnpm publish --access public --dry-run`
- [ ] Tag the release locally:
  - `git tag v0.5.0`
- [ ] Publish the package from the repository root:
  - `pnpm publish --access public`
- [ ] Push commits and tags:
  - `git push`
  - `git push --tags`
- [ ] Add a short 0.5.0 section to `CHANGELOG.md` (once the file exists) or summarize changes in the GitHub release notes.
- [x] Maintain a manual Changesets-based release workflow stub (GitHub Actions) for future automation.

## 1.0.0 Hardening Checklist (Later)

These items are not required for the 0.5.x line but should be in place before
a 1.0.0 “stable” release.

### Repository & Governance
- [ ] Flesh out `CONTRIBUTING.md` with full coding standards, branch/PR expectations, and release guidelines.
- [ ] Add `CODE_OF_CONDUCT.md` and link from `README.md`.
- [ ] Maintain a detailed `CHANGELOG.md` with entries per release.

### Spec & Automation
- [ ] Add CI guard that runs `pnpm run prepare:spec` and fails on dirty git status to catch spec drift.
- [ ] Document a spec refresh cadence (e.g., monthly or on upstream Request API release notes).

### CI, Coverage, and Docs
- [ ] Extend CI to run `pnpm lint`, `pnpm tsc`, `pnpm test`, and `pnpm build` on every PR and push to main.
- [ ] Add a Node version matrix (20/22/24) in CI to match the documented compatibility matrix.
- [ ] Integrate coverage reporting (Vitest + V8) and enforce minimum thresholds for merges.
- [ ] Publish API reference docs (TypeDoc or equivalent) and link from `README.md`.
- [ ] Re-enable the VitePress deployment workflow for pushes (restore the `push` trigger in `.github/workflows/sdk-docs.yml` and pass `enablement: true` to `actions/configure-pages`) once the repository is public or on a plan that supports private Pages.
- [ ] Configure GitHub Pages with GitHub Actions as the deployment source for the docs site.

### Quality & Support
- [ ] Finalize versioning policy and support expectations in `README.md` and `CONTRIBUTING.md`.
- [ ] Provide migration notes for early adopters when moving from 0.x to 1.0.0.
- [ ] Confirm security reporting (`SECURITY.md`) and disclosures meet your organization’s standards.

Keep this document updated as the client evolves. When preparing a specific
release (0.5.1, 0.6.0, etc.), use the 0.5.x checklist as the baseline and
pull in additional hardening items from the 1.0.0 section as they become
relevant.
