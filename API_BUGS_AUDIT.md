# API Functions Audit - Bug Report

## Critical Bugs (Must Fix)

### 1. setMessageReaction.js - Incorrect Parameter
**Location**: Line 22
**Issue**: Passing `ctx.jar` instead of `ctx` to parseAndCheckLogin
```javascript
// WRONG:
const resData = await utils.parseAndCheckLogin(ctx.jar, defaultFuncs)(defData);

// CORRECT:
const resData = await utils.parseAndCheckLogin(ctx, defaultFuncs)(defData);
```
**Impact**: May cause authentication check failures
**Fix Priority**: HIGH

### 2. sendMessage.js - Rate Limit Error Not Handled
**Location**: Lines 116-119
**Issue**: Error 1545012 (rate limit) is logged but not handled with cooldown
```javascript
if (resData.error === 1545012) {
    utils.warn("sendMessage", "Got error 1545012. This might mean that you're not part of the conversation " + threadID);
}
throw new Error(JSON.stringify(resData));
```
**Impact**: No automatic rate limit backoff, can lead to repeated failures
**Fix Priority**: HIGH (addressed by rate limiter integration)

### 3. getThreadInfo.js - Array Index Fallback Issue
**Location**: Line 200
**Issue**: Fallback threadID retrieval uses complex index calculation that may fail
```javascript
threadInfos[threadInfo.threadID || threadID[threadID.length - 1 - i]] = threadInfo;
```
**Impact**: May cause undefined errors when threadInfo.threadID is missing
**Fix Priority**: MEDIUM

## Medium Priority Bugs

### 4. sendMessage.js - Mentions indexOf Edge Case
**Location**: Lines 260-261
**Issue**: Uses indexOf with fromIndex but may fail for duplicate tags
```javascript
const offset = msg.body.indexOf(tag, mention.fromIndex || 0);
if (offset < 0) utils.warn("handleMention", 'Mention for "' + tag + '" not found in message string.');
```
**Impact**: Mentions may not work correctly for duplicate text
**Fix Priority**: MEDIUM

### 5. Missing Input Validation
**Functions**: Multiple
**Issue**: Many functions don't validate inputs thoroughly before making API calls
**Examples**:
- emoji.js - No validation that threadID exists
- gcname.js - No validation for name length limits
- sendMessage.js - Attachments type not validated before upload

**Impact**: May cause unexpected errors or API rejections
**Fix Priority**: MEDIUM

### 6. No Timeout Handling
**Functions**: All API functions
**Issue**: No function-level timeouts, relying solely on axios default
**Impact**: Long-running operations may hang indefinitely
**Fix Priority**: LOW (axios has 60s timeout)

## Low Priority Issues

### 7. Inconsistent Error Messages
**Functions**: Multiple
**Issue**: Error messages vary in format and detail across functions
**Impact**: Harder to debug for users
**Fix Priority**: LOW

### 8. Missing JSDoc Comments
**Functions**: Some newer functions
**Issue**: Not all functions have complete JSDoc documentation
**Impact**: Reduces code maintainability
**Fix Priority**: LOW

## Recommendations

### Immediate Fixes
1. Fix setMessageReaction.js parseAndCheckLogin parameter (1 line change)
2. Add rate limit cooldown to sendMessage error handling
3. Improve threadID fallback in getThreadInfo

### Short-term Improvements
1. Add input validation wrapper for all API functions
2. Standardize error message format
3. Add timeout wrappers for long-running operations

### Long-term Enhancements
1. Create comprehensive test suite for all API functions
2. Add TypeScript definitions for better type safety
3. Implement request deduplication for identical concurrent requests

## Testing Priority
1. **High**: sendMessage, setMessageReaction, getThreadInfo
2. **Medium**: editMessage, sendTypingIndicator, markAsRead
3. **Low**: Stickers, themes, utilities
