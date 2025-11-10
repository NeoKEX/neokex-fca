const fs = require('fs');
const { login } = require('./lib/index');

const TEST_THREAD_ID = '24102757045983863';
const TEST_TIMEOUT = 20000;

function withTimeout(promise, timeoutMs, name) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

async function runComprehensiveTests() {
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(15) + 'NeoKEX-FCA Comprehensive Test Suite' + ' '.repeat(18) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
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

    const testResults = {
      passed: [],
      failed: [],
      skipped: []
    };

    console.log('🔍 Step 2: Function Mapping Analysis...');
    console.log('-'.repeat(70));

    const functionMapping = {
      'Available Functions': [
        'setOptions', 'getAppState', 'addExternalModule', 'createPoll',
        'editMessage', 'getCurrentUserID', 'getThreadHistory', 'getThreadInfo',
        'getThreadList', 'getUserInfo', 'httpGet', 'httpPost', 'httpPostFormData',
        'listenMqtt', 'logout', 'markAsDelivered', 'markAsRead', 'markAsReadAll',
        'markAsSeen', 'muteThread', 'resolvePhotoUrl', 'sendMessage',
        'sendTypingIndicator', 'setMessageReaction', 'unsendMessage'
      ],
      'Function Name Aliases': {
        'addUserToGroup / removeUserFromGroup': 'gcmember',
        'changeThreadColor / setThreadColor': 'theme',
        'changeThreadEmoji': 'emoji',
        'changeNickname': 'nickname',
        'setTitle / createNewGroup': 'gcname',
        'forwardAttachment': 'forwardMessage',
        'deleteMessage': 'unsendMessage',
        'searchForThread': 'searchMessages'
      },
      'MQTT-Dependent Functions (require listenMqtt first)': [
        'gcmember', 'gcname', 'emoji', 'theme', 'nickname', 'sendTypingIndicator'
      ]
    };

    console.log('\n✅ Available Functions:');
    functionMapping['Available Functions'].forEach(fn => {
      console.log(`   • ${fn}`);
    });

    console.log('\n📋 Function Aliases:');
    Object.entries(functionMapping['Function Name Aliases']).forEach(([old, newName]) => {
      console.log(`   • ${old} → ${newName}`);
    });

    console.log();
    console.log('═'.repeat(70));
    
    console.log('\n🧪 Step 3: Testing Core Functionality...\n');

    try {
      const userID = api.getCurrentUserID();
      console.log(`✅ getCurrentUserID: ${userID}`);
      testResults.passed.push('getCurrentUserID');
    } catch (error) {
      console.log(`❌ getCurrentUserID failed: ${error.message}`);
      testResults.failed.push('getCurrentUserID');
    }

    console.log(`\n📨 Step 4: Testing Message Sending...`);
    
    try {
      const testMessage = `🧪 Comprehensive test - ${new Date().toLocaleString()}`;
      const messageResult = await withTimeout(
        api.sendMessage(testMessage, TEST_THREAD_ID),
        TEST_TIMEOUT,
        'sendMessage'
      );
      
      console.log('✅ Text message sent successfully!');
      console.log(`   Message ID: ${messageResult.messageID}`);
      console.log(`   Thread ID: ${messageResult.threadID}`);
      testResults.passed.push('sendMessage (text)');
    } catch (error) {
      console.log(`❌ sendMessage failed: ${error.message}`);
      testResults.failed.push('sendMessage (text)');
    }

    console.log(`\n📷 Step 5: Testing Image Attachment...`);
    
    try {
      const testImagePath = 'test-image.png';
      if (!fs.existsSync(testImagePath)) {
        const buffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+M9Qz0AEYBxVyFBfCADJfwv06b9nFAAAAABJRU5ErkJggg==',
          'base64'
        );
        fs.writeFileSync(testImagePath, buffer);
      }

      const imageStream = fs.createReadStream(testImagePath);
      const imageResult = await withTimeout(
        api.sendMessage({
          body: '🖼️ Test image',
          attachment: imageStream
        }, TEST_THREAD_ID),
        TEST_TIMEOUT,
        'sendMessage (image)'
      );
      
      console.log('✅ Image attachment sent successfully!');
      console.log(`   Message ID: ${imageResult.messageID}`);
      testResults.passed.push('sendMessage (image)');
    } catch (error) {
      console.log(`❌ Image attachment failed: ${error.message}`);
      testResults.failed.push('sendMessage (image)');
    }

    console.log(`\n📊 Step 6: Testing getThreadInfo (Promise-based)...`);
    
    try {
      const threadInfo = await withTimeout(
        api.getThreadInfo(TEST_THREAD_ID),
        TEST_TIMEOUT,
        'getThreadInfo'
      );
      
      console.log('✅ Thread info retrieved successfully!');
      console.log(`   Thread Name: ${threadInfo.threadName || 'N/A'}`);
      console.log(`   Participants: ${threadInfo.participantIDs?.length || 0}`);
      console.log(`   Is Group: ${threadInfo.isGroup}`);
      console.log(`   Message Count: ${threadInfo.messageCount || 'N/A'}`);
      testResults.passed.push('getThreadInfo');
    } catch (error) {
      console.log(`❌ getThreadInfo failed: ${error.message}`);
      testResults.failed.push('getThreadInfo');
    }

    console.log(`\n📜 Step 7: Testing getThreadHistory (Promise-based)...`);
    
    try {
      const history = await withTimeout(
        api.getThreadHistory(TEST_THREAD_ID, 5, null),
        TEST_TIMEOUT,
        'getThreadHistory'
      );
      
      console.log('✅ Thread history retrieved successfully!');
      console.log(`   Retrieved ${history.length} messages`);
      if (history.length > 0) {
        console.log(`   Latest: "${history[0].body?.substring(0, 40) || '[No text]'}..."`);
        console.log(`   Sender ID: ${history[0].senderID}`);
      }
      testResults.passed.push('getThreadHistory');
    } catch (error) {
      console.log(`❌ getThreadHistory failed: ${error.message}`);
      testResults.failed.push('getThreadHistory');
    }

    console.log(`\n👁️ Step 8: Testing markAsRead...`);
    
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
      testResults.passed.push('markAsRead');
    } catch (error) {
      console.log(`❌ markAsRead failed: ${error.message}`);
      testResults.failed.push('markAsRead');
    }

    console.log(`\n👤 Step 9: Testing getUserInfo...`);
    
    try {
      const userInfo = await withTimeout(
        new Promise((resolve, reject) => {
          api.getUserInfo(api.getCurrentUserID(), (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        }),
        TEST_TIMEOUT,
        'getUserInfo'
      );
      
      console.log('✅ User info retrieved successfully!');
      const currentUser = userInfo[api.getCurrentUserID()];
      if (currentUser) {
        console.log(`   Name: ${currentUser.name}`);
        console.log(`   Profile URL: ${currentUser.profileUrl || 'N/A'}`);
      }
      testResults.passed.push('getUserInfo');
    } catch (error) {
      console.log(`❌ getUserInfo failed: ${error.message}`);
      testResults.failed.push('getUserInfo');
    }

    console.log(`\n📋 Step 10: Testing getThreadList...`);
    
    try {
      const threadList = await withTimeout(
        new Promise((resolve, reject) => {
          api.getThreadList(5, null, [], (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        }),
        TEST_TIMEOUT,
        'getThreadList'
      );
      
      console.log('✅ Thread list retrieved successfully!');
      console.log(`   Retrieved ${threadList.length} threads`);
      if (threadList.length > 0) {
        console.log(`   First thread: ${threadList[0].name || 'Unnamed'}`);
      }
      testResults.passed.push('getThreadList');
    } catch (error) {
      console.log(`❌ getThreadList failed: ${error.message}`);
      testResults.failed.push('getThreadList');
    }

    console.log(`\n🔄 Step 11: Testing getAppState...`);
    
    try {
      const appState = api.getAppState();
      console.log('✅ AppState retrieved successfully!');
      console.log(`   Cookies: ${appState.length} entries`);
      testResults.passed.push('getAppState');
    } catch (error) {
      console.log(`❌ getAppState failed: ${error.message}`);
      testResults.failed.push('getAppState');
    }

    console.log(`\n✏️ Step 12: Testing Message Editing...`);
    
    try {
      const originalMsg = await api.sendMessage('Original message for edit test', TEST_THREAD_ID);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await withTimeout(
        new Promise((resolve, reject) => {
          api.editMessage('✏️ Edited message!', originalMsg.messageID, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }),
        TEST_TIMEOUT,
        'editMessage'
      );
      
      console.log('✅ Message edited successfully!');
      testResults.passed.push('editMessage');
    } catch (error) {
      console.log(`❌ editMessage failed: ${error.message}`);
      testResults.failed.push('editMessage');
    }

    console.log(`\n❤️ Step 13: Testing Message Reaction...`);
    
    try {
      const reactionMsg = await api.sendMessage('React to this!', TEST_THREAD_ID);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await withTimeout(
        new Promise((resolve, reject) => {
          api.setMessageReaction('❤️', reactionMsg.messageID, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }),
        TEST_TIMEOUT,
        'setMessageReaction'
      );
      
      console.log('✅ Message reaction set successfully!');
      testResults.passed.push('setMessageReaction');
    } catch (error) {
      console.log(`❌ setMessageReaction failed: ${error.message}`);
      testResults.failed.push('setMessageReaction');
    }

    console.log();
    console.log('═'.repeat(70));
    console.log('\n📊 FINAL TEST REPORT\n');
    console.log('═'.repeat(70));
    
    console.log(`\n✅ PASSED (${testResults.passed.length} tests):`);
    testResults.passed.forEach(test => console.log(`   • ${test}`));
    
    if (testResults.failed.length > 0) {
      console.log(`\n❌ FAILED (${testResults.failed.length} tests):`);
      testResults.failed.forEach(test => console.log(`   • ${test}`));
    }
    
    console.log(`\n📝 Notes:`);
    console.log(`   • Functions like gcmember, gcname, emoji, theme, nickname require`);
    console.log(`     MQTT connection (call api.listenMqtt() first)`);
    console.log(`   • sendTypingIndicator signature: sendTypingIndicator(true/false, threadID)`);
    console.log(`   • Use gcmember('add', userIDs, threadID) to add users to groups`);
    console.log(`   • Use gcname(newName, threadID) to change group name`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('✨ Comprehensive test suite completed!');
    console.log('═'.repeat(70));
    console.log();
    
    process.exit(0);

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
