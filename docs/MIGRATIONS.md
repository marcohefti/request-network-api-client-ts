# Migration Guide

This document provides migration guidance for breaking changes in `@marcohefti/request-network-api-client`.

## Current Version: 0.5.x

While on the `0.x` release line, minor and patch releases may include breaking changes as the API surface stabilizes. This is standard practice for pre-1.0 packages following Semantic Versioning.

**Current policy:**
- Breaking changes are documented in [CHANGELOG.md](../CHANGELOG.md)
- We try to minimize disruption and provide migration paths
- Major architectural changes are saved for the 1.0 release

## Future: Migrating to 1.0.0

When `@marcohefti/request-network-api-client` reaches 1.0.0, we will adopt strict semantic versioning:

- **Patch releases (1.0.x)**: Bug fixes only, fully backward compatible
- **Minor releases (1.x.0)**: New features, backward compatible
- **Major releases (2.0.0)**: Breaking changes with migration guides

### Expected 1.0 Breaking Changes

The following changes are planned for the 1.0 release. This section will be updated as we approach 1.0:

#### Potential API Simplifications

- Consolidation of legacy v1 endpoints (currently available via `.legacy` properties)
- Removal of deprecated methods and parameters
- Standardization of naming conventions across domains

#### TypeScript Requirements

- May require TypeScript 5.x or higher
- Stricter type checking for better safety

#### Runtime Validation

- May change default validation behavior
- More granular validation controls

## Migration Strategies

### Testing Breaking Changes

Before upgrading to a major version:

1. **Review the CHANGELOG**: Check [CHANGELOG.md](../CHANGELOG.md) for breaking changes
2. **Update in a branch**: Test the upgrade in a separate git branch
3. **Run your test suite**: Ensure all tests pass
4. **Check TypeScript errors**: Fix any new type errors
5. **Test in staging**: Deploy to staging environment before production

### Gradual Migration

For large codebases:

1. **Pin the current version**: Use exact version in package.json (`"0.5.5"` not `"^0.5.5"`)
2. **Create adapters**: Wrap the client in your own adapter layer
3. **Migrate incrementally**: Update one module/domain at a time
4. **Maintain compatibility**: Use feature flags to toggle new behavior

### Version Pinning

If you need stability:

```json
{
  "dependencies": {
    "@marcohefti/request-network-api-client": "0.5.5"
  }
}
```

Use exact versions (no `^` or `~`) to prevent automatic updates.

## Historical Migrations

### No Breaking Changes Yet

As of version 0.5.5, there have been no major breaking changes that require migration.

Future breaking changes will be documented here with:
- What changed
- Why it changed
- How to migrate your code
- Code examples (before/after)

---

## Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG.md](../CHANGELOG.md) for specific version changes
2. Review [GitHub Issues](https://github.com/marcohefti/request-network-api-client-ts/issues) for known migration problems
3. Create a new issue if you need help:
   - Include your current version
   - Include the version you're migrating to
   - Provide code samples showing the issue
   - Include error messages

## Contributing Migration Guides

If you've successfully migrated through a breaking change and want to help others:

1. Document your migration steps
2. Include code examples (before/after)
3. Submit a PR to update this guide
4. Your contribution will help the community!

---

**Note**: This guide will be updated with each major release. Check back when upgrading to new versions.
