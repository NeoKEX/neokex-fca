# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.1] - 2025-11-09

### Fixed
- **Critical Bug**: Eliminated infinite loop crash in MQTT error handler
  - Root cause: Error handler triggered `stopListening()` → `unsubscribe()` → new error → infinite recursion
  - Result: "RangeError: Maximum call stack size exceeded" crash
  - Solution: Added re-entry guard flag and proper listener cleanup
- **Error Handler**: Fixed listener removal to preserve external error listeners
  - Changed from `removeAllListeners('error')` to `removeListener('error', errorHandler)`
  - Maintains API compatibility by not removing user-registered error handlers
- **Cleanup Operations**: Wrapped all unsubscribe/publish calls in try-catch blocks
  - Prevents cascading failures during error recovery
  - Ensures graceful degradation when MQTT client is in error state

### Changed
- Improved auto-reconnect stability with guard flags to prevent re-entrant error handling
- Enhanced error recovery process for malformed MQTT messages
- Better production reliability for long-running bots with auto-reconnect enabled

### Technical Details
This critical fix resolves a production-impacting infinite loop that occurred when:
1. MQTT connection error triggered the error handler at line 112
2. Error handler called `stopListening()` at line 114
3. `stopListening()` called `unsubscribe()` at line 99
4. `unsubscribe()` on errored client triggered another error event
5. Process repeated infinitely causing stack overflow

The fix ensures enterprise-grade stability for production deployments.

## [2.5.0] - 2025-11-08

### Added
- MQTT binary data handling improvements
- Smart logging with sanitized previews for binary data
- BOM (Byte Order Mark) support for JSON message parsing

### Fixed
- JSON parsing errors when receiving binary/non-JSON MQTT payloads
- Buffer-to-string conversion now properly uses UTF-8 encoding

### Changed
- Enhanced error handling to gracefully skip non-JSON binary messages
- Improved message validation before JSON parsing

## [2.4.0] - 2025-11-09

### Fixed
- **Critical Bug**: Fixed `jar.getCookies(...).concat is not a function` error
  - Replaced async `getCookies()` with synchronous `getCookiesSync()` in 3 files
  - Affected files: `src/utils.js`, `src/core.js`, `src/listenMqtt.js`
  - Root cause: tough-cookie v4+ returns Promise from `getCookies()`, not an array

### Changed
- **Updated all dependencies to latest compatible versions**:
  - axios: ^1.9.0 → ^1.13.2
  - axios-cookiejar-support: ^4.0.7 → ^6.0.4
  - chalk: ^3.0.0 → ^4.1.2 (kept at v4 for CommonJS compatibility)
  - cheerio: ^0.22.0 → ^1.1.2
  - form-data: ^4.0.3 → ^4.0.4
  - https-proxy-agent: ^4.0.0 → ^7.0.6
  - mqtt: ^3.0.0 → ^5.14.1
  - node-cron: ^3.0.3 → ^4.2.1
  - tough-cookie: ^4.1.4 → ^5.1.2
  - websocket-stream: ^5.5.0 → ^5.5.2

### Security
- **All security vulnerabilities resolved** (0 vulnerabilities)
- Added package override for `ws` to fix DoS vulnerability
- Updated all dependencies to latest secure versions

### Documentation
- Added comprehensive npm publishing guide to README.md
- Added development setup and contributing guidelines
- Created `.npmignore` for clean npm packages
- Created `.gitignore` for development files
- Enhanced code documentation

### Infrastructure
- Package now ready for npm publishing
- Proper file exclusions configured
- TypeScript definitions verified and complete

## [2.2.0] - 2025-11-09

### Added
- **AI Theme Generation**: New `generateAitheme()` function for creating and applying AI-powered themes
- **createAITheme()**: Create custom AI themes using Facebook's GraphQL API
- **setThreadThemeMqtt()**: Apply themes to threads using MQTT for instant updates
- **bypassAutomatedBehavior()**: Bypass Facebook's automated behavior detection system
- **clearAdvertisingID()**: Clear advertising ID to avoid advertising-related issues
- Support for external image generation APIs in AI theme creation
- Comprehensive documentation for new AI theme features
- Pre-publish test script to ensure library integrity before publishing

### Changed
- **BREAKING**: Replaced deprecated `request` library with modern `axios`
- Updated `tough-cookie` from v5.1.2 to v4.1.4 to resolve peer dependency conflicts
- Migrated all HTTP requests to use axios with retry logic and exponential backoff
- Enhanced error handling across all API functions
- Improved AntiDetectionManager import paths
- Added gradient-string fallback for better compatibility

### Fixed
- Security vulnerabilities from deprecated `request` library (11 vulnerabilities resolved)
- Tough-cookie peer dependency conflicts
- Import path issues in AntiDetectionManager
- Gradient-string compatibility issues

### Security
- Removed 39 vulnerable packages by eliminating `request` dependency
- Remaining 9 vulnerabilities are in third-party dependencies (axios, form-data, cheerio, websocket-stream)
  - These are dependencies of dependencies and can be updated with `npm audit fix`
  - Note: Some fixes require breaking changes to older versions
- Improved session handling and authentication security
- Added automated behavior bypass for better bot protection

### Documentation
- Added AI_THEME_FEATURES.md with comprehensive guide for new features
- Updated README.md with v2.2.0 features
- Added .npmignore for cleaner npm packages
- Improved examples and usage documentation

## [2.1.0] - Previous Release

### Added
- Enhanced theme management with getTheme() and setTheme()
- Poll voting functionality
- Active status checking
- Message search capabilities
- Message info retrieval
- Event creation
- Emoji suggestions

### Features
- Universal cookie support (all formats)
- Anti-detection system
- Anti-logout protection
- Request randomization
- Auto keep-alive
- Session Guardian

## [2.0.0] - Previous Release

### Added
- Performance Optimizer with built-in caching
- Connection Manager with health monitoring
- Smart caching system
- Request debouncing
- Performance metrics tracking
- Exponential backoff for reconnections

[2.5.1]: https://github.com/NeoKEX/neokex-fca/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/NeoKEX/neokex-fca/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/NeoKEX/neokex-fca/compare/v2.2.0...v2.4.0
[2.2.0]: https://github.com/NeoKEX/neokex-fca/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/NeoKEX/neokex-fca/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/NeoKEX/neokex-fca/releases/tag/v2.0.0
