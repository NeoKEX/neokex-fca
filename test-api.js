const fs = require('fs');
const { login } = require('./lib/index');

const TEST_THREAD_ID = '24102757045983863';
const TEST_TIMEOUT = 10000;

const REQUIRED_FUNCTIONS = [
  "setOptions", "getAppState", "addExternalModule", "addUserToGroup",
  "changeAdminStatus", "changeArchivedStatus", "changeAvatar", "changeBio",
  "changeBlockedStatus", "changeGroupImage", "changeNickname", "changeThreadColor",
  "changeThreadEmoji", "createNewGroup", "createPoll", "deleteMessage",
  "deleteThread", "editMessage", "forwardAttachment", "generateAiTheme",
  "getCurrentUserID", "getEmojiUrl", "getFriendsList", "getMessage",
  "getTheme", "getThemeInfo", "getThreadHistory", "getThreadInfo",
  "getThreadList", "getThreadPictures", "getUID", "getUserID",
  "getUserInfo", "handleFriendRequest", "handleMessageRequest", "httpGet",
  "httpPost", "httpPostFormData", "listenMqtt", "logout",
  "markAsDelivered", "markAsRead", "markAsReadAll", "markAsSeen",
  "muteThread", "refreshFb_dtsg", "removeUserFromGroup", "resolvePhotoUrl",
  "searchForThread", "sendMessage", "sendTypingIndicator", "setMessageReaction",
  "setPostReaction", "setTitle", "threadColors", "unfriend",
  "unsendMessage", "uploadAttachment", "listen", "stopListening",
  "stopListeningAsync"
];

function withTimeout(promise, timeoutMs, name) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

async function testFunction(fn, name, ...args) {
  try {
    const result = await withTimeout(
      new Promise((resolve, reject) => {
        fn(...args, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      }),
      TEST_TIMEOUT,
      name
    );
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('NeoKEX-FCA API Function Test Suite');
  console.log('='.repeat(60));
  console.log();

  const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));

  console.log('📝 Step 1: Logging in with cookies...');
  
  try {
    const api = await new Promise((resolve, reject) => {
      login({ appState: cookies }, { logging: false }, (err, api) => {
        if (err) reject(err);
        else resolve(api);
      });
    });

    console.log('✅ Login successful!\n');

    console.log('📋 Step 2: Checking API functions existence...');
    console.log('-'.repeat(60));

    const results = {
      existing: [],
      missing: []
    };

    REQUIRED_FUNCTIONS.forEach(funcName => {
      if (typeof api[funcName] === 'function') {
        results.existing.push(funcName);
        console.log(`✅ ${funcName}`);
      } else {
        results.missing.push(funcName);
        console.log(`❌ ${funcName} - NOT FOUND`);
      }
    });

    console.log();
    console.log('='.repeat(60));
    console.log(`Summary: ${results.existing.length}/${REQUIRED_FUNCTIONS.length} functions found`);
    if (results.missing.length > 0) {
      console.log(`Missing functions: ${results.missing.length}`);
    }
    console.log('='.repeat(60));
    console.log();

    console.log('🧪 Step 3: Testing core functionality...');
    console.log('-'.repeat(60));

    const userIDTest = await testFunction(api.getCurrentUserID, 'getCurrentUserID');
    if (userIDTest.success) {
      console.log(`✅ getCurrentUserID: ${userIDTest.result}`);
    } else {
      console.log(`❌ getCurrentUserID failed: ${userIDTest.error}`);
    }

    console.log(`\n📨 Step 4: Testing sendMessage to thread ${TEST_THREAD_ID}...`);
    const testMessage = `🧪 Test message from NeoKEX-FCA API - ${new Date().toISOString()}`;
    
    const messageTest = await testFunction(api.sendMessage, 'sendMessage', testMessage, TEST_THREAD_ID);
    if (messageTest.success) {
      console.log('✅ Text message sent successfully!');
      console.log(`   Message ID: ${messageTest.result.messageID}`);
      console.log(`   Thread ID: ${messageTest.result.threadID}`);
    } else {
      console.log(`❌ sendMessage failed: ${messageTest.error}`);
    }

    console.log(`\n📷 Step 5: Testing image attachment...`);
    
    const testImagePath = 'test-image.png';
    if (!fs.existsSync(testImagePath)) {
      const buffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      fs.writeFileSync(testImagePath, buffer);
    }

    const imageStream = fs.createReadStream(testImagePath);
    const imageMessage = {
      body: '🖼️ Test image attachment',
      attachment: imageStream
    };

    const imageTest = await testFunction(api.sendMessage, 'sendMessage (image)', imageMessage, TEST_THREAD_ID);
    if (imageTest.success) {
      console.log('✅ Image attachment sent successfully!');
      console.log(`   Message ID: ${imageTest.result.messageID}`);
    } else {
      console.log(`❌ Image attachment failed: ${imageTest.error}`);
    }

    console.log(`\n📊 Step 6: Testing getThreadInfo...`);
    
    const threadInfoTest = await testFunction(api.getThreadInfo, 'getThreadInfo', TEST_THREAD_ID);
    if (threadInfoTest.success) {
      console.log('✅ Thread info retrieved successfully!');
      console.log(`   Thread Name: ${threadInfoTest.result.threadName || 'N/A'}`);
      console.log(`   Participants: ${threadInfoTest.result.participantIDs?.length || 0}`);
      console.log(`   Message Count: ${threadInfoTest.result.messageCount || 'N/A'}`);
    } else {
      console.log(`❌ getThreadInfo failed: ${threadInfoTest.error}`);
    }

    console.log(`\n📜 Step 7: Testing getThreadHistory...`);
    
    const historyTest = await testFunction(api.getThreadHistory, 'getThreadHistory', TEST_THREAD_ID, 5, null);
    if (historyTest.success) {
      console.log('✅ Thread history retrieved successfully!');
      console.log(`   Retrieved ${historyTest.result.length} messages`);
      if (historyTest.result.length > 0) {
        console.log(`   Latest message: "${historyTest.result[0].body?.substring(0, 50) || '[No text]'}..."`);
      }
    } else {
      console.log(`❌ getThreadHistory failed: ${historyTest.error}`);
    }

    console.log(`\n⌨️ Step 8: Testing sendTypingIndicator...`);
    
    const typingTest = await testFunction(api.sendTypingIndicator, 'sendTypingIndicator', TEST_THREAD_ID);
    if (typingTest.success) {
      console.log('✅ Typing indicator sent successfully!');
    } else {
      console.log(`❌ sendTypingIndicator failed: ${typingTest.error}`);
    }

    console.log(`\n👁️ Step 9: Testing markAsRead...`);
    
    const readTest = await testFunction(api.markAsRead, 'markAsRead', TEST_THREAD_ID);
    if (readTest.success) {
      console.log('✅ Thread marked as read successfully!');
    } else {
      console.log(`❌ markAsRead failed: ${readTest.error}`);
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✨ Test suite completed successfully!');
    console.log('='.repeat(60));
    
    process.exit(0);

  } catch (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
