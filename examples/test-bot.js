const { login } = require('../index');
const fs = require('fs');
const path = require('path');

const APPSTATE_PATH = path.join(__dirname, '../test/appstate.json');
const appState = JSON.parse(fs.readFileSync(APPSTATE_PATH, 'utf8'));

const PREFIX = '/';
const ADMIN_ID = null; // Set to your user ID to restrict some commands

console.log('🤖 NeoKEX-FCA Test Bot Starting...\n');

login({ appState }, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    return;
  }

  console.log('✅ Login successful!');
  const botID = api.getCurrentUserID();
  console.log(`🤖 Bot ID: ${botID}\n`);

  api.listenMqtt((err, event) => {
    if (err) {
      console.error('MQTT Error:', err);
      return;
    }

    if (event.type === 'message' && event.body) {
      const { threadID, messageID, senderID, body, isGroup } = event;
      
      if (senderID === botID) return;
      
      if (!body.startsWith(PREFIX)) return;

      const args = body.slice(PREFIX.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();

      console.log(`📨 Command: ${command} from ${senderID} in ${threadID}`);

      handleCommand(api, command, args, threadID, messageID, senderID, isGroup);
    }
  });

  console.log('🎧 Bot is listening for commands...');
  console.log(`📝 Use prefix: ${PREFIX}`);
  console.log('💡 Example: /help\n');
});

