# NeoKEX-FCA Development Project

## Project Overview
Enhanced Facebook Chat API (FCA) library designed to surpass ws3-fca and @dongdev/fca-unofficial in power, reliability, and anti-bot detection capabilities. Built for stable, undetected Facebook Messenger automation.

## Current Status (v4.4.3 - November 15, 2025)

### ✅ Recent Achievements

**API Function Improvements (November 15, 2025):**
- **getFriendsList** - Fixed by switching to POST /chat/user_info_all endpoint (now passing tests!)
- **getUserID** - Enhanced error handling with better checkpoint messaging
- **searchForThread** - Improved error handling with clearer checkpoint messages
- Comprehensive 68-function test suite: 58 passed, 7 failed (mostly due to Facebook checkpoints), 18 skipped

**Anti-Bot Detection Improvements:**
- Enhanced user-agent fingerprinting with Edge browser, Linux platforms, 15+ unique combinations
- Multi-domain cookie persistence (.facebook.com, .messenger.com, .m.facebook.com)
- Fixed critical header bug (X-Fb-Lsd fallback to fb_dtsg)
- Locale and timezone spoofing with proper seconds-based offset calculation

**Session & Token Management:**
- Integrated TokenRefreshManager with 24-hour auto-refresh cycle
- Exposed API methods: `api.refreshTokens()` and `api.getTokenRefreshStatus()`
- Account lock detection for error codes 1357001, 1357004, 1357031, 1357033, 2056003

**Attachment Handling:**
- Smart attachment type detection (image/video/audio/document)
- Parallel uploads with 3-concurrent batching
- Reduced upload time for multi-attachment messages

**Infrastructure:**
- RateLimiter class created (not yet integrated into request pipeline)
- All validation tests passing

### 📊 Competitive Position

**Better Than Competitors:**
- ✅ Fingerprint stability (more diverse UA pool, cached per-session)
- ✅ Multi-domain cookie persistence
- ✅ Attachment handling (parallel uploads, smart type detection)
- ✅ Account lock detection

**Still Behind:**
- ❌ Integrated rate limiting in HTTP pipeline
- ❌ Automatic re-login on session expiry
- ❌ MQTT exponential backoff

### 🚨 Production Readiness
**Status:** Solid for low-volume automation, NOT production-ready for high-volume bots

**Critical Missing Features:**
1. Automatic re-login when session expires
2. Integrated rate limiting in HTTP request pipeline
3. Token refresh retry/backoff logic
4. Session expiry detection mechanism

## Architecture

### Key Files
- `src/utils/headers.js` - HTTP header generation with anti-detection
- `src/utils/user-agents.js` - Browser fingerprint generation
- `src/engine/models/loginHelper.js` - Authentication and session management
- `src/utils/tokenRefresh.js` - Token refresh manager (integrated)
- `src/utils/rateLimiter.js` - Rate limiting infrastructure (created, not integrated)
- `src/apis/sendMessage.js` - Message sending with parallel attachment uploads
- `src/utils/clients.js` - Attachment type detection

### Recent Changes (v4.4.3)
- **API Fixes (Nov 15):**
  - getFriendsList: Changed to postFormData with /chat/user_info_all endpoint
  - getUserID: Added input validation and checkpoint-friendly error messages
  - searchForThread: Improved error handling for checkpoint scenarios
- Fixed header bug: ctx.lsd || ctx.fb_dtsg fallback
- Fixed Edge UA duplication bug
- Fixed cookie multi-domain attribute parsing
- Fixed timezone offset format (minutes * 60 = seconds)
- Integrated TokenRefreshManager into loginHelper
- Enhanced attachment type detection and parallel uploads

## Next Priority (Architect Recommendations)

1. **Auto Re-Login** - Implement automatic re-login tied to token refresh failures
2. **Rate Limiter Integration** - Wire RateLimiter into axios.js request pipeline with proper telemetry
3. **Session Expiry Detection** - Build detector to trigger safe re-login workflows
4. **Token Refresh Hardening** - Add retry/backoff logic to TokenRefreshManager

## User Preferences
- Focus on production-ready, enterprise-grade automation features
- Prioritize anti-bot detection and session stability
- Prefer comprehensive architect reviews before marking tasks complete
- Maintain compatibility with ws3-fca and @dongdev/fca-unofficial APIs

## Development Notes

### Validation
- Run `npm test` or `npm run validate` to validate library structure
- All 48 API modules validated
- TypeScript definitions present and correct

### Testing
- Validation workflow configured and passing
- Test suite validates main exports, API modules, utilities, and TypeScript definitions

### Dependencies
- Node.js >= 22.x required
- Key dependencies: axios, tough-cookie, cheerio, mqtt, node-cron
- Comparison libraries installed: ws3-fca, @dongdev/fca-unofficial

## Known Issues & Limitations

1. **Facebook Checkpoint Restrictions** - getUserID and searchForThread fail when account requires checkpoint verification (external limitation, cannot be programmatically fixed)
2. Rate limiter created but not integrated (deferred for proper testing)
3. Token refresh needs retry/backoff for production resilience
4. No automatic re-login on session expiry yet
5. MQTT reconnection uses fixed jitter instead of exponential backoff
6. No keepalive ping mechanism to prevent session timeout
7. Machine ID persistence not implemented

## Git Workflow
- Automatic commits made at end of task completion
- Comprehensive CHANGELOG.md maintained with all improvements documented
