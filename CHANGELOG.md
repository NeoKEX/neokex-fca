# Changelog

All notable changes to NeoKEX-FCA will be documented in this file.

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
