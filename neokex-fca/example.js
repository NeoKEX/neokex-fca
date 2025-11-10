const { login } = require('./lib/index');

const appState = [
  { key: 'c_user', value: 'YOUR_C_USER' },
  { key: 'xs', value: 'YOUR_XS_VALUE' },
  { key: 'fr', value: 'YOUR_FR_VALUE' }
];

const options = {
  selfListen: false,
  listenEvents: true,
  autoMarkRead: true,
  online: true,
  logging: true
};

login({ appState }, options, (err, api) => {
  if (err) {
    console.error('Login failed:', err);
    return;
  }

  console.log('✅ Logged in successfully!');
  console.log('User ID:', api.getCurrentUserID());

  console.log('\\nNeoKEX-FCA v3.0.0 - Advanced Facebook Chat API');
  console.log('============================================');
  console.log('\\nAvailable Features:');
  console.log('- Multi-format cookie support (array, string, object, JSON)');
  console.log('- Advanced messaging (send, edit, delete, forward, search)');
  console.log('- Real-time events via MQTT');
  console.log('- Thread management (archive, mute, polls)');
  console.log('- Media handling (upload/download)');
  console.log('- User management');
  console.log('- Social features (like, comment, share)');
  
  console.log('\\nListening for messages...');

  api.listenMqtt((err, event) => {
    if (err) {
      console.error('Listen error:', err);
      return;
    }

    if (event.type === 'message' && event.body) {
      console.log(`\\n📨 Message from ${event.senderName}: ${event.body}`);
      
      if (event.body.toLowerCase() === 'ping') {
        api.sendMessage('Pong! 🏓', event.threadID, (err, info) => {
          if (err) console.error(err);
          else console.log('✅ Sent reply:', info.messageID);
        });
      } else if (event.body.toLowerCase() === 'help') {
        const helpText = `
NeoKEX-FCA Commands:
- ping: Test the bot
- help: Show this message
- poll: Create a sample poll
- info: Get thread info
        `.trim();
        api.sendMessage(helpText, event.threadID);
      } else if (event.body.toLowerCase() === 'poll') {
        api.createPoll(event.threadID, 'Do you like NeoKEX-FCA?', ['Yes!', 'Absolutely!', 'Of course!'], (err, poll) => {
          if (err) console.error(err);
          else console.log('✅ Created poll:', poll.pollID);
        });
      } else if (event.body.toLowerCase() === 'info') {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) console.error(err);
          else {
            const infoText = `
Thread Info:
- Name: ${info.name || 'Direct Message'}
- Type: ${info.isGroup ? 'Group' : 'Direct'}
- Members: ${info.participantIDs.length}
- Unread: ${info.unreadCount}
            `.trim();
            api.sendMessage(infoText, event.threadID);
          }
        });
      }
    } else if (event.type === 'typ') {
      console.log(`✍️  ${event.from} is typing...`);
    } else if (event.type === 'read_receipt') {
      console.log(`👀 ${event.reader} read the message`);
    }
  });
});
