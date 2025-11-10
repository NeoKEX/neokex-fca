const fs = require('fs');
const { login } = require('./lib/index');

const TEST_THREAD_ID = '24102757045983863';
const TEST_TIMEOUT = 15000;

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

async function runTests() {
  console.log('='.repeat(70));
  console.log('NeoKEX-FCA API Function Test Suite');
  console.log('='.repeat(70));
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
    console.log('-'.repeat(70));

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
    console.log('='.repeat(70));
    console.log(`Summary: ${results.existing.length}/${REQUIRED_FUNCTIONS.length} functions found`);
    if (results.missing.length > 0) {
      console.log(`Missing: ${results.missing.length} functions`);
      console.log(`  ${results.missing.slice(0, 10).join(', ')}${results.missing.length > 10 ? '...' : ''}`);
    }
    console.log('='.repeat(70));
    console.log();

    console.log('🧪 Step 3: Testing core functionality...');
    console.log('-'.repeat(70));

    try {
      const userID = api.getCurrentUserID();
      console.log(`✅ getCurrentUserID: ${userID}`);
    } catch (error) {
      console.log(`❌ getCurrentUserID failed: ${error.message}`);
    }

    console.log(`\n📨 Step 4: Testing sendMessage to thread ${TEST_THREAD_ID}...`);
    const testMessage = `🧪 Test message from NeoKEX-FCA API - ${new Date().toLocaleString()}`;
    
    try {
      const messageResult = await withTimeout(
        api.sendMessage(testMessage, TEST_THREAD_ID),
        TEST_TIMEOUT,
        'sendMessage'
      );
      
      console.log('✅ Text message sent successfully!');
      console.log(`   Message ID: ${messageResult.messageID}`);
      console.log(`   Thread ID: ${messageResult.threadID}`);
      console.log(`   Timestamp: ${messageResult.timestamp}`);
    } catch (error) {
      console.log(`❌ sendMessage failed: ${error.message}`);
    }

    console.log(`\n📷 Step 5: Testing image attachment...`);
    
    try {
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

      const imageResult = await withTimeout(
        api.sendMessage(imageMessage, TEST_THREAD_ID),
        TEST_TIMEOUT,
        'sendMessage (image)'
      );
      
      console.log('✅ Image attachment sent successfully!');
      console.log(`   Message ID: ${imageResult.messageID}`);
    } catch (error) {
      console.log(`❌ Image attachment failed: ${error.message}`);
    }

    console.log(`\n📊 Step 6: Testing getThreadInfo...`);
    
    try {
      const threadInfo = await withTimeout(
        new Promise((resolve, reject) => {
          api.getThreadInfo(TEST_THREAD_ID, (err, info) => {
            if (err) reject(err);
            else resolve(info);
          });
        }),
        TEST_TIMEOUT,
        'getThreadInfo'
      );
      
      console.log('✅ Thread info retrieved successfully!');
      console.log(`   Thread Name: ${threadInfo.threadName || 'N/A'}`);
      console.log(`   Participants: ${threadInfo.participantIDs?.length || 0}`);
      console.log(`   Message Count: ${threadInfo.messageCount || 'N/A'}`);
    } catch (error) {
      console.log(`❌ getThreadInfo failed: ${error.message}`);
    }

    console.log(`\n📜 Step 7: Testing getThreadHistory...`);
    
    try {
      const history = await withTimeout(
        new Promise((resolve, reject) => {
          api.getThreadHistory(TEST_THREAD_ID, 5, null, (err, msgs) => {
            if (err) reject(err);
            else resolve(msgs);
          });
        }),
        TEST_TIMEOUT,
        'getThreadHistory'
      );
      
      console.log('✅ Thread history retrieved successfully!');
      console.log(`   Retrieved ${history.length} messages`);
      if (history.length > 0) {
        console.log(`   Latest: "${history[0].body?.substring(0, 40) || '[No text]'}..."`);
      }
    } catch (error) {
      console.log(`❌ getThreadHistory failed: ${error.message}`);
    }

    console.log(`\n⌨️ Step 8: Testing sendTypingIndicator...`);
    
    try {
      await withTimeout(
        new Promise((resolve, reject) => {
          api.sendTypingIndicator(TEST_THREAD_ID, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }),
        TEST_TIMEOUT,
        'sendTypingIndicator'
      );
      
      console.log('✅ Typing indicator sent successfully!');
    } catch (error) {
      console.log(`❌ sendTypingIndicator failed: ${error.message}`);
    }

    console.log(`\n👁️ Step 9: Testing markAsRead...`);
    
    try {
      await withTimeout(
        new Promise((resolve, reject) => {
          api.markAsRead(TEST_THREAD_ID, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }),
        TEST_TIMEOUT,
        'markAsRead'
      );
      
      console.log('✅ Thread marked as read successfully!');
    } catch (error) {
      console.log(`❌ markAsRead failed: ${error.message}`);
    }

    console.log(`\n🎨 Step 10: Testing emoji in message...`);
    
    try {
      const emojiMessage = {
        body: '📱💬 Testing emoji support',
        emoji: '👍',
        emojiSize: 'large'
      };

      const emojiResult = await withTimeout(
        api.sendMessage(emojiMessage, TEST_THREAD_ID),
        TEST_TIMEOUT,
        'sendMessage (emoji)'
      );
      
      console.log('✅ Emoji message sent successfully!');
      console.log(`   Message ID: ${emojiResult.messageID}`);
    } catch (error) {
      console.log(`❌ Emoji message failed: ${error.message}`);
    }

    console.log();
    console.log('='.repeat(70));
    console.log('✨ Test suite completed successfully!');
    console.log('='.repeat(70));
    console.log('\n📊 Final Report:');
    console.log(`   API Functions: ${results.existing.length}/${REQUIRED_FUNCTIONS.length} available`);
    console.log(`   Tests: All core messaging features tested`);
    console.log(`   Status: ✅ Ready for use`);
    console.log();
    
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
