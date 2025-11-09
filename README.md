# NeoKEX-FCA

[![npm version](https://img.shields.io/npm/v/neokex-fca.svg)](https://www.npmjs.com/package/neokex-fca)
[![npm downloads](https://img.shields.io/npm/dm/neokex-fca.svg)](https://www.npmjs.com/package/neokex-fca)
[![license](https://img.shields.io/npm/l/neokex-fca.svg)](https://github.com/NeoKEX/neokex-fca/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/neokex-fca.svg)](https://nodejs.org)

Advanced Facebook Chat API library for Node.js. Build powerful Messenger bots with real-time messaging, comprehensive features, and enterprise-grade reliability.

**Version 2.5.1** - Critical stability improvements and bug fixes ✨

---

## ✨ Features

### Core Messaging
- 📨 **Real-time Messaging** - Send and receive messages instantly via MQTT
- 📎 **Rich Attachments** - Support for images, videos, audio, files, and stickers
- ✏️ **Message Editing** - Edit sent messages in real-time
- 💬 **Reactions** - Add and remove message reactions
- 🔔 **Typing Indicators** - Send and receive typing status
- 📍 **Location Sharing** - Share location data in messages
- 👥 **Mentions** - Tag users in messages

### Thread Management
- 📋 **Thread Info** - Get detailed information about conversations
- 📜 **Message History** - Retrieve conversation history
- 📌 **Pin Messages** - Pin important messages in threads
- 🎨 **Customization** - Change thread names, emojis, and themes
- 🎨 **Theme Management** - Get and set thread themes with friendly names
- 👑 **Admin Controls** - Manage group members and admins
- 🔕 **Mute/Unmute** - Control thread notifications
- 📅 **Events** - Create and manage thread events

### Advanced Features
- 🔌 **Plugin System** - Extend functionality with custom plugins
- 🪝 **Webhooks** - Forward events to external endpoints
- 📊 **Advanced Logging** - Configurable logging with file output
- 🛡️ **Error Handling** - Comprehensive error classes and diagnostics
- 🔄 **Smart Auto-Recovery** - Intelligent reconnection with exponential backoff
- ✅ **Session Validation** - Validate credentials before connecting
- 🌐 **Proxy Support** - Full HTTP/HTTPS proxy support

### Performance & Reliability (v2.0.0 Enhancements)
- ⚡ **Performance Optimizer** - Built-in caching and request optimization
- 🔗 **Connection Manager** - Advanced health monitoring and stability
- 💾 **Smart Caching** - Reduce API calls with intelligent data caching
- 🎯 **Request Debouncing** - Prevent duplicate operations
- 📊 **Performance Metrics** - Track connection health and statistics
- 🔄 **Exponential Backoff** - Smart reconnection strategy prevents overwhelming servers

### Social Features
- 👤 **User Info** - Get detailed user profiles
- 🟢 **Active Status** - Check if users are online/active
- 📱 **Stories** - Reply to and react to stories
- 💬 **Comments** - Comment on posts
- 🔗 **Share** - Share content to timeline
- 👥 **Friends** - Send and manage friend requests
- ➕ **Follow/Unfollow** - Manage following relationships

### Enhanced Features (v2.1.0)
- 🎨 **getTheme()** - Retrieve detailed theme information for threads
- 🎨 **setTheme()** - User-friendly theme setter with predefined theme names
- 🗳️ **votePoll()** - Vote on polls in threads
- 🟢 **getActiveStatus()** - Check real-time user online/offline status
- 🔍 **searchMessages()** - Search for messages within threads
- 📧 **getMessageInfo()** - Get detailed info about specific messages
- 📅 **createEvent()** - Create events directly in threads
- 😊 **getEmojiSuggestions()** - Get emoji suggestions based on text

### AI & Advanced Features (v2.2.0)
- 🤖 **generateAitheme()** - Generate and apply AI-powered themes to conversations
- 🎨 **createAITheme()** - Create custom AI themes with Facebook GraphQL
- 🎨 **setThreadThemeMqtt()** - Apply themes using MQTT for instant updates
- 🛡️ **bypassAutomatedBehavior()** - Bypass Facebook's automated behavior detection
- 🧹 **clearAdvertisingID()** - Clear advertising ID to avoid issues
- 🔒 **Enhanced Security** - Removed deprecated 'request' library, now using modern axios
- ⚡ **Improved Reliability** - Fixed dependency conflicts and added retry logic

### Production Features (v2.1.0)
- 🛡️ **Universal Cookie Support** - Accepts all cookie formats (JSON, Netscape, header strings, raw cookies)
- 🤖 **Anti-Detection System** - Bypass Facebook's automated behavior detection
- 🔒 **Anti-Logout Protection** - Automatic session persistence and token refresh
- ⚡ **Request Randomization** - Dynamic user agents, timing jitter, and header variability
- 🔄 **Auto Keep-Alive** - Periodic session maintenance to prevent logouts
- 🔐 **Session Guardian** - Automatic checkpoint detection and recovery

### Latest Updates (v2.5.1)
- 🔥 **Critical Bug Fix** - Eliminated infinite loop crash in MQTT error handler that caused "Maximum call stack size exceeded"
- 🛡️ **Enhanced Error Recovery** - Properly removes only internal error listeners, preserving external listener functionality
- 🔄 **Improved Reconnection Logic** - Fixed error handler re-entry prevention with guard flags
- ⚡ **Stability Improvements** - All cleanup operations (unsubscribe/publish) now wrapped in try-catch to prevent cascading failures
- 🎯 **Production Ready** - Auto-reconnect now works reliably without triggering infinite error loops

### Previous Updates (v2.5.0)
- 🐛 **MQTT Binary Data Fix** - Resolved JSON parsing errors when receiving binary/non-JSON payloads
- 🛡️ **Enhanced Error Handling** - Gracefully skips non-JSON binary messages instead of crashing
- 📊 **Smart Logging** - Intelligent error logging with sanitized previews for binary data
- ⚡ **Improved Stability** - Better handling of Buffer-to-string conversion with UTF-8 encoding
- 🎯 **BOM Support** - Proper whitespace and BOM trimming for JSON messages

---

## 📦 Installation

```bash
npm install neokex-fca
```

**Requirements:** Node.js >= 18.x

---

## 🚀 Quick Start

### 1. Get Your Credentials

NeoKEX-FCA supports **ALL cookie formats** for maximum flexibility:

#### ✅ Supported Cookie Formats

**1. JSON Array Format (Recommended)**
```json
[
  {
    "key": "c_user",
    "value": "your_user_id"
  },
  {
    "key": "xs",
    "value": "your_session_token"
  }
]
```

**2. Netscape Format (Browser Export)**
```
# Netscape HTTP Cookie File
.facebook.com   TRUE    /       TRUE    1735689600      c_user  your_user_id
.facebook.com   TRUE    /       TRUE    1735689600      xs      your_session_token
```

**3. Header String Format (Copy from Browser)**
```
c_user=your_user_id; xs=your_session_token; datr=xyz123; sb=abc456
```

**4. Web Extracted Cookies (Line-Separated)**
```
c_user=your_user_id
xs=your_session_token
datr=xyz123
```

**5. Object Format**
```javascript
{
  c_user: "your_user_id",
  xs: "your_session_token"
}
```

> 💡 **Note:** Required cookies are `c_user` and `xs`. The library automatically normalizes any format.

### 2. Basic Bot Example

```javascript
const fs = require('fs');
const { login } = require('neokex-fca');

const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

login({ appState }, {
  online: true,
  selfListen: false,
  listenEvents: true,
  autoMarkRead: true
}, (err, api) => {
  if (err) {
    console.error('Login failed:', err);
    return;
  }

  console.log('✅ Logged in successfully!');

  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    
    if (event.type === 'message' && event.body) {
      console.log(`Message from ${event.senderID}: ${event.body}`);
      
      if (event.body === '/ping') {
        api.sendMessage('🏓 Pong!', event.threadID);
      }
    }
  });
});
```

---

## 📚 Advanced Usage

### Using Webhooks

```javascript
login({ appState }, {
  webhook: {
    enabled: true,
    url: 'https://your-server.com/webhook',
    events: ['message', 'event'],
    secret: 'your-secret-key'
  }
}, (err, api) => {
  // All events will be forwarded to your webhook URL
});
```

### Custom Logging

```javascript
const { login, Logger } = require('neokex-fca');

const logger = new Logger({
  level: 'debug',
  enableFile: true,
  logFilePath: './bot.log',
  colorize: true
});

login({ appState }, { logger }, (err, api) => {
  // Your bot with custom logging
});
```

### Using Plugins

```javascript
// Create a custom plugin
const myPlugin = {
  name: 'command-handler',
  init() {
    this.commands = new Map();
  },
  addCommand(name, handler) {
    this.commands.set(name, handler);
  },
  async execute(message) {
    const [cmd, ...args] = message.body.split(' ');
    const handler = this.commands.get(cmd);
    if (handler) await handler(args);
  }
};

login({ appState }, (err, api) => {
  api.plugins.register('commands', myPlugin);
  
  myPlugin.addCommand('/help', () => {
    api.sendMessage('Available commands: /help, /ping', event.threadID);
  });
});
```

### Middleware System

```javascript
login({ appState }, (err, api) => {
  // Add middleware to process events
  api.plugins.use(async (event, context) => {
    // Filter spam
    if (event.body && event.body.includes('spam')) {
      return false; // Stop processing
    }
    
    // Add metadata
    event.processedAt = Date.now();
    return event; // Continue with modified event
  });

  api.listenMqtt((err, event) => {
    // Event has been processed by middleware
    console.log(event);
  });
});
```

---

## 📖 API Reference

### Main Methods

#### `sendMessage(message, threadID, [replyTo])`
Send a message to a thread.

```javascript
// Simple text
api.sendMessage('Hello!', threadID);

// With attachments
api.sendMessage({
  body: 'Check this out!',
  attachment: fs.createReadStream('./image.jpg')
}, threadID);

// With mentions
api.sendMessage({
  body: '@User check this',
  mentions: [{
    tag: '@User',
    id: userID
  }]
}, threadID);
```

#### `listenMqtt(callback)`
Listen for real-time events.

```javascript
api.listenMqtt((err, event) => {
  if (event.type === 'message') {
    // Handle message
  }
});
```

#### `getThreadInfo(threadID, callback)`
Get information about a thread.

```javascript
api.getThreadInfo(threadID, (err, info) => {
  console.log(info.threadName);
  console.log(info.participantIDs);
});
```

#### `getUserInfo(userID, callback)`
Get user profile information.

```javascript
api.getUserInfo(userID, (err, user) => {
  console.log(user.name);
  console.log(user.profileUrl);
});
```

#### `getTheme(threadID, callback)`
Get detailed theme information for a thread.

```javascript
api.getTheme(threadID, (err, theme) => {
  console.log(theme.themeName);
  console.log(theme.themeID);
  console.log(theme.color);
  console.log(theme.emoji);
});
```

#### `setTheme(theme, threadID, callback)`
Set thread theme using friendly names or theme IDs.

```javascript
// Using theme name
api.setTheme('purple', threadID);
api.setTheme('ocean', threadID);
api.setTheme('love', threadID);

// Using theme ID
api.setTheme('271607034185782', threadID);

// Available themes: default, blue, purple, pink, orange, green, red, 
// yellow, teal, love, gradient_blue_purple, gradient_purple_pink, 
// gradient_red_orange, sunshine, ocean, berry, citrus, candy
```

#### `votePoll(pollID, optionID, threadID, callback)`
Vote on a poll in a thread.

```javascript
api.votePoll(pollID, optionID, threadID, (err, result) => {
  console.log('Vote successful:', result.success);
});
```

#### `getActiveStatus(userIDs, callback)`
Check if users are currently online/active.

```javascript
// Single user
api.getActiveStatus(userID, (err, status) => {
  console.log('Is active:', status.isActive);
  console.log('Last active:', status.lastActiveTime);
  console.log('Status:', status.status); // 'active', 'offline', or 'unknown'
});

// Multiple users
api.getActiveStatus([userID1, userID2], (err, statuses) => {
  Object.values(statuses).forEach(status => {
    console.log(`User ${status.userID}: ${status.status}`);
  });
});
```

#### `searchMessages(query, threadID, [limit], callback)`
Search for messages within a thread.

```javascript
api.searchMessages('hello', threadID, 20, (err, messages) => {
  messages.forEach(msg => {
    console.log(`${msg.senderID}: ${msg.body}`);
  });
});
```

#### `getMessageInfo(threadID, messageID, callback)`
Get detailed information about a specific message.

```javascript
api.getMessageInfo(threadID, messageID, (err, info) => {
  console.log('Message:', info.body);
  console.log('Sender:', info.senderID);
  console.log('Reactions:', info.reactions);
  console.log('Attachments:', info.attachments);
  console.log('Reply to:', info.replyTo);
});
```

#### `createEvent(eventData, threadID, callback)`
Create an event in a thread.

```javascript
api.createEvent({
  title: 'Team Meeting',
  startTime: '2025-01-15T10:00:00',
  endTime: '2025-01-15T11:00:00',
  location: 'Conference Room A',
  description: 'Monthly team sync'
}, threadID, (err, event) => {
  console.log('Event created:', event.eventID);
});
```

#### `getEmojiSuggestions(text, callback)`
Get emoji suggestions based on text input.

```javascript
api.getEmojiSuggestions('happy', (err, suggestions) => {
  suggestions.forEach(s => {
    console.log(`${s.emoji} - ${s.name}`);
  });
});
```

---

## 🔧 Configuration Options

```javascript
{
  // Connection
  online: true,              // Show online status
  selfListen: false,         // Receive own messages
  listenEvents: true,        // Listen to all events
  autoMarkRead: true,        // Auto-mark messages as read
  autoReconnect: true,       // Auto-reconnect on disconnect
  
  // Anti-Detection & Protection (NEW v2.1.0)
  antiDetection: true,       // Enable anti-detection system
  requestJitter: true,       // Add random delays between requests
  headerVariability: true,   // Randomize HTTP headers
  randomUserAgent: false,    // Use random realistic user agents
  
  // Anti-Logout & Session Management (NEW v2.1.0)
  antiLogout: true,          // Enable anti-logout protection
  keepAliveInterval: 5,      // Keep-alive interval in minutes (1-60)
  autoRefreshToken: true,    // Auto-refresh session tokens
  
  // Logging
  logger: customLogger,      // Custom logger instance
  
  // Webhooks
  webhook: {
    enabled: true,
    url: 'https://...',
    events: ['message'],
    secret: 'key'
  },
  
  // Network
  proxy: 'http://proxy:port',
  userAgent: 'Custom UA'
}
```

### 🛡️ Production-Ready Configuration

For maximum stability and protection in production:

```javascript
const { login } = require('neokex-fca');

login(appState, {
  // Core settings
  online: true,
  autoMarkRead: true,
  listenEvents: true,
  
  // Anti-detection (prevents automated behavior warnings)
  antiDetection: true,
  requestJitter: true,
  headerVariability: true,
  randomUserAgent: true,  // Use with caution
  
  // Anti-logout (keeps session alive)
  antiLogout: true,
  keepAliveInterval: 5,   // Ping every 5 minutes
  autoRefreshToken: true,
  
  // Network
  autoReconnect: true,
  proxy: 'http://your-proxy:port'  // Optional but recommended
}, (err, api) => {
  if (err) return console.error(err);
  
  // Check protection status
  console.log('Anti-Detection:', api.getAntiDetectionStatus());
  console.log('Session Guardian:', api.getSessionGuardianStatus());
  
  // Your bot logic here
});
```

---

## 🛠️ Error Handling

```javascript
const { AuthenticationError, NetworkError } = require('neokex-fca');

try {
  // Your code
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.log('Invalid credentials');
  } else if (err instanceof NetworkError) {
    console.log('Connection issue');
  }
  
  console.log(err.toJSON()); // Detailed error info
}
```

---

## 📋 Examples

Check the `examples/` directory for complete working examples:
- Basic bot
- Command handler
- Webhook integration
- Plugin system
- Advanced features

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/NeoKEX/neokex-fca.git
cd neokex-fca
```

2. **Install dependencies**
```bash
npm install
```

3. **Run tests**
```bash
npm test
```

### Code Style

- Use meaningful variable names
- Add JSDoc comments for functions
- Follow existing code patterns
- Keep functions focused and small

### Testing

Before submitting a PR:

```bash
# Run smoke tests
npm test

# Check for vulnerabilities
npm audit

# Verify package integrity
npm pack --dry-run
```

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📦 Publishing to npm

### For Maintainers

This library is published to npm. Follow these steps for publishing:

### Pre-Publishing Checklist

1. **Update version in package.json**
```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

2. **Update CHANGELOG.md**
   - Document all changes
   - Follow semantic versioning
   - Include migration guide for breaking changes

3. **Run comprehensive tests**
```bash
# Run all tests
npm test

# Check for security vulnerabilities
npm audit

# Fix auto-fixable vulnerabilities
npm audit fix

# Verify package contents
npm pack --dry-run
```

4. **Test package locally**
```bash
# Create tarball
npm pack

# Test in another project
npm install /path/to/neokex-fca-2.3.0.tgz
```

### Publishing Process

1. **Login to npm** (first time only)
```bash
npm login
```

2. **Publish to npm**
```bash
# For public package
npm publish

# For scoped package
npm publish --access public
```

3. **Verify publication**
```bash
npm view neokex-fca
```

4. **Tag release on GitHub**
```bash
git tag v2.3.0
git push origin v2.3.0
```

### Package Configuration

The package is configured with:

- **Main entry**: `index.js`
- **TypeScript definitions**: `lib/types/types/index.d.ts`
- **Files included**: `index.js`, `utils.js`, `lib/`, `src/`, `README.md`, `LICENSE`
- **Ignored files**: See `.npmignore`

### Post-Publishing

1. Update GitHub release notes
2. Announce on social media/forums
3. Update documentation website (if any)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**NeoKEX**  
- GitHub: [@NeoKEX](https://github.com/NeoKEX)
- Repository: [neokex-fca](https://github.com/NeoKEX/neokex-fca)

---

## 🙏 Credits

Inspired by **ws3-fca**

---

## ⭐ Support

If you find this library helpful, please give it a star on GitHub!

---

Copyright © 2025 NeoKEX. Licensed under MIT.
