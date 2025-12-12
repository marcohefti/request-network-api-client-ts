---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description

A clear and concise description of what the bug is.

## To Reproduce

Steps to reproduce the behavior:

1. Install version '...'
2. Create client with '...'
3. Call method '...'
4. See error

## Code Sample

```typescript
// Minimal code sample that reproduces the issue
import { createRequestClient } from '@marcohefti/request-network-api-client';

const client = createRequestClient({
  apiKey: process.env.REQUEST_API_KEY,
});

// Code that triggers the bug
await client.currencies.list();
```

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

What actually happened. Include error messages and stack traces if applicable.

```
Error: ...
  at ...
```

## Environment

- Package version: [e.g., 0.5.5]
- Node.js version: [e.g., 20.10.0]
- Runtime: [e.g., Node.js, Browser (Chrome 120), Cloudflare Workers]
- OS: [e.g., macOS 14.1, Ubuntu 22.04]

## Additional Context

Add any other context about the problem here:
- Are you using TypeScript or JavaScript?
- Are you using ESM or CommonJS?
- Any relevant environment variables or configuration?
- Does this happen consistently or intermittently?

## Request API Details

If this involves API calls:
- Request ID (if available): `...`
- Endpoint called: `...`
- Request payload (sanitize any sensitive data): `...`
