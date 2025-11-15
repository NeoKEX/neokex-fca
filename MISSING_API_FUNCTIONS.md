# Missing API Functions - Production Readiness Analysis

## Critical Missing Functions (High Priority)

### Account Management
- **changeAvatar** - Change user profile picture
- **changeBio** - Update user bio/about section  
- **unfriend** - Remove a friend from friend list

### Group/Thread Management
- **createNewGroup** - Create a new group chat
- **createPoll** - Create a poll in a conversation
- **changeGroupImage** - Change group chat image/photo
- **changeThreadColor** - Change conversation color (may overlap with theme)
- **changeArchivedStatus** - Archive/unarchive conversations
- **changeBlockedStatus** - Block/unblock users

### Social Interactions
- **setPostReaction** - React to Facebook posts (different from message reactions)
- **handleFriendRequest** - Accept/decline/cancel friend requests (partially in friend.js)

### Message Management
- **deleteThread** - Permanently delete a conversation thread
- **muteThread** - Mute/unmute conversation notifications

## Medium Priority

### Advanced Messaging
- **forwardMessage** - Forward messages to other threads
- **downloadAttachment** - Download attachments from messages
- **searchMessages** - Search within conversation history

### User Information
- **getPhotoUrl** - Get photo URLs (we have resolvePhotoUrl)
- **getUserID** - Get user ID from profile URL or username

### Thread Management
- **getThreadPictures** - Get all photos from a conversation
- **changeNicknameAll** - Bulk change nicknames

## Implementation Notes

Most competitor libraries have these functions, making them essential for production bots:
- @dongdev/fca-unofficial: ~45 API functions
- ws3-fca: ~40 API functions  
- neokex-fca: ~46 API functions ✅ (good coverage)

## Recommendations

1. **Phase 1** (Critical): Implement group management functions (createNewGroup, changeGroupImage, createPoll)
2. **Phase 2** (Important): Add account management (changeAvatar, changeBio, unfriend)
3. **Phase 3** (Nice-to-have): Advanced features (forwardMessage, searchMessages)
