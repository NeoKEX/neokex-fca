# Changelog

All notable changes to this project will be documented in this file.

## [4.2.5] - 2025-11-11

### 🎉 Fixed
- **Error 1545012 Advanced Handling**: Major improvements to error 1545012 retry logic and rate limiting protection
  - Increased exponential backoff delays from (1s, 2s, 3s) to (2s, 5s, 10s) for better Facebook API compliance
  - Implemented thread cooldown mechanism (60 seconds) to prevent rate limiting after repeated failures
  - Added error suppression cache (5-minute TTL) to prevent log spam for known failing threads
  - Smart cooldown system immediately blocks sends to threads on cooldown
  - Enhanced error messages with detailed context (suppressed, onCooldown, notMember flags)

### 🔧 Improved
- **Intelligent Error Logging**: Conditional logging prevents spam while maintaining visibility
  - First error per thread/error combination is logged with full details
  - Subsequent errors within 5 minutes are suppressed from logs
  - Thread cooldown warnings only shown once
- **Better Rate Limit Protection**:
  - Threads that fail after 3 retries are placed on 60-second cooldown
  - Cooldown prevents further API calls, reducing rate limit risk
  - Automatic cooldown cleanup after timeout
- **Membership Verification Optimization**:
  - Membership only verified once per retry cycle (not on every attempt)
  - Immediate failure if bot confirmed not in thread
  - Cached verification result reused across retries

### 📚 Documentation
- Updated error handling to match production debugging patterns
- Error metadata includes all troubleshooting context needed

## [4.2.4] - 2025-11-11

### 🎉 Fixed
- **Error 1545012 Retry Logic**: Implemented intelligent retry mechanism for "Not part of conversation" errors
  - Automatically retries up to 3 times with exponential backoff (1s, 2s, 3s)
  - Verifies bot membership using `getThreadInfo` between retries
  - Fails immediately if bot is confirmed not in group
  - Handles temporary Facebook API glitches caused by stale cache or backend hiccups
  - Prevents message duplication by reusing the same offline threading ID

### 🔧 Improved
- Enhanced error messages for 1545012 with detailed context:
  - `attempts`: Number of retry attempts made
  - `verified`: Whether membership was verified via getThreadInfo
  - Better logging to help diagnose persistent issues
- Graceful fallback when membership verification fails

### 📚 Documentation
- Updated THEME_FEATURES.md with detailed error 1545012 retry logic explanation
- Added examples for handling verified vs unverified failures
- Documented why Facebook returns 1545012 for bots that ARE in groups

## [4.2.3] - 2025-01-11

### 🎉 Fixed
- **AI Theme Generation**: Fixed critical bug where LSD token wasn't being extracted during login
  - Added proper LSD token extraction in `buildAPI.js` from Facebook's `DTSGInitialData` and `LSD` config
  - Updated `createAITheme.js` with all required Facebook parameters (lsd, jazoest, session parameters)
  - Added custom headers (`x-fb-lsd`, `x-fb-friendly-name`) for GraphQL requests
  - AI theme generation now works correctly for accounts with feature access

### 🔧 Improved
- Enhanced `createAITheme` with complete session parameter support:
  - `__user`, `__a`, `__req`, `__hs`, `__rev`, `__s`, `__hsi`
  - `__dyn`, `__csr`, `__comet_req`, `dpr`, `__ccg`
- Better error handling for accounts without AI theme access
- Added comprehensive examples for AI theme usage

### 📚 Documentation
- Updated README with detailed AI theme usage examples
- Added notes about account-level restrictions for AI features
- Included standard theme fallback documentation
- Added examples for theme verification and current theme checking

### 🧹 Cleanup
- Removed debug files and test scripts
- Organized examples folder with production-ready code
- Improved code organization and maintainability

### 🐛 Known Issues
- AI theme generation is restricted by Facebook to specific accounts/regions
- Not a code issue - this is a server-side Facebook restriction
- Standard themes (90+ available) work for all accounts

## [4.2.2] - Previous Release

(Previous changelog entries...)
