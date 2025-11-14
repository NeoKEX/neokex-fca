# NeoKEX FCA Test Bot

This test bot is designed to verify the sendMessage fixes and test the Facebook Chat API functionality.

## 📚 Documentation

- **[README](README.md)** - Getting started and overview
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Theme Features](THEME_FEATURES.md)** - Theme management guide
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Changelog](CHANGELOG.md)** - Version history

---

## Quick Start

### Running the Bot

```bash
npm run bot
```

Or directly:

```bash
node test-bot.js
```

## Available Commands

Send these commands in any Facebook Messenger conversation where the bot is present:

### `/ping`
Check if the bot is alive and responding.

**Example:**
```
You: /ping
Bot: 🏓 Pong! Bot is alive and working!
```

### `/echo <text>`
Echo back any text you send.

**Example:**
```
You: /echo Hello World!
Bot: 📢 Hello World!
```

### `/test`
Run a comprehensive message sending test. Sends 3 test messages with different content to verify:
- Simple text messages
- Messages with emojis
- Messages with special characters

**Example:**
```
You: /test
Bot: Test message 1: Simple text
Bot: Test message 2: With emoji 🎉
Bot: Test message 3: Multiple words and symbols!@#
Bot: ✅ Test complete! All messages sent.
```

### `/help`
Display all available commands.

**Example:**
```
You: /help
Bot: [Shows command list]
```

### `/theme`
Manage conversation themes using AI generation or standard themes.

#### Subcommands:

**`/theme ai <prompt>`** - Generate and apply an AI theme
```
You: /theme ai vibrant purple ocean sunset
Bot: 🎨 Generating AI theme for: "vibrant purple ocean sunset"...
Bot: ✨ AI theme applied! Generated from: "vibrant purple ocean sunset"
```

**`/theme list`** - Show available standard themes
```
You: /theme list
Bot: 🎨 Available Themes (showing first 20 of 90+):
- Purple (ID: 123456)
- Ocean (ID: 234567)
...
```

**`/theme <name>`** - Apply a standard theme by name
```
You: /theme purple
Bot: 🔍 Searching for theme: "purple"...
Bot: ✨ Theme "Purple" applied!
```

**`/theme info`** - Show current theme information
```
You: /theme info
Bot: 🎨 Current Theme Info:
Thread: My Group Chat
Theme ID: 123456
Color: #8e44ad
Emoji: 👍
Default: No
```

**Note:** AI theme generation may not be available for all Facebook accounts due to restrictions by Facebook. If unavailable, the bot will suggest using standard themes instead.

### `/stop`
Gracefully stop the bot.

**Example:**
```
You: /stop
Bot: 👋 Goodbye! Bot shutting down...
```

## What Was Fixed

The sendMessage function had complex retry logic that was actually making rate-limiting worse:
- ❌ **Before:** 3 retries with delays, membership verification, thread cooldowns
- ✅ **After:** Simple, single-attempt approach matching ws3-fca@latest

### Key Improvements:
1. **No retries** - Fails fast instead of hammering Facebook's API
2. **No delays** - Doesn't waste time on lost causes  
3. **No cooldowns** - Let Facebook handle rate limiting
4. **Clear errors** - Simple warning message when error 1545012 occurs

## Testing the Fixes

1. **Start the bot:**
   ```bash
   npm run bot
   ```

2. **Send a message to the bot** in Facebook Messenger

3. **Try the commands:**
   - Start with `/ping` to verify basic functionality
   - Use `/test` to run the comprehensive message test
   - Try `/echo` with various text inputs

4. **Monitor the console output** to see:
   - Message receipt confirmations
   - Send success/failure messages
   - Error handling (if any)

## Console Output

The bot provides detailed console logging:

```
🤖 NeoKEX FCA Test Bot - Loading...
✅ Loaded appstate.json successfully
🔐 Logging in to Facebook...
✅ Login successful!
📱 Bot User ID: 61580973722694
🎧 Listening for messages...

📨 Message from [userID] in [threadID]: /ping
   → Responding to /ping
   ✅ Sent successfully
```

## Troubleshooting

### Error 1545012
If you see this error, it means:
- You're not a member of the conversation, OR
- You're being rate-limited by Facebook

**What the bot does now:**
- Logs a clear warning
- Throws the error immediately
- Lets your code handle it (retry later, skip conversation, etc.)

**What it used to do (the problem):**
- Retry 3 times with increasing delays
- Try to verify membership
- Place thread on cooldown
- Make rate-limiting worse by spamming requests

## Files

- `test-bot.js` - Main bot script
- `appstate.json` - Facebook cookies/session
- `src/apis/sendMessage.js` - Fixed sendMessage implementation

## Notes

- The bot uses your Facebook cookies from `appstate.json`
- Messages are logged to console for debugging
- Press Ctrl+C or use `/stop` to exit the bot
- The bot ignores its own messages to prevent loops

---

## See Also

- **[API Reference](API_REFERENCE.md)** - Full documentation of all available methods
- **[Theme Features](THEME_FEATURES.md)** - Detailed theme management documentation
- **[README](README.md)** - Main project documentation
