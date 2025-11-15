# API Reference - NeoKEX FCA

Complete API documentation for NeoKEX-FCA v4.4.3

## Table of Contents

- [Authentication & Session](#authentication--session)
- [Messaging](#messaging)
- [Thread Management](#thread-management)
- [User Management](#user-management)
- [Reactions & Interactions](#reactions--interactions)
- [Themes & Customization](#themes--customization)
- [Stickers](#stickers)
- [Group Management](#group-management)
- [HTTP Utilities](#http-utilities)
- [Advanced Features](#advanced-features)

---

## Authentication & Session

### login(credentials, options, callback)

Authenticates and establishes a connection to Facebook Messenger.

**Parameters:**
- `credentials` (Object): Contains `appState` array with cookies
- `options` (Object): Login configuration options
  - `online` (Boolean): Set online status (default: true)
  - `selfListen` (Boolean): Receive own messages (default: false)
  - `listenEvents` (Boolean): Listen to events (default: true)
  - `updatePresence` (Boolean): Update presence status (default: false)
  - `autoMarkRead` (Boolean): Auto-mark messages as read (default: true)
  - `autoReconnect` (Boolean): Auto-reconnect on disconnect (default: true)
- `callback` (Function): `(err, api) => {}`

**Example:**
```javascript
const { login } = require('neokex-fca');
const appState = require('./appstate.json');

login({ appState }, { online: true }, (err, api) => {
  if (err) return console.error(err);
  console.log('Logged in!');
});
```

### api.logout(callback)

Logs out and closes the session.

**Returns:** Promise<void>

---

## Messaging

### api.sendMessage(message, threadID, replyToMessage, callback)

Sends a message to a thread.

**Parameters:**
- `message` (String|Object): Message text or message object
- `threadID` (String): Target thread/conversation ID
- `replyToMessage` (String): Optional message ID to reply to
- `callback` (Function): `(err, messageInfo) => {}`

**Example:**
```javascript
api.sendMessage('Hello!', threadID, (err, info) => {
  if (err) return console.error(err);
  console.log('Message sent:', info.messageID);
});
```

### api.sendMessageMqtt(message, threadID, replyToMessage, callback)

Sends a message via MQTT for faster delivery.

**Returns:** Promise<Message>

### api.editMessage(text, messageID, callback)

Edits a previously sent message.

**Parameters:**
- `text` (String): New message text
- `messageID` (String): ID of message to edit

**Returns:** Promise<void>

### api.unsendMessage(messageID, threadID, callback)

Unsends/deletes a message.

**Returns:** Promise<UnsendMessageEvent>

### api.forwardMessage(messageID, threadID, callback)

Forwards a message to another thread.

**Returns:** Promise<void>

### api.deleteMessage(messageID, callback)

Deletes a message (alias for unsendMessage).

**Returns:** Promise<void>

### api.markAsRead(threadID, read, callback)

Marks a thread as read or unread.

**Parameters:**
- `threadID` (String): Thread ID
- `read` (Boolean): Mark as read (true) or unread (false)

**Returns:** Promise<any>

### api.markAsReadAll(callback)

Marks all threads as read.

**Returns:** Promise<void>

### api.markAsSeen(timestamp, callback)

Marks messages as seen up to a timestamp.

**Returns:** Promise<void>

### api.markAsDelivered(threadID, messageID, callback)

Marks a message as delivered.

**Returns:** Promise<void>

### api.sendTypingIndicator(isTyping, threadID, callback)

Shows or hides typing indicator.

**Parameters:**
- `isTyping` (Boolean): Show (true) or hide (false) typing
- `threadID` (String): Thread ID

**Returns:** Promise<void>

---

## Thread Management

### api.getThreadInfo(threadID, callback)

Gets information about a thread.

**Parameters:**
- `threadID` (String|Array): Single thread ID or array of IDs

**Returns:** Promise<ThreadInfo|Record<ThreadID, ThreadInfo>>

**Example:**
```javascript
const threadInfo = await api.getThreadInfo(threadID);
console.log('Thread name:', threadInfo.threadName);
console.log('Participants:', threadInfo.participantIDs);
```

### api.getThreadList(limit, timestamp, tags, callback)

Gets a list of conversations.

**Parameters:**
- `limit` (Number): Maximum threads to retrieve
- `timestamp` (Number|null): Pagination timestamp
- `tags` (Array): Filter tags (e.g., ['INBOX', 'ARCHIVED'])

**Returns:** Promise<ThreadInfo[]>

### api.getThreadHistory(threadID, amount, timestamp, callback)

Gets message history from a thread.

**Parameters:**
- `threadID` (String): Thread ID
- `amount` (Number): Number of messages to retrieve
- `timestamp` (Number|null): Pagination timestamp

**Returns:** Promise<Message[]>

### api.getThreadPictures(threadID, callback)

Gets thread profile pictures.

**Returns:** Promise<any>

### api.searchForThread(query, callback)

Searches for threads by name or participants.

**Returns:** Promise<ThreadInfo[]>

### api.changeArchivedStatus(threadID, archived, callback)

Archives or unarchives a thread.

**Parameters:**
- `threadID` (String): Thread ID
- `archived` (Boolean): Archive (true) or unarchive (false)

**Returns:** Promise<void>

### api.muteThread(threadID, muteSeconds, callback)

Mutes a thread for specified duration.

**Parameters:**
- `threadID` (String): Thread ID
- `muteSeconds` (Number): Duration in seconds (-1 for unmute)

**Returns:** Promise<void>

### api.deleteThread(threadID, callback)

Deletes a conversation thread.

**Returns:** Promise<void>

### api.pinMessage(action, threadID, messageID, callback)

Pins or unpins a message, or lists pinned messages.

**Parameters:**
- `action` (String): 'pin', 'unpin', or 'list'
- `threadID` (String): Thread ID
- `messageID` (String): Message ID (not needed for 'list')

**Returns:** Promise<any|Message[]>

---

## User Management

### api.getUserInfo(userID, usePayload, callback)

Gets information about users.

**Parameters:**
- `userID` (String|Array): Single user ID or array of IDs
- `usePayload` (Boolean): Use alternative API endpoint

**Returns:** Promise<UserInfo|Record<UserID, UserInfo>>

**Example:**
```javascript
const userInfo = await api.getUserInfo('100012345678901');
console.log('Name:', userInfo.name);
console.log('Profile URL:', userInfo.profileUrl);
```

### api.getUserInfoV2(userID, callback)

Gets user information using V2 API endpoint.

**Returns:** Promise<UserInfo>

### api.getUserID(name, callback)

Gets user ID from username or profile URL.

**Returns:** Promise<UserID>

### api.getFriendsList(callback)

Gets list of friends.

**Returns:** Promise<UserInfo[]>

### api.changeAvatar(avatar, callback)

Changes profile avatar.

**Parameters:**
- `avatar` (ReadStream): Image file stream

**Returns:** Promise<void>

### api.changeBio(bio, callback)

Changes profile bio/description.

**Returns:** Promise<void>

### api.changeBlockedStatus(userID, block, callback)

Blocks or unblocks a user.

**Parameters:**
- `userID` (String): User ID to block/unblock
- `block` (Boolean): Block (true) or unblock (false)

**Returns:** Promise<void>

### api.follow(userID, follow, callback)

Follows or unfollows a user/page.

**Parameters:**
- `userID` (String): User ID
- `follow` (Boolean): Follow (true) or unfollow (false)

**Returns:** void

### api.unfriend(userID, callback)

Removes a friend.

**Returns:** Promise<void>

### api.friend(action, userID, callback)

Manages friend requests.

**Parameters:**
- `action` (String): 'add', 'accept', 'decline', 'cancel'
- `userID` (String): User ID

**Returns:** Promise<void>

---

## Reactions & Interactions

### api.setMessageReaction(reaction, messageID, callback)

Reacts to a message (HTTP endpoint).

**Parameters:**
- `reaction` (String): Emoji reaction
- `messageID` (String): Message ID

**Returns:** Promise<void>

### api.setMessageReactionMqtt(reaction, messageID, callback)

Reacts to a message via MQTT.

**Returns:** Promise<void>

### api.shareContact(text, senderID, threadID, callback)

Shares a contact in a conversation.

**Returns:** Promise<void>

### api.resolvePhotoUrl(photoID, callback)

Resolves a photo ID to its full URL.

**Returns:** Promise<string>

---

## Themes & Customization

### api.getTheme(threadID, callback)

Gets available themes for a thread.

**Returns:** Promise<ThemeInfo[]>

**Example:**
```javascript
const themes = await api.getTheme(threadID);
console.log(`Found ${themes.length} themes`);
themes.forEach(theme => {
  console.log(`- ${theme.name} (ID: ${theme.id})`);
});
```

### api.getThemeInfo(threadID, callback)

Gets current theme information for a thread.

**Returns:** Promise<ThemeInfo>

### api.createAITheme(prompt, callback)

Generates AI-powered custom themes.

**Parameters:**
- `prompt` (String): Text description of desired theme

**Returns:** Promise<ThemeInfo[]>

**Example:**
```javascript
const aiThemes = await api.createAITheme('vibrant sunset ocean beach');
if (aiThemes && aiThemes.length > 0) {
  await api.setThreadThemeMqtt(threadID, aiThemes[0].id);
  console.log('AI theme applied!');
}
```

### api.setThreadThemeMqtt(threadID, themeID, callback)

Applies a theme to a thread via MQTT.

**Parameters:**
- `threadID` (String): Thread ID
- `themeID` (String): Theme ID

**Returns:** Promise<void>

### api.theme(themeName, threadID, callback)

Sets thread theme by name.

**Returns:** Promise<GroupNameEvent>

### api.emoji(emoji, threadID, callback)

Changes thread emoji.

**Parameters:**
- `emoji` (String): Emoji character
- `threadID` (String): Thread ID

**Returns:** Promise<EmojiEvent>

### api.changeThreadColor(color, threadID, callback)

Changes thread color/theme.

**Returns:** Promise<void>

---

## Stickers

### api.stickers.search(query)

Searches for stickers by keyword.

**Returns:** Promise<StickerInfo[]>

### api.stickers.listPacks()

Lists available sticker packs.

**Returns:** Promise<StickerPackInfo[]>

### api.stickers.getStorePacks()

Gets sticker packs from the store.

**Returns:** Promise<StickerPackInfo[]>

### api.stickers.listAllPacks()

Lists all sticker packs (owned and store).

**Returns:** Promise<StickerPackInfo[]>

### api.stickers.addPack(packID)

Adds a sticker pack to collection.

**Returns:** Promise<AddedStickerPackInfo>

### api.stickers.getStickersInPack(packID)

Gets all stickers in a pack.

**Returns:** Promise<StickerInfo[]>

### api.stickers.getAiStickers(options)

Gets AI-generated stickers.

**Parameters:**
- `options` (Object): `{ limit: 10 }`

**Returns:** Promise<StickerInfo[]>

---

## Group Management

### api.createNewGroup(participantIDs, groupTitle, callback)

Creates a new group conversation.

**Returns:** Promise<ThreadID>

### api.addUserToGroup(userID, threadID, callback)

Adds a user to a group.

**Returns:** Promise<void>

### api.removeUserFromGroup(userID, threadID, callback)

Removes a user from a group.

**Returns:** Promise<void>

### api.gcname(newName, threadID, callback)

Changes group name.

**Returns:** Promise<GroupNameEvent>

### api.gcmember(action, threadID, userID, callback)

Manages group members (add/remove).

**Parameters:**
- `action` (String): 'add' or 'remove'
- `threadID` (String): Group thread ID
- `userID` (String): User ID

**Returns:** Promise<void>

### api.gcrule(action, threadID, userID, callback)

Manages group admin status.

**Parameters:**
- `action` (String): 'admin' or 'unadmin'
- `threadID` (String): Group thread ID
- `userID` (String): User ID

**Returns:** Promise<void>

### api.nickname(nickname, threadID, participantID, callback)

Sets a nickname for a participant in a thread.

**Returns:** Promise<NicknameEvent>

### api.changeGroupImage(image, threadID, callback)

Changes group profile image.

**Parameters:**
- `image` (ReadStream): Image file stream
- `threadID` (String): Group thread ID

**Returns:** Promise<void>

### api.createPoll(pollOptions, threadID, callback)

Creates a poll in a group.

**Returns:** Promise<void>

---

## HTTP Utilities

### api.httpGet(url, form, customHeader, callback, notAPI)

Makes an HTTP GET request.

**Parameters:**
- `url` (String): Target URL
- `form` (Object): Query parameters
- `customHeader` (Object): Custom headers
- `notAPI` (Boolean): Use raw request without Facebook defaults

**Returns:** Promise<string>

### api.httpPost(url, form, customHeader, callback, notAPI)

Makes an HTTP POST request.

**Parameters:**
- `url` (String): Target URL
- `form` (Object): POST data
- `customHeader` (Object): Custom headers
- `notAPI` (Boolean): Use raw request without Facebook defaults

**Returns:** Promise<string>

### api.httpPostFormData(url, form, customHeader, callback, notAPI)

Makes an HTTP POST request with multipart/form-data.

**Returns:** Promise<string>

---

## Advanced Features

### api.listenMqtt(callback)

Listens for messages and events via MQTT.

**Parameters:**
- `callback` (Function): `(err, event) => {}`

**Returns:** void

**Example:**
```javascript
api.listenMqtt((err, event) => {
  if (err) return console.error(err);
  
  if (event.type === 'message') {
    console.log(`${event.senderID}: ${event.body}`);
  }
});
```

### api.listenSpeed(callback)

Alternative listening method with speed optimization.

**Returns:** void

### api.realtime(action, callback)

Manages realtime connection.

**Returns:** Promise<void>

### api.mqttDeltaValue(callback)

Handles MQTT delta values for message updates.

**Returns:** void

### api.handleMessageRequest(action, threadID, callback)

Handles message requests (accept/decline).

**Parameters:**
- `action` (String): 'accept' or 'decline'
- `threadID` (String): Thread ID

**Returns:** Promise<void>

### api.comment(message, postID, replyCommentID, callback)

Comments on a Facebook post.

**Parameters:**
- `message` (String|Object): Comment text or object
- `postID` (String): Post ID
- `replyCommentID` (String): Optional comment ID to reply to

**Returns:** Promise<CommentResult>

### api.share(text, postID, callback)

Shares a post.

**Returns:** Promise<ShareResult>

### api.story(options, callback)

Posts a story.

**Returns:** Promise<void>

### api.notes(action, content, callback)

Manages notes/status.

**Returns:** Promise<void>

### api.getBotInfo(callback)

Gets bot information.

**Returns:** Promise<any>

### api.getBotInitialData(callback)

Gets bot initial data/configuration.

**Returns:** Promise<any>

### api.getAccess(authCode, callback)

Gets access token from authorization code.

**Returns:** Promise<string>

### api.addExternalModule(moduleObj)

Adds external custom modules to the API.

**Parameters:**
- `moduleObj` (Object): Object with custom methods

**Example:**
```javascript
api.addExternalModule({
  customMethod: function(arg1, arg2) {
    // Custom functionality
  }
});

api.customMethod('test', 123);
```

### api.setOptions(options)

Updates API options after login.

**Parameters:**
- `options` (Object): New options to merge

---

## Event Types

### Message Event

```javascript
{
  type: 'message',
  senderID: '100012345678901',
  body: 'Hello!',
  threadID: '100012345678901',
  messageID: '123456789',
  attachments: [],
  mentions: {},
  timestamp: '1234567890',
  isGroup: false
}
```

### Typing Event

```javascript
{
  type: 'typ',
  isTyping: true,
  from: '100012345678901',
  threadID: '100012345678901',
  fromMobile: false
}
```

### Thread Event

```javascript
{
  type: 'event',
  threadID: '100012345678901',
  logMessageType: 'log:thread-name',
  logMessageData: { name: 'New Group Name' },
  author: '100012345678901'
}
```

---

## Error Handling

All API methods support both callback and Promise-based error handling:

### Callback Style
```javascript
api.sendMessage('Hello', threadID, (err, info) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Success:', info);
});
```

### Promise Style
```javascript
try {
  const info = await api.sendMessage('Hello', threadID);
  console.log('Success:', info);
} catch (err) {
  console.error('Error:', err);
}
```

---

## Rate Limiting

The library includes built-in rate limiting and retry logic:

- Automatic retry on transient errors (up to 3 attempts)
- Exponential backoff between retries
- Thread-level and endpoint-level cooldowns
- Automatic handling of Facebook rate limit errors

---

## Best Practices

1. **Use MQTT methods when available** (faster delivery, less overhead)
2. **Always handle errors** in callbacks or try-catch blocks
3. **Avoid excessive requests** to prevent rate limiting
4. **Use Promise-based code** with async/await for cleaner syntax
5. **Keep appState secure** - never commit or share publicly

---

For more information and examples, see:
- [README.md](README.md)
- [THEME_FEATURES.md](THEME_FEATURES.md)
- [examples/](examples/)

**Version:** 4.4.3  
**License:** MIT  
**Repository:** https://github.com/NeoKEX/neokex-fca
