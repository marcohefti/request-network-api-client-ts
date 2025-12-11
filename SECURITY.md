# Security Policy

The `@marcohefti/request-network-api-client` package is a generic client for
the hosted Request Network REST API. Please follow this policy when reporting
security issues.

## Reporting a Vulnerability

- Do **not** open public GitHub issues for security vulnerabilities.
- Instead, use the GitHub Security Advisories workflow for the
  `marcohefti/request-network-api-client-ts` repository to privately disclose
  the issue to the maintainer.

When reporting, include:

- A clear description of the issue and the affected versions.
- Minimal reproduction steps or code samples, if available.
- Any known impact on confidentiality, integrity, or availability.

## Scope

This policy covers:

- The TypeScript client library published as
  `@marcohefti/request-network-api-client`.
- Its HTTP pipeline, error handling, and runtime validation layers.

Vulnerabilities in the underlying Request Network API itself should be reported
through Request’s official channels rather than this client library.