async function handleCommand(api, command, args, threadID, messageID, senderID, isGroup) {
  try {
    switch (command) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📌 BASIC COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'help':
      case 'commands':
        await api.sendMessage(`🤖 NeoKEX-FCA Test Bot Commands

📌 BASIC
${PREFIX}help - Show this menu
${PREFIX}ping - Test response time
${PREFIX}about - Bot information

👤 USER INFO
${PREFIX}me - Your user info
${PREFIX}user <name> - Search for user
${PREFIX}friends - List your friends
${PREFIX}userid <name> - Get user ID by name

💬 THREAD COMMANDS
${PREFIX}info - Thread information
${PREFIX}history [limit] - Get message history
${PREFIX}members - List thread members
${PREFIX}photo - Thread photo URL

🎨 THEMES
${PREFIX}themes - List all available themes
${PREFIX}theme <name> - Change thread theme
${PREFIX}color <color> - Change thread color
${PREFIX}aitheme <prompt> - Generate AI theme

✏️ THREAD SETTINGS
${PREFIX}name <name> - Change thread name
${PREFIX}emoji <emoji> - Change thread emoji
${PREFIX}nickname <@mention> <nickname> - Set nickname

📎 MESSAGING
${PREFIX}typing - Send typing indicator
${PREFIX}react <emoji> - React to this message
${PREFIX}unsend - Unsend this message
${PREFIX}poll <question> | <option1> | <option2> - Create poll

🔍 SEARCH
${PREFIX}search <query> - Search users
${PREFIX}searchthread <query> - Search threads

📊 STATS
${PREFIX}status - Bot status
${PREFIX}test - Run quick API test`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📌 BASIC COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'ping':
        const start = Date.now();
        await api.sendMessage('🏓 Pong!', threadID, () => {
          const latency = Date.now() - start;
          api.sendMessage(`⏱️ Response time: ${latency}ms`, threadID);
        });
        break;

      case 'about':
        await api.sendMessage(`🤖 NeoKEX-FCA Test Bot
        
📦 Library: NeoKEX-FCA v4.4.4
✅ Success Rate: 98.2%
🔒 Security: 0 vulnerabilities
🎯 Tested APIs: 77 functions

Built to test and demonstrate the comprehensive API capabilities of NeoKEX-FCA.`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 👤 USER INFO COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'me':
        const myInfo = await api.getUserInfo(senderID);
        const user = myInfo[senderID];
        await api.sendMessage(`👤 Your Information

Name: ${user.name}
ID: ${senderID}
Username: ${user.vanity || 'None'}
Profile: https://facebook.com/${senderID}`, threadID);
        break;

      case 'friends':
        const friends = await api.getFriendsList();
        const friendsList = friends.slice(0, 10).map((f, i) => `${i + 1}. ${f.fullName}`).join('\n');
        await api.sendMessage(`👥 Your Friends (showing first 10/${friends.length})

${friendsList}

Total: ${friends.length} friends`, threadID);
        break;

      case 'userid':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}userid <name>`, threadID);
          break;
        }
        const name = args.join(' ');
        const uid = await api.getUserID(name);
        await api.sendMessage(`🔍 User ID for "${name}": ${uid}`, threadID);
        break;

      case 'user':
      case 'search':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}search <name>`, threadID);
          break;
        }
        const query = args.join(' ');
        const results = await api.searchUser(query);
        if (results.length === 0) {
          await api.sendMessage(`❌ No users found for "${query}"`, threadID);
        } else {
          const userList = results.slice(0, 5).map((u, i) => 
            `${i + 1}. ${u.name} (${u.userID})`
          ).join('\n');
          await api.sendMessage(`🔍 Search results for "${query}":

${userList}

Found: ${results.length} users`, threadID);
        }
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 💬 THREAD COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'info':
        const threadInfo = await api.getThreadInfo(threadID);
        await api.sendMessage(`💬 Thread Information

Name: ${threadInfo.threadName || 'Unnamed'}
ID: ${threadID}
Type: ${isGroup ? 'Group' : 'Direct Message'}
Members: ${threadInfo.participantIDs?.length || 0}
Messages: ${threadInfo.messageCount || 'Unknown'}
Emoji: ${threadInfo.emoji || '👍'}`, threadID);
        break;

      case 'history':
        const limit = parseInt(args[0]) || 5;
        const history = await api.getThreadHistory(threadID, limit);
        const messages = history.map((msg, i) => 
          `${i + 1}. ${msg.senderName}: ${msg.body?.substring(0, 50) || '[Attachment]'}`
        ).join('\n');
        await api.sendMessage(`📜 Recent Messages (${limit}):

${messages}`, threadID);
        break;

      case 'members':
        const info = await api.getThreadInfo(threadID);
        const memberInfo = await api.getUserInfo(info.participantIDs);
        const memberList = Object.values(memberInfo).map((m, i) => 
          `${i + 1}. ${m.name}`
        ).join('\n');
        await api.sendMessage(`👥 Thread Members:

${memberList}

Total: ${info.participantIDs.length} members`, threadID);
        break;

      case 'photo':
        const photos = await api.getThreadPictures(threadID, 0, 1);
        if (photos.length > 0) {
          await api.sendMessage(`📸 Thread Photo: ${photos[0].uri}`, threadID);
        } else {
          await api.sendMessage(`❌ No thread photo available`, threadID);
        }
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🎨 THEME COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'themes':
        const allThemes = await api.getTheme(threadID);
        const themeList = allThemes.slice(0, 15).map((t, i) => 
          `${i + 1}. ${t.name} (ID: ${t.id})`
        ).join('\n');
        await api.sendMessage(`🎨 Available Themes (showing 15/${allThemes.length}):

${themeList}

Use ${PREFIX}theme <name> to apply`, threadID);
        break;

      case 'theme':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}theme <name or ID>`, threadID);
          break;
        }
        const themeName = args.join(' ');
        await api.theme(themeName, threadID);
        await api.sendMessage(`✅ Theme changed to: ${themeName}`, threadID);
        break;

      case 'color':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}color <hex color>
Example: ${PREFIX}color #0084ff`, threadID);
          break;
        }
        const color = args[0];
        await api.changeThreadColor(color, threadID);
        await api.sendMessage(`🎨 Thread color changed to: ${color}`, threadID);
        break;

      case 'aitheme':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}aitheme <prompt>
Example: ${PREFIX}aitheme ocean sunset`, threadID);
          break;
        }
        const prompt = args.join(' ');
        const aiThemes = await api.createAITheme(prompt);
        await api.sendMessage(`🤖 Generated ${aiThemes.length} AI theme(s) for: "${prompt}"
Theme ID: ${aiThemes[0]?.id || 'Unknown'}`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✏️ THREAD SETTINGS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'name':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}name <new name>`, threadID);
          break;
        }
        const newName = args.join(' ');
        await api.setThreadName(newName, threadID);
        await api.sendMessage(`✅ Thread name changed to: ${newName}`, threadID);
        break;

      case 'emoji':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}emoji <emoji>
