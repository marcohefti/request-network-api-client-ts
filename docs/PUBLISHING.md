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
- [x] From the repo root, run and pass:
  - `pnpm lint`
  - `pnpm tsc`
  - `pnpm test`
  - `pnpm build`
- [ ] Optionally run additional coverage or Node version matrices locally before publishing (for example, a `coverage:matrix` script that mirrors your CI configuration).

### Documentation & Examples (0.5.x)
- [x] Keep `README.md` minimal: purpose, installation, quick start, compatibility, and links into `docs/*.md`.
- [x] Ensure documentation is up to date:
  - `docs/QUICK-START.md` - Installation and basic usage
  - `docs/DOMAINS.md` - API reference for all domains
  - `docs/HTTP-AND-ERRORS.md` - HTTP client and error handling
  - `docs/SCOPE.md` - When to use this vs protocol SDK
  - `docs/WEBHOOKS.md` - Webhook setup and handlers
  - `docs/ARCHITECTURE.md` - System design
  - `docs/TESTING.md` - Test strategy
  - `docs/PUBLISHING.md` - Release process
- [x] Ensure at least one runnable example in `examples/` works against the current Request API (e.g., a Node script that lists currencies).
- [ ] (Optional for 0.5.x) Generate and publish TypeDoc (or similar) API reference, linked from `README.md`.

### Quality & Support (0.5.x)
- [x] Document versioning policy (SemVer with 0.x “breaking changes may occur” caveat) in `README.md`.
- [x] Add a short “Support & issues” section in `README.md` pointing to the GitHub repo for bug reports and questions.
- [ ] Confirm error handling behaviour and retry defaults are described at a high level in `docs/WEBHOOKS.md`, `docs/ENDPOINTS.md`, or the docs site.

### Release Execution (Automated via GitHub Actions)

Publishing is fully automated using GitHub Actions and OIDC trusted publishers. No npm tokens required.

**To publish a new version:**

1. Bump the version using pnpm:
   ```bash
   pnpm version patch   # for bug fixes (0.5.5 -> 0.5.6)
   pnpm version minor   # for new features (0.5.5 -> 0.6.0)
   pnpm version major   # for breaking changes (0.5.5 -> 1.0.0)
   ```

2. Push the tag to GitHub:
   ```bash
   git push --follow-tags
   ```

3. GitHub Actions automatically:
   - Runs validation (`pnpm tsc && pnpm lint && pnpm test`)
   - Builds the package (`pnpm build`)
   - Publishes to npm using OIDC authentication
   - Generates provenance attestations

4. Verify the publish succeeded:
   - Check GitHub Actions: https://github.com/marcohefti/request-network-api-client-ts/actions
   - Check npm: https://www.npmjs.com/package/@marcohefti/request-network-api-client

**Prerequisites:**
- Trusted publisher configured on npmjs.com (already set up)
- Workflow file exists: `.github/workflows/publish.yml`
- Repository uses npm 11.5.1+ in CI

**Manual publish (emergency only):**
If GitHub Actions is unavailable, you can publish manually:
```bash
npm login
pnpm publish --access public
```

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
- [x] Publish workflow runs `pnpm lint`, `pnpm tsc`, `pnpm test`, and `pnpm build` on tag push.
- [ ] Add PR/push workflow for validation on every commit (not just releases).
- [x] Add a Node version matrix (20/22/24/25) in CI to match the documented compatibility matrix.
- [ ] Integrate coverage reporting (Vitest + V8) and enforce minimum thresholds for merges.
- [ ] Publish API reference docs (TypeDoc or equivalent) and link from `README.md`.

### Quality & Support
- [ ] Finalize versioning policy and support expectations in `README.md` and `CONTRIBUTING.md`.
- [ ] Provide migration notes for early adopters when moving from 0.x to 1.0.0.
- [ ] Confirm security reporting (`SECURITY.md`) and disclosures meet your organization’s standards.

Keep this document updated as the client evolves. When preparing a specific
release (0.5.1, 0.6.0, etc.), use the 0.5.x checklist as the baseline and
pull in additional hardening items from the 1.0.0 section as they become
relevant.
