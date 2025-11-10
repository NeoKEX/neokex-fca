# Changelog

All notable changes to NeoKEX-FCA will be documented in this file.

## [3.1.0] - 2025-11-10

### 🎯 Major Refactoring - Improved Stability & Reliability

This release fixes **14 out of 14 broken GraphQL doc_ids** by migrating to stable Ajax endpoints instead of fragile GraphQL queries. This dramatically improves long-term stability as Ajax endpoints change less frequently than GraphQL doc_ids.

### ✅ Fixed Functions (9 migrated to Ajax endpoints)

**Social Functions:**
- **friend.list**: Migrated to `/chat/user_info_all` - Now correctly returns all friends instead of empty array
  - Fixed critical bug where users with 50+ friends would get 0 results
  - More stable endpoint that doesn't rely on GraphQL doc_id
  - Returns richer data: firstName, alternateName, birthday info

**Conversation Management:**
- **archiveThread**: Migrated to `/ajax/mercury/change_archived_status.php`
- **muteThread**: Migrated to `/ajax/mercury/change_mute_thread.php`
- **deleteThread**: Migrated to `/ajax/mercury/delete_thread.php`
- **getThreadPictures**: Migrated to `/ajax/messaging/attachments/sharedphotos.php`

**Messaging Functions:**
- **changeAdminStatus**: Migrated to `/messaging/save_admins/?dpr=1`
- **handleMessageRequest**: Migrated to `/ajax/mercury/move_thread.php`

**Account Functions:**
- **changeBlockedStatus**: Migrated to `/messaging/block_messages/` and `/messaging/unblock_messages/`
- **unfriend**: Migrated to `/ajax/profile/removefriendconfirm.php`

### ✅ Updated GraphQL doc_ids (2 functions)

- **changeBio**: Updated doc_id `4969988563035816` → `2725043627607610` (ProfileCometSetBioMutation)
- **setPostReaction**: Updated doc_id `5494309793948992` → `4769042373179384` (CometUFIFeedbackReactMutation)

### ⚠️ Deprecated Functions

- **searchMessages**: Currently unavailable - Facebook removed the API endpoint, no alternative found

### 📈 Improvements

- **Stability**: Ajax endpoints are more stable than GraphQL doc_ids
- **Reliability**: Functions less likely to break when Facebook updates
- **Data Quality**: friend.list now returns complete user information
- **Error Handling**: Better error messages for unavailable functions
- **Maintenance**: Easier to maintain without tracking fragile doc_ids

### 🔧 Technical Details

All refactored functions:
1. Switched from GraphQL mutations to direct Ajax POST requests
2. Use stable Facebook endpoints that have existed for years
3. Maintain backward-compatible API signatures
4. Include proper error handling and validation

### 📚 Documentation

- Added WS3-FCA endpoint documentation
- Updated function documentation with new endpoints
- Removed test files before npm publishing

### 🙏 Credits

This refactoring was inspired by the [ws3-fca](https://www.npmjs.com/package/ws3-fca) library's stable Ajax endpoint approach.

## [3.0.2] - 2025-11-10

### 🐛 Critical Bug Fixes
- **loginHelper**: Enhanced cookie parsing to support full cookie format from browser extensions (EditThisCookie, Cookie-Editor)
  - Now properly handles cookies with `domain`, `secure`, `httpOnly`, `sameSite`, `expirationDate` properties
  - Converts Unix timestamp expiration dates correctly
  - Preserves all cookie attributes for better session management
- **sendMessage**: Improved error 1545012 handling with detailed, actionable error messages
  - Error now includes `errorCode` and `threadID` properties for programmatic handling
  - Provides clear explanation of why the error occurred and how to fix it
- **clients.js**: Fixed TypeError when `content-type` header is undefined during retry logic
  - Added proper null checking for headers to prevent crashes during request retries

### ✨ Enhancements
- **Cookie Support**: Full compatibility with browser extension cookie exports
- **Error Messages**: More informative error messages that help developers debug issues faster
- **Stability**: Improved error handling prevents crashes from undefined headers

### 📚 Documentation
- Added comprehensive test suite demonstrating cookie usage and error handling

## [3.0.1] - 2025-11-10

### 🐛 Critical Bug Fixes
- **sendMessage**: Fixed ReferenceError when attachment upload fails (resData undefined in error handling)
- **sendMessage**: Fixed missing return value in getUrl function for URL attachments
- **client**: Eliminated singleton state to prevent cross-user session leakage in concurrent logins

### ✨ New Features
- **getUnreadCount**: Get unread message counts for specific threads or all threads
- **scheduleMessage**: Schedule messages to be sent at specific times (in-memory with persistence warning)
- **getAttachmentMetadata**: Get metadata about attachments without downloading them

### 📦 NPM Publishing Preparation
- Added `.npmignore` to exclude test files, demos, and sensitive data
- Added `files` field to package.json for explicit package content control
- Removed test files and sensitive data (cookies.json) from repository
- Enhanced TypeScript definitions for new API functions

### 📚 Documentation
- Updated README with examples for all new API functions
- Added warning about scheduleMessage in-memory limitations
- Enhanced feature list with new capabilities

## [3.0.0] - 2025-11-10

### 🎉 Initial Release

#### Core Features
- **Multi-Format Cookie Support**: Support for arrays, strings (semicolon/comma/newline-separated), objects, and JSON strings
- **Advanced Messaging API**: Send, edit, delete messages with full attachment support
- **Real-time Event Listening**: MQTT-based real-time message listening
- **Thread Management**: Full control over group chats and conversations
- **User Operations**: Get user info, manage friends, check blocked users
- **Social Features**: Like, comment, share, and post stories

#### Advanced Features (Beyond Standard FCA)
- **forwardMessage**: Forward messages to multiple threads at once
- **searchMessages**: Search through message history with filters
- **bulkSendMessage**: Send messages to multiple threads with delay
- **createPoll**: Create polls in group conversations
- **votePoll**: Vote on existing polls
- **archiveThread**: Archive/unarchive conversations
- **muteThread**: Mute/unmute threads with customizable duration
- **downloadAttachment**: Download media files from messages
- **getBlockedUsers**: Retrieve list of blocked users

#### Technical Improvements
- Enhanced cookie parsing with support for 6+ formats
- Improved error handling with retry logic
- Better TypeScript support with comprehensive type definitions
- NeoKEX branding throughout the library
- Renamed internal structure (deltas → engine, utils → helpers)
- Added Linux user agent support
- Enhanced logging with colorful console output

#### Developer Experience
- Comprehensive TypeScript type definitions
- Detailed API documentation
- Code examples and tutorials
- Example bot implementation
- Clear error messages

### Credits
Created and maintained by **[NeoKEX](https://github.com/NeoKEX)**

---

## Version Format
This project follows [Semantic Versioning](https://semver.org/):
- **Major**: Breaking changes
- **Minor**: New features (backwards-compatible)
- **Patch**: Bug fixes (backwards-compatible)
