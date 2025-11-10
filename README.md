# NeoKEX-FCA

> **An advanced, next-generation Facebook Chat API library** with enhanced features, multi-format cookie support, and comprehensive messaging capabilities.

[![npm version](https://img.shields.io/npm/v/neokex-fca.svg)](https://www.npmjs.com/package/neokex-fca)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/neokex-fca.svg)](https://nodejs.org)

## 🚀 Features

- **Multi-Format Cookie Support**: Support for arrays, strings (semicolon/comma/newline-separated), objects, and JSON strings
- **Advanced Messaging**: Send, edit, delete, forward, search messages with full attachment support
- **Message Scheduling**: Schedule messages to be sent at specific times (in-memory)
- **Real-time Events**: Listen to messages, typing indicators, read receipts, and presence updates via MQTT
- **Thread Management**: Create groups, manage members, change names, themes, emojis, and more
- **Unread Count Tracking**: Get unread message counts for specific threads or all threads
- **Poll System**: Create and manage polls in group conversations
- **Media Handling**: Upload/download photos, videos, files, stickers, and voice messages
- **Attachment Metadata**: Get metadata about attachments without downloading them
- **User Management**: Get user info, friend lists, and blocked users
- **Social Features**: Like, comment, share posts, follow/unfollow users
- **Auto-Reconnection**: Automatic reconnection with exponential backoff
- **TypeScript Support**: Full TypeScript type definitions included
- **Proxy Support**: HTTP/HTTPS proxy configuration for all requests

## 📦 Installation

```bash
npm install neokex-fca
```

## 🎯 Quick Start

### Login with Cookies (Recommended)

```javascript
const { login } = require('neokex-fca');

// Cookie array format
const appState = [
  { key: 'c_user', value: 'YOUR_C_USER' },
  { key: 'xs', value: 'YOUR_XS_VALUE' },
  { key: 'fr', value: 'YOUR_FR_VALUE' }
];

login({ appState }, (err, api) => {
  if (err) return console.error(err);
  
  api.sendMessage('Hello from NeoKEX-FCA!', 'THREAD_ID', (err, msgInfo) => {
    if (err) return console.error(err);
    console.log('Message sent:', msgInfo.messageID);
  });
});
```

### Login with Email & Password

```javascript
const { login } = require('neokex-fca');

const credentials = {
  email: 'your.email@example.com',
  password: 'your_password'
};

login(credentials, (err, api) => {
  if (err) return console.error(err);
  console.log('Logged in successfully!');
  
  // Save cookies for later use
  const cookies = api.getAppState();
  // Store cookies securely
});
```

## 🍪 Cookie Formats Supported

NeoKEX-FCA supports **all major cookie formats**:

```javascript
// 1. Array of objects
const cookies1 = [
  { key: 'c_user', value: '123456' },
  { key: 'xs', value: 'value' }
];

// 2. Semicolon-separated string
const cookies2 = "c_user=123456; xs=value; fr=token";

// 3. Comma-separated string
const cookies3 = "c_user=123456, xs=value, fr=token";

// 4. Newline-separated string
const cookies4 = "c_user=123456\\nxs=value\\nfr=token";

// 5. Object format
const cookies5 = {
  c_user: '123456',
  xs: 'value',
  fr: 'token'
};

// 6. JSON string
const cookies6 = '[{"key":"c_user","value":"123456"}]';

// All formats work!
login({ appState: cookies1 }, callback);
```

## 📚 API Documentation

### Messaging

#### sendMessage
```javascript
api.sendMessage(message, threadID, callback);
api.sendMessage(message, threadID, replyToMessage, callback);

// Examples:
api.sendMessage('Hello!', threadID);
api.sendMessage({ body: 'Hello!', attachment: fs.createReadStream('image.jpg') }, threadID);
api.sendMessage({ body: 'Reply', mentions: [{ tag: '@User', id: userID }] }, threadID);
```

#### editMessage
```javascript
api.editMessage(newMessage, messageID, callback);
```

#### unsendMessage
```javascript
api.unsendMessage(messageID, callback);
```

#### forwardMessage (Advanced)
```javascript
// Forward a message to multiple threads
api.forwardMessage(messageID, [threadID1, threadID2, threadID3], (err, results) => {
  results.forEach(result => {
    console.log(`Thread ${result.threadID}: ${result.success ? 'Success' : result.error}`);
  });
});
```

#### searchMessages (Advanced)
```javascript
// Search messages in a thread or globally
api.searchMessages('search query', threadID, 20, (err, results) => {
  results.forEach(msg => {
    console.log(`Found: ${msg.body} in thread ${msg.threadID}`);
  });
});
```

#### bulkSendMessage (Advanced)
```javascript
// Send to multiple threads with delay
api.bulkSendMessage('Broadcast message', [threadID1, threadID2], 1000, (err, results) => {
  console.log(`Sent to ${results.filter(r => r.success).length} threads`);
});
```

#### createPoll (Advanced)
```javascript
// Create a poll in group chat
api.createPoll(threadID, 'What do you prefer?', ['Option 1', 'Option 2', 'Option 3'], (err, poll) => {
  console.log('Poll created:', poll.pollID);
});
```

#### votePoll (Advanced)
```javascript
// Vote on a poll
api.votePoll(pollID, optionID, true, callback); // true = add vote, false = remove vote
```

#### scheduleMessage (Advanced)
```javascript
// Schedule a message to be sent at a specific time
const scheduledTime = Date.now() + 60000; // 1 minute from now
const scheduled = api.scheduleMessage.schedule('Scheduled message!', threadID, scheduledTime);

// List all scheduled messages
const pending = api.scheduleMessage.list();

// Cancel a specific scheduled message
scheduled.cancel();

// Cancel all scheduled messages
api.scheduleMessage.cancelAll();
```

**⚠️ Important Note:** Scheduled messages are stored in-memory only and will be lost if the process restarts. For production use, implement your own persistence layer with a database or task queue.

### Thread Management

#### getThreadInfo
```javascript
api.getThreadInfo(threadID, callback);
```

#### getThreadList
```javascript
api.getThreadList(limit, timestamp, tags, callback);
```

#### getThreadHistory
```javascript
api.getThreadHistory(threadID, amount, timestamp, callback);
```

#### gcname (Change Group Name)
```javascript
api.gcname(newName, threadID, callback);
```

#### gcmember (Add/Remove Members)
```javascript
api.gcmember(action, threadID, userIDs, callback);
// action: 'add' or 'remove'
```

#### theme (Change Thread Theme)
```javascript
api.theme(color, threadID, callback);
```

#### emoji (Change Thread Emoji)
```javascript
api.emoji(emoji, threadID, callback);
```

#### archiveThread (Advanced)
```javascript
api.archiveThread(threadID, true, callback); // true = archive, false = unarchive
```

#### muteThread (Advanced)
```javascript
api.muteThread(threadID, -1, callback); // -1 = mute forever, 0 = unmute, seconds = mute duration
```

#### getUnreadCount (Advanced)
```javascript
// Get unread count for a specific thread
api.getUnreadCount(threadID, (err, result) => {
  console.log(`Thread ${result.threadName}: ${result.unreadCount} unread`);
});

// Get total unread count across all threads
api.getUnreadCount(null, (err, result) => {
  console.log(`Total unread: ${result.totalUnreadCount}`);
  console.log(`Unread threads: ${result.unreadThreadsCount}`);
  result.threads.forEach(t => {
    console.log(`  - ${t.threadName}: ${t.unreadCount}`);
  });
});
```

### User Operations

#### getUserInfo
```javascript
api.getUserInfo(userID, callback);
api.getUserInfo([userID1, userID2], callback); // Multiple users
```

#### getBlockedUsers (Advanced)
```javascript
api.getBlockedUsers((err, blockedIDs) => {
  console.log('Blocked users:', blockedIDs);
});
```

### Real-time Events

#### listenMqtt
```javascript
api.listenMqtt((err, event) => {
  if (err) return console.error(err);
  
  switch(event.type) {
    case 'message':
      console.log(`Message from ${event.senderID}: ${event.body}`);
      break;
    case 'message_reaction':
      console.log(`${event.userID} reacted with ${event.reaction}`);
      break;
    case 'typ':
      console.log(`${event.from} is typing...`);
      break;
    case 'read_receipt':
      console.log(`${event.reader} read the message`);
      break;
  }
});
```

### Media & Attachments

#### downloadAttachment (Advanced)
```javascript
// Download to file
api.downloadAttachment(attachmentURL, './downloads/file.jpg', (err, result) => {
  console.log('Downloaded:', result.path, 'Size:', result.size);
});

// Download to memory
api.downloadAttachment(attachmentURL, null, (err, result) => {
  console.log('Data buffer:', result.data);
});
```

#### getAttachmentMetadata (Advanced)
```javascript
// Get metadata about an attachment without downloading
api.getAttachmentMetadata(attachmentURL, (err, metadata) => {
  if (metadata.isAccessible) {
    console.log('Type:', metadata.mediaType);
    console.log('Size:', metadata.fileSizeFormatted);
    console.log('Extension:', metadata.fileExtension);
  } else {
    console.log('Not accessible:', metadata.error);
  }
});
```

### Social Features

#### comment
```javascript
api.comment(text, postID, callback);
```

#### follow
```javascript
api.follow(userID, callback);
```

#### share
```javascript
api.share(url, threadID, callback);
```

#### story
```javascript
api.story(message, callback);
```

### Configuration

#### setOptions
```javascript
api.setOptions({
  selfListen: false,          // Receive own messages
  listenEvents: true,         // Listen to events
  autoMarkRead: true,         // Auto-mark messages as read
  autoMarkDelivery: false,    // Auto-mark messages as delivered
  online: true,               // Show online status
  forceLogin: false,          // Force new login
  updatePresence: false,      // Update presence
  userAgent: 'custom-agent',  // Custom user agent
  proxy: 'http://proxy:port'  // Proxy configuration
});
```

## 🔧 Advanced Examples

### Echo Bot
```javascript
const { login } = require('neokex-fca');

login({ appState: cookies }, (err, api) => {
  api.setOptions({ selfListen: false });
  
  api.listenMqtt((err, event) => {
    if (event.type === 'message' && event.body) {
      api.sendMessage(`Echo: ${event.body}`, event.threadID);
    }
  });
});
```

### Auto-Reply Bot
```javascript
api.listenMqtt((err, event) => {
  if (event.type === 'message') {
    const body = event.body.toLowerCase();
    
    if (body.includes('hello')) {
      api.sendMessage('Hi there! 👋', event.threadID);
    } else if (body.includes('help')) {
      api.sendMessage('Available commands: help, status, poll', event.threadID);
    } else if (body.includes('poll')) {
      api.createPoll(event.threadID, 'Quick poll?', ['Yes', 'No']);
    }
  }
});
```

### Group Management Bot
```javascript
api.listenMqtt((err, event) => {
  if (event.type === 'event' && event.logMessageType === 'log:subscribe') {
    // New member joined
    api.sendMessage(`Welcome ${event.logMessageData.addedParticipants[0]}! 🎉`, event.threadID);
  }
});
```

## 🛡️ Error Handling

```javascript
api.sendMessage('Test', threadID, (err, info) => {
  if (err) {
    if (err.error === 1357001) {
      console.error('Account blocked by Facebook');
    } else if (err.statusCode >= 500) {
      console.error('Facebook server error, retrying...');
    } else {
      console.error('Error:', err);
    }
    return;
  }
  console.log('Success:', info);
});
```

## 🔐 Security Best Practices

1. **Never commit cookies**: Store cookies in environment variables or secure files
2. **Use app passwords**: Enable 2FA and use app-specific passwords
3. **Rotate cookies regularly**: Refresh your session periodically
4. **Monitor suspicious activity**: Facebook may flag unusual patterns
5. **Use proxies**: Rotate proxies to avoid rate limits

## 📝 TypeScript Support

```typescript
import { login, API } from 'neokex-fca';

interface MessageEvent {
  type: 'message';
  body: string;
  senderID: string;
  threadID: string;
}

login({ appState: cookies }, (err, api: API) => {
  if (err) return;
  
  api.listenMqtt((err, event: MessageEvent) => {
    if (event.type === 'message') {
      console.log(event.body);
    }
  });
});
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

MIT License - Copyright (c) 2025 [NeoKEX](https://github.com/NeoKEX)

## 🙏 Credits

Created and maintained by **[NeoKEX](https://github.com/NeoKEX)**

## 🔗 Links

- **GitHub**: [https://github.com/NeoKEX/neokex-fca](https://github.com/NeoKEX/neokex-fca)
- **npm**: [https://www.npmjs.com/package/neokex-fca](https://www.npmjs.com/package/neokex-fca)
- **Issues**: [https://github.com/NeoKEX/neokex-fca/issues](https://github.com/NeoKEX/neokex-fca/issues)

## ⚠️ Disclaimer

This is an unofficial library. Use at your own risk. Facebook may detect and block automated access to their services.

---

**Made with ❤️ by NeoKEX**
