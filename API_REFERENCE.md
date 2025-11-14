# API Reference

Complete reference for all available methods in NeoKEX-FCA v4.2.5.

---

## Table of Contents

1. [Authentication & Session](#authentication--session)
2. [Listening & Real-time Events](#listening--real-time-events)
3. [Messaging](#messaging)
4. [Thread Management](#thread-management)
5. [User & Account](#user--account)
6. [Reactions & Interactions](#reactions--interactions)
7. [Themes](#themes)
8. [Stickers](#stickers)
9. [Group Management](#group-management)
10. [Social Interactions](#social-interactions)
11. [Advanced Utilities](#advanced-utilities)

---

## Authentication & Session

### `login(credentials, options, callback)`
Initiates the login process for a Facebook account.

**Parameters:**
- `credentials` (Object): Login credentials containing `appState` (array of cookies)
- `options` (Object, optional): Login configurations
  - `selfListen` (Boolean): Listen to own messages (default: `false`)
  - `listenEvents` (Boolean): Listen to events (default: `true`)
  - `listenTyping` (Boolean): Listen to typing indicators (default: `false`)
  - `updatePresence` (Boolean): Update online presence (default: `false`)
  - `online` (Boolean): Set online status (default: `true`)
  - `forceLogin` (Boolean): Force login even if already logged in (default: `false`)
  - `autoMarkDelivery` (Boolean): Auto-mark messages as delivered (default: `false`)
  - `autoMarkRead` (Boolean): Auto-mark messages as read (default: `true`)
  - `autoReconnect` (Boolean): Auto-reconnect on disconnect (default: `true`)
  - `proxy` (String): Proxy server URL
  - `userAgent` (String): Custom user agent
  - `randomUserAgent` (Boolean): Use random user agent
- `callback` (Function): `(err, api) => void`

**Example:**
```javascript
const { login } = require('neokex-fca');
const fs = require('fs');

const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

login({ appState }, { online: true }, (err, api) => {
  if (err) return console.error(err);
  console.log('Logged in successfully!');
});
```

---

###  `logout(callback)`
Logs out and clears the current session.

**Parameters:**
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<void>`

**Example:**
```javascript
await api.logout();
```

---

### `getCurrentUserID()`
Gets the current logged-in user's ID.

**Returns:** `string` - The user ID

**Example:**
```javascript
const myUserID = api.getCurrentUserID();
console.log(`Logged in as: ${myUserID}`);
```

---

### `getAppState()`
Gets the current app state (cookies) for session persistence.

**Returns:** `Array` - Array of cookie objects

**Example:**
```javascript
const appState = api.getAppState();
fs.writeFileSync('appstate.json', JSON.stringify(appState));
```

---

## Listening & Real-time Events

### `listenMqtt(callback)`
Establishes an MQTT connection to receive messages and events in real-time.

**Parameters:**
- `callback` (Function): `(err, event) => void`
  - `event.type` (String): Event type (`"message"`, `"event"`, `"typ"`, etc.)
  - `event.threadID` (String): Thread ID where event occurred
  - `event.body` (String): Message text content
  - `event.senderID` (String): Sender's user ID
  - `event.messageID` (String): Message ID
  - `event.attachments` (Array): Array of attachments
  - `event.mentions` (Object): Mentioned users
  - `event.isGroup` (Boolean): Is group chat

**Returns:** `EventEmitter` - Emits 'message', 'error', and 'stop' events

**Example:**
```javascript
api.listenMqtt((err, event) => {
  if (err) return console.error(err);
  
  if (event.type === 'message') {
    console.log(`Message from ${event.senderID}: ${event.body}`);
  }
});
```

---

### `listenSpeed()`
Connects to Facebook's Lightspeed WebSocket for real-time updates.

**Returns:** `EventEmitter` - Emits 'success', 'notification', 'payload', and 'error' events

**Example:**
```javascript
const listener = api.listenSpeed();

listener.on('success', () => {
  console.log('Connected to Lightspeed');
});

listener.on('notification', (data) => {
  console.log('Notification:', data);
});
```

---

### `realtime()`
Listens for real-time events through WebSocket (notifications and presence).

**Returns:** `EventEmitter` - Emits 'success', 'notification', 'payload', and 'error' events

**Example:**
```javascript
const listener = api.realtime();

listener.on('notification', (data) => {
  console.log('Real-time notification:', data);
});
```

---

## Messaging

### `sendMessage(message, threadID, replyToMessage, callback)`
Sends a message to a thread.

**New in v4.2.5:** Simplified single-attempt approach. No automatic retries - fails fast if there's an error. This prevents rate limiting and allows your code to handle retries with proper delays.

**Parameters:**
- `message` (String | Object): Text or message object
  - `body` (String): Message text
  - `attachment` (Array): Array of ReadStream attachments
  - `mentions` (Array): Array of mention objects `{tag, id, fromIndex}`
  - `sticker` (String): Sticker ID
  - `emoji` (String): Emoji to send
  - `emojiSize` (String): `"small"`, `"medium"`, or `"large"`
- `threadID` (String): Thread ID to send to
- `replyToMessage` (String, optional): Message ID to reply to
- `callback` (Function, optional): `(err, messageInfo) => void`

**Returns:** `Promise<Object>` - Message info with `messageID`, `threadID`, `timestamp`

**Note:** If you receive Error 1545012, it means you're either not in the conversation or being rate-limited by Facebook. Implement your own retry logic with appropriate delays if needed.

**Example:**
```javascript
// Simple text message
await api.sendMessage("Hello!", threadID);

// With attachment
await api.sendMessage({
  body: "Check this out!",
  attachment: fs.createReadStream('image.png')
}, threadID);

// With mentions
await api.sendMessage({
  body: "Hello @User!",
  mentions: [{ tag: '@User', id: '100001234567890' }]
}, threadID);
```

---

### `sendMessageMqtt(message, threadID, replyToMessage, callback)`
Sends a message via MQTT (faster, more reliable).

**New in v4.2.5:** Like `sendMessage`, uses simplified single-attempt approach with no automatic retries.

**Parameters:** Same as `sendMessage`

**Returns:** `Promise<Object>`

**Example:**
```javascript
await api.sendMessageMqtt("Quick message!", threadID);
```

---

### `editMessage(text, messageID, callback)`
Edits a previously sent message.

**Parameters:**
- `text` (String): New message text
- `messageID` (String): ID of message to edit
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<void>`

**Example:**
```javascript
const msg = await api.sendMessage("Original text", threadID);
await api.editMessage("Edited text", msg.messageID);
```

---

### `unsendMessage(messageID, threadID, callback)`
Unsends (deletes) a message.

**Parameters:**
- `messageID` (String): Message ID to unsend
- `threadID` (String): Thread ID
- `callback` (Function, optional): `(err, result) => void`

**Returns:** `Promise<Object>` - Unsend event info

**Example:**
```javascript
await api.unsendMessage(messageID, threadID);
```

---

### `sendTypingIndicator(sendTyping, threadID, callback)`
Sends or stops typing indicator.

**Parameters:**
- `sendTyping` (Boolean): `true` to show typing, `false` to hide
- `threadID` (String): Thread ID
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<void>`

**Example:**
```javascript
// Start typing
await api.sendTypingIndicator(true, threadID);

// Stop typing after 2 seconds
setTimeout(() => {
  api.sendTypingIndicator(false, threadID);
}, 2000);
```

---

## Thread Management

### `getThreadInfo(threadID, callback)`
Retrieves information about one or more threads.

**Parameters:**
- `threadID` (String | Array): Single thread ID or array of thread IDs
- `callback` (Function, optional): `(err, threadInfo) => void`

**Returns:** `Promise<Object | Record<string, Object>>`

**Thread Info Object:**
- `threadID` (String): Thread ID
- `threadName` (String): Thread name
- `participantIDs` (Array): Array of user IDs
- `userInfo` (Array): Array of user info objects
- `unreadCount` (Number): Unread message count
- `messageCount` (Number): Total message count
- `isGroup` (Boolean): Is group chat
- `nicknames` (Object): User nicknames
- `adminIDs` (Array): Admin user IDs
- `emoji` (String): Thread emoji
- `color` (String): Thread color

**Example:**
```javascript
const info = await api.getThreadInfo(threadID);
console.log(`Thread: ${info.threadName}`);
console.log(`Members: ${info.participantIDs.length}`);
```

---

### `getThreadList(limit, timestamp, tags, callback)`
Retrieves a list of threads.

**Parameters:**
- `limit` (Number): Number of threads to retrieve
- `timestamp` (Number | null): Timestamp to start from (null for most recent)
- `tags` (Array): Filter tags (`["INBOX"]`, `["ARCHIVED"]`, etc.)
- `callback` (Function, optional): `(err, threads) => void`

**Returns:** `Promise<Array<Object>>` - Array of thread objects

**Example:**
```javascript
const threads = await api.getThreadList(20, null, ["INBOX"]);
threads.forEach(thread => {
  console.log(`${thread.threadName}: ${thread.unreadCount} unread`);
});
```

---

### `getThreadHistory(threadID, amount, timestamp, callback)`
Retrieves message history for a thread.

**Parameters:**
- `threadID` (String): Thread ID
- `amount` (Number): Number of messages to retrieve
- `timestamp` (Number | null): Timestamp to start from
- `callback` (Function, optional): `(err, messages) => void`

**Returns:** `Promise<Array<Object>>` - Array of message objects

**Example:**
```javascript
const history = await api.getThreadHistory(threadID, 50, null);
history.forEach(msg => {
  console.log(`${msg.senderID}: ${msg.body}`);
});
```

---

## User & Account

### `getUserInfo(id, usePayload, callback)`
Fetches information about one or more users.

**Parameters:**
- `id` (String | Array): User ID or array of user IDs
- `usePayload` (Boolean, optional): Use detailed payload (default: `true`)
- `callback` (Function, optional): `(err, userInfo) => void`

**Returns:** `Promise<Object | Record<string, Object>>`

**User Info Object:**
- `id` (String): User ID
- `name` (String): Full name
- `firstName` (String): First name
- `lastName` (String): Last name
- `vanity` (String): Username
- `profileUrl` (String): Profile URL
- `profilePicUrl` (String): Profile picture URL
- `gender` (String): Gender
- `type` (String): `"user"` or `"page"`
- `isFriend` (Boolean): Is friend
- `isBirthday` (Boolean): Is birthday today

**Example:**
```javascript
const user = await api.getUserInfo('100001234567890');
console.log(`Name: ${user.name}`);
console.log(`Profile: ${user.profileUrl}`);
```

---

### `getBotInitialData(callback)`
Fetches the bot's initial data (name, user ID, app ID).

**Parameters:**
- `callback` (Function, optional): `(err, data) => void`

**Returns:** `Promise<Object>`

**Example:**
```javascript
const botData = await api.getBotInitialData();
console.log(`Bot name: ${botData.name}`);
console.log(`Bot ID: ${botData.uid}`);
```

---

### `getAccess(authCode, callback)`
Retrieves an access token for business account interactions.

**Parameters:**
- `authCode` (String, optional): Authorization code
- `callback` (Function, optional): `(err, token) => void`

**Returns:** `Promise<string>` - Access token

---

## Reactions & Interactions

### `setMessageReaction(reaction, messageID, callback)`
Sets a reaction on a message (callback-based).

**Parameters:**
- `reaction` (String): Emoji reaction
- `messageID` (String): Message ID
- `callback` (Function, optional): `(err) => void`

**Example:**
```javascript
api.setMessageReaction("❤️", messageID, (err) => {
  if (!err) console.log('Reacted!');
});
```

---

### `setMessageReactionMqtt(reaction, messageID, threadID)`
Sets a reaction on a message via MQTT.

**Parameters:**
- `reaction` (String): Emoji reaction
- `messageID` (String): Message ID
- `threadID` (String): Thread ID

**Example:**
```javascript
api.setMessageReactionMqtt("👍", messageID, threadID);
```

---

### `pinMessage(action, threadID, messageID)`
Pins, unpins, or lists pinned messages.

**Parameters:**
- `action` (String): `"pin"`, `"unpin"`, or `"list"`
- `threadID` (String): Thread ID
- `messageID` (String, optional): Message ID (required for pin/unpin)

**Returns:** `Promise<Array | Object>`

**Example:**
```javascript
// Pin a message
await api.pinMessage("pin", threadID, messageID);

// List pinned messages
const pinned = await api.pinMessage("list", threadID);

// Unpin a message
await api.pinMessage("unpin", threadID, messageID);
```

---

### `markAsRead(threadID, read, callback)`
Marks a thread as read or unread.

**Parameters:**
- `threadID` (String): Thread ID
- `read` (Boolean, optional): `true` for read, `false` for unread (default: `true`)
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<null | Error>`

**Example:**
```javascript
await api.markAsRead(threadID);
```

---

### `markAsDelivered(threadID, messageID, callback)`
Marks a message as delivered.

**Parameters:**
- `threadID` (String): Thread ID
- `messageID` (String): Message ID
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<void>`

---

### `markAsSeen(timestamp, callback)`
Marks all messages as seen up to a timestamp.

**Parameters:**
- `timestamp` (Number, optional): Timestamp in ms (defaults to now)
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<void>`

**Example:**
```javascript
await api.markAsSeen(); // Mark all as seen
```

---

### `markAsReadAll(callback)`
Marks all messages in all inboxes as read.

**Parameters:**
- `callback` (Function, optional): `(err) => void`

**Returns:** `Promise<void>`

**Example:**
```javascript
await api.markAsReadAll();
```

---

## Themes

### `getTheme(threadID)`
Retrieves all available Facebook Messenger themes.

**Parameters:**
- `threadID` (String): Thread ID

**Returns:** `Promise<Array<Object>>` - Array of theme objects

**Theme Object:**
- `id` (String): Theme ID
- `name` (String): Theme name
- `theme_idx` (Number): Theme index
- `accessibility_label` (String): Accessibility label

**Example:**
```javascript
const themes = await api.getTheme(threadID);
console.log(`Found ${themes.length} themes!`);
themes.forEach(theme => {
  console.log(`- ${theme.name} (ID: ${theme.id})`);
});
```

---

### `getThemeInfo(threadID)`
Gets the current theme information for a thread.

**Parameters:**
- `threadID` (String): Thread ID

**Returns:** `Promise<Object>` - Theme info object

**Theme Info Object:**
- `threadName` (String): Thread name
- `color` (String): Theme color
- `emoji` (String): Thread emoji
- `theme_id` (String): Theme ID
- `is_default` (Boolean): Is default theme

**Example:**
```javascript
const info = await api.getThemeInfo(threadID);
console.log(`Thread: ${info.threadName}`);
console.log(`Color: ${info.color}`);
console.log(`Theme ID: ${info.theme_id}`);
```

---

### `createAITheme(prompt)`
Generates AI-powered custom themes based on a text prompt.

**Parameters:**
- `prompt` (String): Text description of desired theme

**Returns:** `Promise<Array<Object>>` - Array of generated theme objects

**Important:** AI theme generation is restricted by Facebook to specific accounts/regions. If unavailable, you'll receive a `FEATURE_UNAVAILABLE` error.

**Example:**
```javascript
try {
  const aiThemes = await api.createAITheme("vibrant purple ocean sunset");
  console.log(`Generated theme ID: ${aiThemes[0].id}`);
  
  // Apply the theme
  await api.setThreadThemeMqtt(threadID, aiThemes[0].id);
} catch (e) {
  if (e.code === 'FEATURE_UNAVAILABLE') {
    console.log("AI themes not available for this account");
  }
}
```

---

### `setThreadThemeMqtt(threadID, themeID)`
Applies a theme to a conversation thread.

**Parameters:**
- `threadID` (String): Thread ID
- `themeID` (String): Theme ID to apply

**Example:**
```javascript
const themes = await api.getTheme(threadID);
const purpleTheme = themes.find(t => t.name.includes("Purple"));
await api.setThreadThemeMqtt(threadID, purpleTheme.id);
console.log("Theme applied!");
```

---

## Stickers

The `stickers` object provides methods to interact with Facebook Messenger stickers.

### `api.stickers.search(query)`
Searches for stickers by keyword.

**Parameters:**
- `query` (String): Search term

**Returns:** `Promise<Array<Object>>` - Array of sticker objects

**Example:**
```javascript
const stickers = await api.stickers.search("happy");
console.log(`Found ${stickers.length} stickers`);
```

---

### `api.stickers.listPacks()`
Lists the user's owned sticker packs.

**Returns:** `Promise<Array<Object>>` - Array of sticker pack objects

**Example:**
```javascript
const packs = await api.stickers.listPacks();
packs.forEach(pack => {
  console.log(`${pack.name} (ID: ${pack.id})`);
});
```

---

### `api.stickers.getStorePacks()`
Retrieves all available sticker packs from the store.

**Returns:** `Promise<Array<Object>>` - Array of sticker pack objects

---

### `api.stickers.listAllPacks()`
Merges user's packs with store packs into a single list.

**Returns:** `Promise<Array<Object>>`

---

### `api.stickers.addPack(packID)`
Adds a sticker pack to the user's collection.

**Parameters:**
- `packID` (String): Sticker pack ID

**Returns:** `Promise<Object>` - Added pack info

**Example:**
```javascript
await api.stickers.addPack("123456789");
```

---

### `api.stickers.getStickersInPack(packID)`
Retrieves all stickers in a specific pack.

**Parameters:**
- `packID` (String): Sticker pack ID

**Returns:** `Promise<Array<Object>>`

---

### `api.stickers.getAiStickers(options)`
Fetches trending AI-generated stickers.

**Parameters:**
- `options` (Object, optional)
  - `limit` (Number): Number of stickers to retrieve

**Returns:** `Promise<Array<Object>>`

**Example:**
```javascript
const aiStickers = await api.stickers.getAiStickers({ limit: 10 });
```

---

## Group Management

### `gcname(newName, threadID, callback, initiatorID)`
Sets the name of a group chat.

**Parameters:**
- `newName` (String): New group name
- `threadID` (String, optional): Thread ID (uses current if omitted)
- `callback` (Function, optional): `(err, data) => void`
- `initiatorID` (String, optional): Initiator user ID

**Returns:** `Promise<Object>` - Group name change event

**Example:**
```javascript
await api.gcname("My Awesome Group", threadID);
```

---

### `gcmember(action, userIDs, threadID, callback)`
Adds or removes members from a group chat.

**Parameters:**
- `action` (String): `"add"` or `"remove"`
- `userIDs` (String | Array): User ID(s) to add/remove
- `threadID` (String): Thread ID
- `callback` (Function, optional): `(err, data) => void`

**Returns:** `Promise<Object>`

**Example:**
```javascript
// Add member
await api.gcmember("add", "100001234567890", threadID);

// Remove multiple members
await api.gcmember("remove", ["100001", "100002"], threadID);
```

---

### `gcrule(action, userID, threadID, callback)`
Promotes or demotes a user to/from admin status.

**Parameters:**
- `action` (String): `"admin"` (promote) or `"unadmin"` (demote)
- `userID` (String): User ID
- `threadID` (String): Thread ID
- `callback` (Function, optional): `(err, data) => void`

**Returns:** `Promise<Object>`

**Example:**
```javascript
// Make admin
await api.gcrule("admin", userID, threadID);

// Remove admin
await api.gcrule("unadmin", userID, threadID);
```

---

### `nickname(nickname, threadID, participantID, callback, initiatorID)`
Sets a nickname for a participant in a thread.

**Parameters:**
- `nickname` (String): New nickname
- `threadID` (String, optional): Thread ID
- `participantID` (String, optional): User ID (defaults to self)
- `callback` (Function, optional): `(err, data) => void`
- `initiatorID` (String, optional): Initiator user ID

**Returns:** `Promise<Object>` - Nickname change event

**Example:**
```javascript
// Set nickname for another user
await api.nickname("Cool Guy", threadID, userID);

// Set own nickname
await api.nickname("Bot", threadID);
```

---

### `emoji(emoji, threadID, callback, initiatorID)`
Sets the custom emoji for a thread.

**Parameters:**
- `emoji` (String): Emoji character
- `threadID` (String, optional): Thread ID
- `callback` (Function, optional): `(err, data) => void`
- `initiatorID` (String, optional): Initiator user ID

**Returns:** `Promise<Object>` - Emoji change event

**Example:**
```javascript
await api.emoji("🎉", threadID);
```

---

## Social Interactions

### `follow(senderID, boolean, callback)`
Follows or unfollows a user.

**Parameters:**
- `senderID` (String): User ID to follow/unfollow
- `boolean` (Boolean): `true` to follow, `false` to unfollow
- `callback` (Function, optional): `(err, data) => void`

**Example:**
```javascript
// Follow user
api.follow("100001234567890", true, (err) => {
  if (!err) console.log('Followed!');
});

// Unfollow user
api.follow("100001234567890", false);
```

---

### Friend Management

The `friend` object provides methods for friend interactions.

#### `api.friend.requests()`
Fetches incoming friend requests.

**Returns:** `Promise<Array<Object>>`

**Example:**
```javascript
const requests = await api.friend.requests();
requests.forEach(req => {
  console.log(`Friend request from ${req.name} (${req.userID})`);
});
```

---

#### `api.friend.accept(identifier)`
Accepts a friend request.

**Parameters:**
- `identifier` (String): User ID or name

**Returns:** `Promise<Object>`

**Example:**
```javascript
// Accept by name
await api.friend.accept("John Doe");

// Accept by ID
await api.friend.accept("100001234567890");
```

---

#### `api.friend.list(userID)`
Fetches the friend list.

**Parameters:**
- `userID` (String, optional): User ID (defaults to current user)

**Returns:** `Promise<Array<Object>>`

**Example:**
```javascript
const friends = await api.friend.list();
console.log(`You have ${friends.length} friends`);
```

---

#### `api.friend.suggest.list(limit)`
Fetches suggested friends.

**Parameters:**
- `limit` (Number, optional): Number of suggestions

**Returns:** `Promise<Array<Object>>`

---

#### `api.friend.suggest.request(userID)`
Sends a friend request.

**Parameters:**
- `userID` (String): User ID

**Returns:** `Promise<Object>`

**Example:**
```javascript
await api.friend.suggest.request("100001234567890");
```

---

### `comment(msg, postID, replyCommentID, callback)`
Creates a comment on a Facebook post or replies to a comment.

**Parameters:**
- `msg` (String | Object): Comment text or object
  - `body` (String): Comment text
  - `attachment` (Array): Attachments
  - `mentions` (Array): Mentions
  - `url` (String): URL to share
  - `sticker` (String): Sticker ID
- `postID` (String): Post ID
- `replyCommentID` (String, optional): Comment ID to reply to
- `callback` (Function, optional): `(err, result) => void`

**Returns:** `Promise<Object>` - Comment result with `id`, `url`, `count`

**Example:**
```javascript
const result = await api.comment("Great post!", postID);
console.log(`Comment ID: ${result.id}`);

// Reply to comment
await api.comment("Thanks!", postID, commentID);
```

---

### `share(text, postID, callback)`
Generates a preview for a Facebook post.

**Parameters:**
- `text` (String, optional): Share text
- `postID` (String): Post ID
- `callback` (Function, optional): `(err, result) => void`

**Returns:** `Promise<Object>` - Share result with `postID`, `url`

**Example:**
```javascript
await api.share("Check this out!", postID);
```

---

### `shareContact(text, senderID, threadID, callback)`
Shares a user's contact information into a thread.

**Parameters:**
- `text` (String, optional): Message to send with contact
- `senderID` (String): User ID to share
- `threadID` (String): Thread ID
- `callback` (Function, optional): `(err) => void`

**Example:**
```javascript
await api.shareContact("Here's their contact", userID, threadID);
```

---

### Story Management

The `story` object provides methods for interacting with Facebook Stories.

#### `api.story.create(message, fontName, backgroundName)`
Creates a new text-based story.

**Parameters:**
- `message` (String): Story text
- `fontName` (String, optional): Font name
- `backgroundName` (String, optional): Background name

**Returns:** `Promise<Object>`

---

#### `api.story.react(storyIdOrUrl, reaction)`
Reacts to a story with an emoji.

**Parameters:**
- `storyIdOrUrl` (String): Story ID or URL
- `reaction` (String): Emoji (❤️, 👍, 🤗, 😆, 😡, 😢, 😮)

**Returns:** `Promise<Object>`

**Example:**
```javascript
await api.story.react(storyID, "❤️");
```

---

#### `api.story.msg(storyIdOrUrl, message)`
Sends a text message reply to a story.

**Parameters:**
- `storyIdOrUrl` (String): Story ID or URL
- `message` (String): Reply message

**Returns:** `Promise<Object>`

**Example:**
```javascript
await api.story.msg(storyID, "Cool story!");
```

---

## Advanced Utilities

### `httpGet(url, form, customHeader, callback, notAPI)`
Makes an HTTP GET request.

**Parameters:**
- `url` (String): URL to fetch
- `form` (Object, optional): Query parameters
- `customHeader` (Object, optional): Custom headers
- `callback` (Function, optional): `(err, data) => void`
- `notAPI` (Boolean, optional): Not an API call

**Returns:** `Promise<string>`

---

### `httpPost(url, form, customHeader, callback, notAPI)`
Makes an HTTP POST request.

**Parameters:**
- `url` (String): URL to post to
- `form` (Object, optional): Form data
- `customHeader` (Object, optional): Custom headers
- `callback` (Function, optional): `(err, data) => void`
- `notAPI` (Boolean, optional): Not an API call

**Returns:** `Promise<string>`

---

### `httpPostFormData(url, form, customHeader, callback, notAPI)`
Makes an HTTP POST request with FormData.

**Parameters:** Same as `httpPost`

**Returns:** `Promise<string>`

---

### `resolvePhotoUrl(photoID, callback)`
Resolves a photo URL from its ID.

**Parameters:**
- `photoID` (String): Photo ID
- `callback` (Function, optional): `(err, url) => void`

**Returns:** `Promise<string>` - Photo URL

---

### `addExternalModule(moduleObj)`
Adds custom external modules to the API.

**Parameters:**
- `moduleObj` (Object): Object with custom functions

**Example:**
```javascript
api.addExternalModule({
  customFunction: (param1, param2) => {
    // Your custom logic
  }
});

// Use it
api.customFunction(val1, val2);
```

---

### `setOptions(options)`
Updates API options dynamically.

**Parameters:**
- `options` (Object): Options to update (same as login options)

**Example:**
```javascript
api.setOptions({ online: false });
```

---

## TypeScript Support

This library includes full TypeScript definitions. Import types as needed:

```typescript
import { API, LoginOptions, UserInfo, ThreadInfo } from 'neokex-fca';

const options: LoginOptions = {
  online: true,
  selfListen: false
};
```

---

## Error Handling

All async methods can throw errors. Always use try-catch or `.catch()`:

```javascript
try {
  await api.sendMessage("Hello", threadID);
} catch (err) {
  console.error('Failed to send message:', err);
  
  // Handle specific errors
  if (err.code === 1545012) {
    console.log('Not in conversation or rate limited');
  }
}
```

---

## Callback vs Promise

Most methods support both callback and promise patterns:

```javascript
// Callback style
api.getUserInfo(userID, (err, info) => {
  if (err) return console.error(err);
  console.log(info.name);
});

// Promise style
api.getUserInfo(userID)
  .then(info => console.log(info.name))
  .catch(err => console.error(err));

// Async/await style
const info = await api.getUserInfo(userID);
console.log(info.name);
```

---

## Best Practices

1. **Session Management**: Always save `appState` after login for session persistence
2. **Error Handling**: Implement proper error handling for all API calls
3. **Rate Limiting**: Be mindful of Facebook's rate limits; avoid spamming requests
4. **MQTT Connection**: Use `listenMqtt()` for real-time updates instead of polling
5. **Message Sending**: Prefer `sendMessageMqtt()` over `sendMessage()` for better reliability
6. **Async/Await**: Use async/await for cleaner, more readable code

---

## Additional Resources

- [README.md](README.md) - Getting started guide
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [THEME_FEATURES.md](THEME_FEATURES.md) - Detailed theme management guide
- [BOT_TESTING.md](BOT_TESTING.md) - Test bot examples and commands
- [PUBLISHING.md](PUBLISHING.md) - Publishing guide for npm

---

## License

MIT License - See [LICENSE-MIT](LICENSE-MIT) for details

---

## Support

- GitHub Issues: [https://github.com/NeoKEX/neokex-fca/issues](https://github.com/NeoKEX/neokex-fca/issues)
- npm Package: [https://www.npmjs.com/package/neokex-fca](https://www.npmjs.com/package/neokex-fca)
