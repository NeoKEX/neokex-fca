const fs = require('fs');
const { login } = require('./lib/index');

const TEST_THREAD_ID = '24102757045983863';

async function testEditWithMQTT() {
  console.log('Testing editMessage with MQTT connection...\n');
  
  const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));

  const api = await new Promise((resolve, reject) => {
    login({ appState: cookies }, { logging: false }, (err, api) => {
      if (err) reject(err);
      else resolve(api);
    });
  });

  console.log('✅ Logged in');

  console.log('📡 Starting MQTT listener...');
  
  api.listenMqtt((err, event) => {
    if (err) {
      console.log('MQTT Error:', err);
      return;
    }
    
    if (event.type === 'message') {
      console.log(`📨 Received: ${event.body?.substring(0, 50)}...`);
    }
  });

  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ MQTT connected\n');

  console.log('📝 Sending original message...');
  const msgResult = await api.sendMessage('Original message to edit', TEST_THREAD_ID);
  console.log(`✅ Sent! Message ID: ${msgResult.messageID}`);

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n✏️ Editing message...');
  try {
    await new Promise((resolve, reject) => {
      api.editMessage('✏️ EDITED MESSAGE!', msgResult.messageID, (err) => {
        if (err) {
          console.log('❌ Edit failed:', err.message);
          reject(err);
        } else {
          console.log('✅ Edit successful!');
          resolve();
        }
      });
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n✨ Test complete!');
  process.exit(0);
}

testEditWithMQTT().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
