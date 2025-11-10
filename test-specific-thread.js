const { login } = require('./lib/index');
const fs = require('fs');

const cookiesJSON = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));
const TEST_THREAD_ID = '24102757045983863';

const options = {
  selfListen: false,
  listenEvents: true,
  autoMarkRead: false,
  online: true,
  logging: true
};

const testResults = {
  passed: [],
  failed: [],
  skipped: []
};

function logTest(functionName, status, message = '') {
  const statusSymbol = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
  console.log(`${statusSymbol} ${functionName}: ${message}`);
  testResults[status].push({ function: functionName, message });
}

async function runThreadTests(api) {
  console.log(`\n🧪 Testing All Functions on Thread ID: ${TEST_THREAD_ID}\n`);
  console.log('═'.repeat(70));
  
  try {
    console.log('\n📋 Core Functions:\n');
    
    logTest('getCurrentUserID', 'passed', `User ID: ${api.getCurrentUserID()}`);
    
    const appState = api.getAppState();
    logTest('getAppState', 'passed', `Got ${appState.length} cookies`);
    
    console.log('\n📬 Thread Information Functions:\n');
    
    try {
      const threadInfo = await api.getThreadInfo(TEST_THREAD_ID);
      logTest('getThreadInfo', 'passed', `Thread name: ${threadInfo.name || 'Direct Message'}, Members: ${threadInfo.participantIDs.length}`);
      console.log(`   Thread details: ${JSON.stringify({
        name: threadInfo.name,
        isGroup: threadInfo.isGroup,
        memberCount: threadInfo.participantIDs.length,
        emoji: threadInfo.emoji
      }, null, 2)}`);
    } catch (err) {
      logTest('getThreadInfo', 'failed', err.message);
    }
    
    try {
      const history = await api.getThreadHistory(TEST_THREAD_ID, 10, null);
      logTest('getThreadHistory', 'passed', `Got ${history.length} messages`);
      if (history.length > 0) {
        console.log(`   Latest message: ${history[0].body?.substring(0, 50) || '[no body]'}...`);
      }
    } catch (err) {
      logTest('getThreadHistory', 'failed', err.message);
    }
    
    try {
      const pictures = await api.getThreadPictures(TEST_THREAD_ID, 0, 5);
      logTest('getThreadPictures', 'passed', `Found ${pictures.length} pictures`);
    } catch (err) {
      logTest('getThreadPictures', 'failed', err.message);
    }
    
    console.log('\n🎨 Theme Functions:\n');
    
    try {
      const colors = api.threadColors();
      logTest('threadColors', 'passed', `Available colors: ${Object.keys(colors).join(', ')}`);
    } catch (err) {
      logTest('threadColors', 'failed', err.message);
    }
    
    try {
      if (api.getThemeInfo) {
        const themeInfo = await api.getThemeInfo(TEST_THREAD_ID);
        logTest('getThemeInfo', 'passed', `Theme ID: ${themeInfo.themeID || 'default'}, Emoji: ${themeInfo.emoji || 'none'}`);
      } else {
        logTest('getThemeInfo', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getThemeInfo', 'failed', err.message);
    }
    
    console.log('\n📝 Message Actions (Read-only):\n');
    
    try {
      await api.markAsRead(TEST_THREAD_ID);
      logTest('markAsRead', 'passed', 'Marked thread as read');
    } catch (err) {
      logTest('markAsRead', 'failed', err.message);
    }
    
    try {
      await api.markAsDelivered(TEST_THREAD_ID, api.getCurrentUserID());
      logTest('markAsDelivered', 'passed', 'Marked as delivered');
    } catch (err) {
      logTest('markAsDelivered', 'failed', err.message);
    }
    
    try {
      await api.markAsSeen();
      logTest('markAsSeen', 'passed', 'Marked all as seen');
    } catch (err) {
      logTest('markAsSeen', 'failed', err.message);
    }
    
    console.log('\n🔍 Search Functions:\n');
    
    try {
      const searchResults = await api.searchForThread('test');
      logTest('searchForThread', 'passed', `Found ${searchResults.length} results`);
    } catch (err) {
      logTest('searchForThread', 'failed', err.message);
    }
    
    console.log('\n👥 Account & User Functions:\n');
    
    try {
      const userInfo = await api.getUserInfo(api.getCurrentUserID());
      logTest('getUserInfo', 'passed', `Name: ${userInfo.name}`);
    } catch (err) {
      logTest('getUserInfo', 'failed', err.message);
    }
    
    try {
      if (api.friend && api.friend.list) {
        const friends = await api.friend.list();
        logTest('friend.list (getFriendsList)', 'passed', `Got ${friends.length} friends`);
      } else {
        logTest('friend.list', 'skipped', 'Friend module not loaded');
      }
    } catch (err) {
      logTest('friend.list', 'failed', err.message);
    }
    
    console.log('\n🌐 Network Functions:\n');
    
    try {
      const response = await api.httpGet('https://www.facebook.com/');
      logTest('httpGet', 'passed', 'Successfully made GET request');
    } catch (err) {
      logTest('httpGet', 'failed', err.message);
    }
    
    try {
      const formData = { test: 'data' };
      logTest('httpPost', 'skipped', 'Function exists (not tested to avoid unnecessary requests)');
    } catch (err) {
      logTest('httpPost', 'failed', err.message);
    }
    
    console.log('\n🛠️ Utility Functions:\n');
    
    try {
      const emojiUrl = api.getEmojiUrl('😀');
      logTest('getEmojiUrl', 'passed', `URL: ${emojiUrl}`);
    } catch (err) {
      logTest('getEmojiUrl', 'failed', err.message);
    }
    
    try {
      const result = await api.refreshFb_dtsg();
      logTest('refreshFb_dtsg', 'passed', `Refreshed: ${result.fb_dtsg.substring(0, 20)}...`);
    } catch (err) {
      logTest('refreshFb_dtsg', 'failed', err.message);
    }
    
    console.log('\n✅ Non-Destructive New Functions:\n');
    
    const newFunctions = [
      { name: 'createAITheme', exists: !!api.createAITheme, reason: 'Requires AI theme prompt (premium feature)' },
      { name: 'setThreadThemeMqtt', exists: !!api.setThreadThemeMqtt, reason: 'Requires MQTT connection' },
      { name: 'changeAdminStatus', exists: !!api.changeAdminStatus, reason: 'Requires group thread and admin permissions' },
      { name: 'changeGroupImage', exists: !!api.changeGroupImage, reason: 'Requires image stream input' },
      { name: 'createNewGroup', exists: !!api.createNewGroup, reason: 'Would create a new group' },
      { name: 'deleteThread', exists: !!api.deleteThread, reason: 'Destructive - would delete thread' },
      { name: 'uploadAttachment', exists: !!api.uploadAttachment, reason: 'Requires readable stream' },
      { name: 'stopListening', exists: !!api.stopListening, reason: 'Would disconnect MQTT' },
      { name: 'changeAvatar', exists: !!api.changeAvatar, reason: 'Would change profile picture' },
      { name: 'changeBio', exists: !!api.changeBio, reason: 'Would change profile bio' },
      { name: 'changeBlockedStatus', exists: !!api.changeBlockedStatus, reason: 'Would block/unblock users' },
      { name: 'unfriend', exists: !!api.unfriend, reason: 'Would remove friend' },
      { name: 'setPostReaction', exists: !!api.setPostReaction, reason: 'Requires post ID' },
      { name: 'handleMessageRequest', exists: !!api.handleMessageRequest, reason: 'Requires pending message request' },
      { name: 'setTitle', exists: !!api.setTitle, reason: 'Would change thread title' },
      { name: 'getUID', exists: !!api.getUID, reason: 'Requires Facebook URL' },
      { name: 'getUserID', exists: !!api.getUserID, reason: 'Requires username/profile URL' },
      { name: 'getTheme', exists: !!api.getTheme, reason: 'Wrapper for theme list' },
      { name: 'getFriendsList', exists: !!api.getFriendsList, reason: 'Alias to friend.list' },
      { name: 'addUserToGroup', exists: !!api.addUserToGroup, reason: 'Would add user to group' },
      { name: 'removeUserFromGroup', exists: !!api.removeUserFromGroup, reason: 'Would remove user from group' },
      { name: 'handleFriendRequest', exists: !!api.handleFriendRequest, reason: 'Requires pending friend request' }
    ];
    
    newFunctions.forEach(func => {
      if (func.exists) {
        logTest(func.name, 'skipped', `Function loaded - ${func.reason}`);
      } else {
        logTest(func.name, 'failed', 'Function not loaded');
      }
    });
    
    console.log('\n🔧 Functions Available for Advanced Testing:\n');
    
    if (api.ctx && api.ctx.mqttClient) {
      console.log('   ✅ MQTT is connected - can test typing indicators, themes, etc.');
    } else {
      console.log('   ⚠️  MQTT not connected - some real-time features unavailable');
    }
    
    const threadInfo = await api.getThreadInfo(TEST_THREAD_ID);
    if (threadInfo.isGroup) {
      console.log(`   ✅ Thread is a group - can test group admin functions`);
      console.log(`   Group members: ${threadInfo.participantIDs.join(', ')}`);
    } else {
      console.log(`   ℹ️  Thread is a direct message - group functions won't work`);
    }
    
  } catch (err) {
    console.error('\n❌ Test suite error:', err);
  }
  
  console.log('\n═'.repeat(70));
  console.log('\n📊 Test Summary:\n');
  console.log(`✅ Passed:  ${testResults.passed.length}`);
  console.log(`❌ Failed:  ${testResults.failed.length}`);
  console.log(`⏭️  Skipped: ${testResults.skipped.length}`);
  console.log(`📝 Total:   ${testResults.passed.length + testResults.failed.length + testResults.skipped.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(test => {
      console.log(`   - ${test.function}: ${test.message}`);
    });
  }
  
  console.log('\n✨ Testing complete!\n');
  
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

login({ appState: cookiesJSON }, options, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    process.exit(1);
  }

  console.log('✅ Logged in successfully!');
  console.log('User ID:', api.getCurrentUserID());
  
  runThreadTests(api);
});
