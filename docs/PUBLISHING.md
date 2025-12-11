# @marcohefti/request-network-api-client - Public Release Checklist

Use this document as the running checklist for everything that must be ready before
we spin the client into its own repository and publish `@marcohefti/request-network-api-client` on npm.
Update it as plans evolve. When the list is satisfied, the package should be
ready for a 1.0.0 public launch.

## Repository & Package Metadata
- [ ] Create dedicated repository (or split from monorepo) with LICENSE, code of conduct, contributing guide, and changelog.
- [ ] Set `"private": false`, add `"publishConfig": { "access": "public" }`, and update description/keywords in `package.json`.
- [x] Wire in Changesets (CLI + config) and document the tagging strategy.
  - Current config ignores the other monorepo packages so only `@marcohefti/request-network-api-client` requires changesets. Remove the ignore list once this package lives in its own repository.

## Spec & Generated Types
- [ ] Confirm `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json` is current. Re-run `pnpm run prepare:spec` and commit regenerated outputs (spec lives in the shared contracts package).
- [ ] Add CI guard that runs `pnpm run prepare:spec` and fails on dirty git status to catch spec drift.
- [ ] Document required spec refresh cadence (e.g., monthly or on upstream release notes).

## Build, Lint, Test Automation
- [ ] Extend CI to run `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` on every PR.
- [ ] Add a matrix to cover Node versions we promise to support (baseline v20. Include 20/22/24).
- [ ] Integrate coverage reporting (Vitest + V8) and gate merges on coverage thresholds once the test suite exists.

## Documentation & Examples
- [ ] Finalize README quick start, auth examples, and module usage (`docs/ARCHITECTURE.md` stays as deeper reference).
- [ ] Publish API reference (TypeDoc or similar) and link from README.
- [ ] Provide runnable examples (Node script + browser demo) validated against the latest API.
- [ ] Re-enable the VitePress deployment workflow for pushes (restore the `push` trigger in `.github/workflows/sdk-docs.yml` and pass `enablement: true` to `actions/configure-pages`) once the repository is public or on a plan that supports private Pages.
- [ ] Configure GitHub Pages to use GitHub Actions as the deployment source after the workflow is re-enabled.

## Quality & Support
- [ ] Establish versioning policy (semver), security contact, and support expectations in README/CONTRIBUTING.
- [ ] Ensure error messaging, logging, and retry defaults align with documented guidance.
- [ ] Prepare migration notes for early adopters (if releasing from 0.x to 1.0).

## Release Execution
- [ ] Verify npm org access, 2FA, and provenance signatures if required.
- [ ] Dry-run publish (`pnpm publish --dry-run`) to confirm package contents.
- [ ] Tag the release, push changelog entry, and announce availability (blog, docs site, etc.).
- [x] Add manual “Changesets Release” GitHub workflow stub (private repositories skip execution).

Keep this checklist close to the actual work-when new release requirements surface,
add them here so the team has a single source of truth for launch readiness.
