# Publishing Guide for neokex-fca

This guide explains how to publish the neokex-fca package to npm.

## Pre-Publishing Checklist

✅ **Completed:**
- [x] Version bumped to 4.2.5 in package.json
- [x] CHANGELOG.md updated with v4.2.5 release notes
- [x] Error 1545012 retry logic implemented and tested
- [x] Unnecessary files removed (attached_assets, test files, appstate.json)
- [x] .npmignore configured to exclude development files
- [x] package.json "files" field specifies exact publish list
- [x] All validation tests passing
- [x] Package dry-run verified (74 files, 80.4 kB)

## Package Contents

The published package includes:
- `index.js` - Main entry point
- `src/` - All API implementations and utilities (74 files total)
- `examples/` - 3 example usage files
- `LICENSE-MIT` - MIT license
- `README.md` - Main documentation
- `CHANGELOG.md` - Version history
- `THEME_FEATURES.md` - Theme features documentation

**Total package size:** 80.4 kB compressed, 365.0 kB unpacked

## Publishing Steps

### 1. Final Verification

```bash
# Run validation tests
npm run validate

# Verify package contents
npm pack --dry-run

# Check for any issues
npm audit
```

### 2. Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 3. Publish to npm

For the first time or regular releases:

```bash
npm publish
```

For beta/pre-release versions:

```bash
npm publish --tag beta
```

### 4. Verify Publication

```bash
# Check the published package
npm view neokex-fca

# Check the specific version
npm view neokex-fca@4.2.5
```

### 5. Test Installation

```bash
# In a separate directory
mkdir test-install && cd test-install
npm init -y
npm install neokex-fca@4.2.5

# Verify it works
node -e "const { login } = require('neokex-fca'); console.log('✅ Package installed successfully');"
```

## Post-Publishing Tasks

1. **Tag the Git repository:**
   ```bash
   git tag -a v4.2.5 -m "Release v4.2.5: Simplified Error 1545012 handling"
   git push origin v4.2.5
   ```

2. **Create GitHub Release:**
   - Go to your repository's releases page
   - Create a new release with tag v4.2.5
   - Copy release notes from CHANGELOG.md
   - Publish the release

3. **Update Documentation:**
   - Ensure README badges show latest version
   - Update any external documentation links

## Version Management

Current version: **4.2.5**

For future releases:
- Patch releases (bug fixes): 4.2.5, 4.2.6, etc.
- Minor releases (new features): 4.3.0, 4.4.0, etc.
- Major releases (breaking changes): 5.0.0, 6.0.0, etc.

Update version in:
1. `package.json`
2. `CHANGELOG.md` (add new entry)
3. Any version references in documentation

## Troubleshooting

### "You do not have permission to publish"
- Ensure you're logged in: `npm whoami`
- Check package name availability: `npm view neokex-fca`
- Verify you have publish rights for this package

### "Version already exists"
- Increment the version in package.json
- Run `npm publish` again

### "Package size too large"
- Check what's being included: `npm pack --dry-run`
- Update .npmignore to exclude large files
- Verify "files" field in package.json

## Support

For issues or questions:
- GitHub Issues: https://github.com/NeoKEX/neokex-fca/issues
- npm Package: https://www.npmjs.com/package/neokex-fca
- Contact: contact@neokex.dev
