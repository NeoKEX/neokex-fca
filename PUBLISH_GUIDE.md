# Publishing Guide for neokex-fca v2.5.1

## ✅ Pre-Publishing Checklist - COMPLETED

All preparation steps have been completed:

- ✅ **Version Updated**: 2.5.0 → 2.5.1 (patch version for critical bug fix)
- ✅ **CHANGELOG.md Updated**: Comprehensive documentation of v2.5.1 changes
- ✅ **README.md Updated**: Latest updates section reflects v2.5.1
- ✅ **Tests Passing**: All smoke tests pass successfully
- ✅ **Security Check**: 0 vulnerabilities found
- ✅ **Package Contents**: 129 files, includes CHANGELOG.md, README.md, LICENSE
- ✅ **Package Size**: ~300KB (reasonable size)

## 📋 What Changed in v2.5.1

### Critical Bug Fix
Fixed infinite loop crash in MQTT error handler that caused "Maximum call stack size exceeded":
- **Root Cause**: Error handler → stopListening → unsubscribe → error → infinite loop
- **Solution**: Added re-entry guard flag + proper listener cleanup + try-catch wrappers
- **Impact**: Production stability significantly improved for auto-reconnect scenarios

### Technical Improvements
- Error handler now removes only internal listeners (preserves external API compatibility)
- All cleanup operations wrapped in try-catch to prevent cascading failures
- Enhanced error recovery for malformed MQTT messages

## 🚀 How to Publish to npm

### Option 1: Quick Publish (Recommended)

```bash
# 1. Login to npm (first time only)
npm login

# 2. Publish the package
npm publish

# 3. Verify publication
npm view neokex-fca
```

### Option 2: Test Before Publishing

```bash
# 1. Create local tarball
npm pack

# 2. Test in another project
mkdir ../test-install
cd ../test-install
npm init -y
npm install ../workspace/neokex-fca-2.5.1.tgz

# 3. Verify it works
node -e "const neoKex = require('neokex-fca'); console.log('Version:', neoKex.version || 'OK');"

# 4. Return and publish
cd ../workspace
npm publish
```

### Post-Publishing Steps

1. **Verify on npm**
   ```bash
   npm view neokex-fca
   npm view neokex-fca versions
   ```

2. **Tag GitHub Release**
   ```bash
   git tag v2.5.1
   git push origin v2.5.1
   ```

3. **Create GitHub Release**
   - Go to: https://github.com/NeoKEX/neokex-fca/releases/new
   - Tag: v2.5.1
   - Title: "v2.5.1 - Critical Stability Fix"
   - Description: Copy from CHANGELOG.md

4. **Announce Release**
   - Update documentation website (if any)
   - Post on social media/forums
   - Notify users about the critical fix

## 📦 Package Information

- **Package Name**: neokex-fca
- **Version**: 2.5.1
- **License**: MIT
- **Main Entry**: index.js
- **TypeScript**: lib/types/types/index.d.ts
- **Node Version**: >=18.x
- **Total Files**: 129
- **Repository**: https://github.com/NeoKEX/neokex-fca

## 🔍 Final Verification Commands

```bash
# Run all tests
npm test

# Check security
npm audit

# Preview package contents
npm pack --dry-run

# Check package info
npm publish --dry-run
```

## 📝 Notes

- **Breaking Changes**: None - this is a patch release
- **Migration**: No migration needed - drop-in replacement for 2.5.0
- **Dependencies**: All up to date, 0 vulnerabilities
- **Backward Compatible**: Fully compatible with existing 2.x installations

## 🎯 Success Criteria

After publishing, verify:
- [ ] Package appears on npm: https://www.npmjs.com/package/neokex-fca
- [ ] Version 2.5.1 is listed as latest
- [ ] Installation works: `npm install neokex-fca`
- [ ] README displays correctly on npm
- [ ] All exports function properly

## 💡 Tips

1. **First Time Publishing?**
   - You'll need an npm account: https://www.npmjs.com/signup
   - Run `npm login` before publishing

2. **Two-Factor Authentication?**
   - Generate an auth token: https://www.npmjs.com/settings/tokens
   - Use: `npm publish --otp=YOUR_OTP_CODE`

3. **Scoped Package?**
   - This package is NOT scoped (no @username prefix)
   - No special flags needed

4. **Test Installation**
   ```bash
   # After publishing, test fresh install
   npm install -g neokex-fca
   ```

---

**Ready to publish!** 🚀

Just run: `npm publish`
