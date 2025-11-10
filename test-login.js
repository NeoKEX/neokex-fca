const { login } = require('./lib/index');
const fs = require('fs');

// Load cookies from the provided file
const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🔧 NeoKEX-FCA Test Suite');
console.log('========================\n');
console.log(`📁 Loading cookies from: ${cookiesPath}`);
console.log(`🍪 Loaded ${appState.length} cookies\n`);

const options = {
  selfListen: false,
  listenEvents: true,
  autoMarkRead: true,
  online: true,
  logging: true
};

console.log('🔐 Attempting login...\n');

login({ appState }, options, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    process.exit(1);
  }

  console.log('✅ Login successful!');
  console.log('👤 User ID:', api.getCurrentUserID());
  
  // Get current app state to verify cookies
  const currentAppState = api.getAppState();
  console.log(`🍪 Active cookies: ${currentAppState.length}`);
  
  // Test basic functionality
  console.log('\n📊 Testing API functions...\n');
  
  // Test 1: Get user info
  console.log('1️⃣  Testing getUserInfo...');
  api.getUserInfo(api.getCurrentUserID(), (err, ret) => {
    if (err) {
      console.error('   ❌ getUserInfo failed:', err);
    } else {
      const userInfo = ret[api.getCurrentUserID()];
      console.log(`   ✅ Name: ${userInfo.name}`);
      console.log(`   ✅ Profile URL: ${userInfo.profileUrl}`);
    }
    
    // Test 2: Try to send a message (this will help identify if error 1545012 occurs)
    console.log('\n2️⃣  Testing sendMessage (to self)...');
    api.sendMessage('🧪 Test message from NeoKEX-FCA', api.getCurrentUserID(), (err, info) => {
      if (err) {
        console.error('   ❌ sendMessage failed:', err.message);
        if (err.message.includes('1545012')) {
          console.log('   ℹ️  Error 1545012 detected - this is expected if:');
          console.log('      - You cannot message yourself');
          console.log('      - You need a valid thread ID');
          console.log('   💡 Tip: Use a real thread ID to test messaging');
        }
      } else {
        console.log('   ✅ Message sent successfully!');
        console.log(`   📨 Message ID: ${info.messageID}`);
        console.log(`   🧵 Thread ID: ${info.threadID}`);
      }
      
      console.log('\n🎉 Test suite completed!');
      console.log('\n📋 Summary:');
      console.log('   - Login: ✅ Working');
      console.log('   - Cookie parsing: ✅ Working');
      console.log('   - API initialization: ✅ Working');
      console.log('\n💡 To test messaging, use: api.sendMessage(message, threadID)');
      console.log('   Find a valid threadID from your conversations\n');
      
      process.exit(0);
    });
  });
});
