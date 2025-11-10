# NPM Publishing Guide for NeoKEX-FCA

This guide walks you through publishing the NeoKEX-FCA library to npm.

## Prerequisites

### 1. NPM Account Setup
- Create an account at [npmjs.com](https://www.npmjs.com/signup) if you don't have one
- Verify your email address
- Enable two-factor authentication (recommended)

### 2. Login to NPM
```bash
npm login
```
Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify login:
```bash
npm whoami
```

## Pre-Publishing Checklist

### ✓ Package Verification
Run these commands to verify everything is ready:

```bash
# 1. Check package.json is valid
npm run lint

# 2. Preview what will be published
npm pack --dry-run

# 3. Create a test tarball (optional)
npm pack

# 4. Test the package locally
npm install ./neokex-fca-3.1.0.tgz
```

### ✓ Files Included
The following files will be published (see `files` field in package.json):
- `lib/` - Main entry point and TypeScript types
- `src/` - Source code
- `README.md` - Documentation
- `LICENSE` - MIT License
- `CHANGELOG.md` - Version history

### ✓ Files Excluded
These files are excluded via `.npmignore`:
- Test files (`test-*.js`, `*test*.js`)
- Demo files (`demo.js`, `example.js`, `final-demo.js`)
- Sensitive files (`cookies.json`, `*.log`)
- Development files (`replit.md`, `FIXES_APPLIED.md`)
- Images and assets (`*.png`, `*.jpg`)
- IDE and version control files

## Publishing Steps

### Option 1: First-Time Publish
```bash
# Publish to npm registry
npm publish

# If package name is already taken, you can publish under a scope
npm publish --access public
```

### Option 2: Publishing Updates

1. **Update Version Number**
   ```bash
   # For patch releases (bug fixes): 3.1.0 → 3.1.1
   npm version patch

   # For minor releases (new features): 3.1.0 → 3.2.0
   npm version minor

   # For major releases (breaking changes): 3.1.0 → 4.0.0
   npm version major
   ```

2. **Update CHANGELOG.md**
   - Document all changes in the new version section
   - Follow the existing format

3. **Publish**
   ```bash
   npm publish
   ```

### Option 3: Publishing with Tags

```bash
# Publish as latest (default)
npm publish

# Publish as beta
npm publish --tag beta

# Publish as next
npm publish --tag next
```

## Post-Publishing

### 1. Verify Publication
```bash
# Check package on npm
npm view neokex-fca

# Install from npm to test
npm install neokex-fca
```

### 2. Update Repository
```bash
# Tag the release in git
git tag -a v3.1.0 -m "Release version 3.1.0"
git push origin v3.1.0

# Push to GitHub
git push origin main
```

### 3. Create GitHub Release
- Go to your GitHub repository
- Click "Releases" → "Create a new release"
- Select the tag you just created
- Copy content from CHANGELOG.md for this version
- Publish the release

## Package Information

After publishing, your package will be available at:
- **NPM Page**: https://www.npmjs.com/package/neokex-fca
- **Installation**: `npm install neokex-fca`
- **Import**: `const { login } = require('neokex-fca');`

## Version Management

Current version: **3.1.0**

Semantic Versioning (SemVer):
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

## Common Issues

### Issue: "You do not have permission to publish"
**Solution**: Make sure you're logged in with `npm login` and have permission to publish the package name.

### Issue: "Package name already exists"
**Solution**: Either:
1. Choose a different package name in `package.json`
2. Publish under your username scope: `@yourusername/neokex-fca`

### Issue: "Cannot publish over existing version"
**Solution**: Update version number using `npm version patch/minor/major`

### Issue: ".gitignore files being published"
**Solution**: Check `.npmignore` file - it overrides `.gitignore` for npm publishing

## Testing Before Publishing

Always test your package before publishing:

```bash
# 1. Create tarball
npm pack

# 2. Install in a test project
cd /tmp/test-project
npm install /path/to/neokex-fca-3.1.0.tgz

# 3. Test the package
node
> const { login } = require('neokex-fca');
> console.log(typeof login); // should print 'function'
```

## Unpublishing (Emergency Only)

If you need to remove a version (within 72 hours):
```bash
npm unpublish neokex-fca@3.1.0
```

⚠️ **Warning**: Unpublishing is discouraged and can only be done within 72 hours. Use deprecation instead:
```bash
npm deprecate neokex-fca@3.1.0 "This version has critical bugs, please upgrade"
```

## Support

- **Documentation**: See README.md
- **Issues**: https://github.com/NeoKEX/neokex-fca/issues
- **NPM Package**: https://www.npmjs.com/package/neokex-fca

---

**Ready to publish?** Run: `npm publish`

Good luck! 🚀