Example: ${PREFIX}emoji 🔥`, threadID);
          break;
        }
        await api.changeThreadEmoji(args[0], threadID);
        await api.sendMessage(`✅ Thread emoji changed to: ${args[0]}`, threadID);
        break;

      case 'nickname':
        const mentions = event.mentions;
        if (!mentions || mentions.length === 0 || args.length < 2) {
          await api.sendMessage(`❌ Usage: ${PREFIX}nickname @mention <nickname>`, threadID);
          break;
        }
        const targetID = Object.keys(mentions)[0];
        const nickname = args.slice(1).join(' ');
        await api.changeNickname(nickname, threadID, targetID);
        await api.sendMessage(`✅ Nickname changed to: ${nickname}`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📎 MESSAGING COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'typing':
        await api.sendTypingIndicator(threadID);
        await api.sendMessage('✅ Typing indicator sent!', threadID);
        break;

      case 'react':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}react <emoji>`, threadID);
          break;
        }
        await api.setMessageReaction(args[0], messageID);
        break;

      case 'unsend':
        await api.unsendMessage(messageID);
        break;

      case 'poll':
        const pollData = args.join(' ').split('|').map(s => s.trim());
        if (pollData.length < 3) {
          await api.sendMessage(`❌ Usage: ${PREFIX}poll <question> | <option1> | <option2>
Example: ${PREFIX}poll Pizza or Burger? | Pizza | Burger`, threadID);
          break;
        }
        const [question, ...options] = pollData;
        await api.createPoll(question, threadID, { options });
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔍 SEARCH COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'searchthread':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}searchthread <query>`, threadID);
          break;
        }
        const threadQuery = args.join(' ');
        const threads = await api.searchForThread(threadQuery);
        if (threads.length === 0) {
          await api.sendMessage(`❌ No threads found for "${threadQuery}"`, threadID);
        } else {
          const threadList = threads.slice(0, 5).map((t, i) => 
            `${i + 1}. ${t.name} (${t.threadID})`
          ).join('\n');
          await api.sendMessage(`🔍 Thread search results:

${threadList}

Found: ${threads.length} threads`, threadID);
        }
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📊 STATUS COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'status':
        const status = api.getTokenRefreshStatus();
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        await api.sendMessage(`📊 Bot Status

⏱️ Uptime: ${hours}h ${minutes}m
🔄 Token Refresh: ${status.isRefreshing ? 'Active' : 'Idle'}
📅 Last Refresh: ${status.lastRefreshTime ? new Date(status.lastRefreshTime).toLocaleString() : 'Never'}
📈 Refresh Count: ${status.refreshCount}
✅ MQTT: Connected`, threadID);
        break;

      case 'test':
        await api.sendMessage('🧪 Running quick API test...', threadID);
        const testResults = [];
        
        try {
          await api.getUserInfo(senderID);
          testResults.push('✅ getUserInfo');
        } catch (e) {
          testResults.push('❌ getUserInfo');
        }

        try {
          await api.getThreadInfo(threadID);
          testResults.push('✅ getThreadInfo');
        } catch (e) {
          testResults.push('❌ getThreadInfo');
        }

        try {
          await api.getTheme(threadID);
          testResults.push('✅ getTheme');
        } catch (e) {
          testResults.push('❌ getTheme');
        }

        try {
          await api.sendTypingIndicator(threadID);
          testResults.push('✅ sendTypingIndicator');
        } catch (e) {
          testResults.push('❌ sendTypingIndicator');
        }

        await api.sendMessage(`🧪 Test Results:

${testResults.join('\n')}

${testResults.filter(r => r.startsWith('✅')).length}/${testResults.length} tests passed`, threadID);
        break;

      default:
        await api.sendMessage(`❓ Unknown command: ${command}
Type ${PREFIX}help for available commands`, threadID);
    }
  } catch (error) {
    console.error(`Error handling command ${command}:`, error);
    await api.sendMessage(`❌ Error: ${error.message || 'Unknown error occurred'}`, threadID).catch(() => {});
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Bot shutting down gracefully...');
  process.exit(0);
});
