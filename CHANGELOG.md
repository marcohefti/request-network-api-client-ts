# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.5] - 2024-12-11

### Changed
- Refactored environment file handling and removed `createRequestClientFromEnv` helper
- Standardized env file patterns across repository

### Fixed
- Added `eslint-import-resolver-typescript` to dev dependencies for proper module resolution

### Documentation
- Updated publishing documentation with automated GitHub Actions release process
- General documentation cleanup and improvements

## [0.5.4] - 2024-12-11

### Fixed
- Inlined monorepo tsconfig for standalone usage

## [0.5.3] - 2024-12-11

### Fixed
- CI configuration improvements (removed pnpm cache and frozen-lockfile)

## [0.5.2] - 2024-12-11

### Changed
- Configured OIDC trusted publisher for npm
- Added automated npm publish workflow via GitHub Actions
- Removed dist folder from version control

## [0.5.1] - 2024-12-11

### Changed
- Migrated documentation from VitePress to markdown files
- Added repository-level .env.example
- Removed monorepo-specific references

### Documentation
- Refreshed testing, webhooks, and examples documentation
- Updated guides for standalone repository usage

## [0.5.0] - 2024-12-11

### Added
- Complete webhook support with signature verification
- Webhook middleware for Express and framework integration
- Event dispatcher with typed handlers for all webhook events
- Webhook testing utilities and helpers
- Payment event handlers (confirmed, failed, processing, partial, refunded)
- Compliance event handlers (KYC status, agreement updates)
- Request recurring event handlers
- Payment detail update handlers

### Changed
- Aligned webhook schemas with shared contracts package
- Improved webhook event typing and predicates
- Enhanced webhook documentation and local development setup

### Documentation
- Comprehensive webhook guide (WEBHOOKS.md)
- Cloudflare Tunnel setup for local webhook testing
- Event handler examples and best practices

## [0.4.x] - Earlier Releases

### Added
- Initial TypeScript client for Request Network REST API
- Support for all major domains (requests, payouts, payer, payments, currencies, client IDs)
- Generated types from OpenAPI specification
- Runtime validation with Zod schemas
- HTTP client with retry logic and exponential backoff
- Error handling with `RequestApiError`
- Support for both v1 (legacy) and v2 API endpoints
- Tree-shakeable subpath exports
- Dual module format (ESM + CommonJS)
- Comprehensive documentation
- Integration and unit test suites
- MSW-based testing infrastructure

[0.5.5]: https://github.com/marcohefti/request-network-api-client-ts/compare/v0.5.4...v0.5.5
[0.5.4]: https://github.com/marcohefti/request-network-api-client-ts/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/marcohefti/request-network-api-client-ts/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/marcohefti/request-network-api-client-ts/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/marcohefti/request-network-api-client-ts/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/marcohefti/request-network-api-client-ts/releases/tag/v0.5.0
