const fs = require('fs');
const { login } = require('neokex-fca');

const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

console.log('🤖 Starting NeoKEX bot with anti-detection...');

login({ appState }, {
  online: true,
  selfListen: false,
  listenEvents: true,
  autoMarkRead: true,
  
  antiDetection: true,
  requestJitter: true,
  headerVariability: true,
  randomUserAgent: false,
  
  antiLogout: true,
  keepAliveInterval: 5,
  autoRefreshToken: true
}, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    return;
  }

  console.log('✅ Bot is online!');
  console.log(`📱 User ID: ${api.getCurrentUserID()}`);
  
  console.log('🛡️  Anti-Detection Status:', api.getAntiDetectionStatus());
  console.log('🔒 Session Guardian Status:', api.getSessionGuardianStatus());

  api.listenMqtt((err, event) => {
    if (err) return console.error('Event error:', err);

    if (event.type === 'message' && event.body) {
      console.log(`💬 ${event.senderID}: ${event.body}`);

      if (event.body.toLowerCase() === '/ping') {
        api.sendMessage('🏓 Pong!', event.threadID);
      }

      if (event.body.toLowerCase() === '/time') {
        const now = new Date().toLocaleString();
        api.sendMessage(`⏰ Current time: ${now}`, event.threadID);
      }

      if (event.body.toLowerCase() === '/help') {
        const helpText = `
🤖 Available Commands:
/ping - Test bot responsiveness  
/time - Get current time
/help - Show this message
        `.trim();
        api.sendMessage(helpText, event.threadID);
      }
    }
  });
});
