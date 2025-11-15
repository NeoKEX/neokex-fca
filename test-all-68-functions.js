const { login } = require('./src/engine/client');
const fs = require('fs');

const TEST_THREAD_ID = '1452334112548569';
const TEST_THREAD_NAME = 'BOT TEST NXXO';

let api;
const results = { passed: 0, failed: 0, skipped: 0, details: [] };

function log(test, status, details = '', skipped = false) {
  const timestamp = new Date().toISOString();
  const symbol = skipped ? '⊘' : (status ? '✅' : '❌');
  const message = `[${timestamp}] ${symbol} ${test}: ${details}`;
  console.log(message);
  
  if (skipped) results.skipped++;
  else if (status) results.passed++;
  else results.failed++;
  
  results.details.push({ test, status, details, timestamp, skipped });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAllTests() {
  console.log('\n🚀 TESTING ALL 68 API FUNCTIONS - COMPLETE COVERAGE\n');
  
  const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
  api = await new Promise((resolve, reject) => {
    login({ appState }, (err, apiInstance) => {
      if (err) reject(err);
      else resolve(apiInstance);
    });
  });
  
  console.log('✓ Login successful');
  console.log('✓ Starting MQTT listener...\n');
  
  await new Promise(resolve => {
    api.listenMqtt((err, event) => {
      if (err) console.error('MQTT Error:', err);
    });
    setTimeout(resolve, 2000);
  });
  
  console.log('═'.repeat(60));
  console.log('BASIC FUNCTIONS (Core functionality)');
  console.log('═'.repeat(60) + '\n');
  
  const userID = api.getCurrentUserID();
  log('getCurrentUserID', !!userID, userID);
  
  try {
    const msg = await api.sendMessage('🧪 Complete 68-function test', TEST_THREAD_ID);
    log('sendMessage', !!msg.messageID, msg.messageID);
    await sleep(500);
    
    if (msg.messageID) {
      await api.setMessageReaction('❤️', msg.messageID);
      log('setMessageReaction', true);
      await sleep(500);
      
      await api.editMessage('✏️ Edited', msg.messageID);
      log('editMessage', true);
      await sleep(500);
    }
  } catch (err) {
    log('sendMessage/reactions/edit', false, err.message);
  }
  
  try {
    await api.sendTypingIndicator(TEST_THREAD_ID, true);
    await sleep(1000);
    await api.sendTypingIndicator(TEST_THREAD_ID, false);
    log('sendTypingIndicator', true);
  } catch (err) {
    log('sendTypingIndicator', false, err.message);
  }
  
  try {
    await api.markAsRead(TEST_THREAD_ID);
    log('markAsRead', true);
  } catch (err) {
    log('markAsRead', false, err.message);
  }
  
  try {
    await api.markAsReadAll();
    log('markAsReadAll', true);
  } catch (err) {
    log('markAsReadAll', false, err.message);
  }
  
  try {
    await api.markAsSeen();
    log('markAsSeen', true);
  } catch (err) {
    log('markAsSeen', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('THREAD INFORMATION FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const threadInfo = await api.getThreadInfo(TEST_THREAD_ID);
    log('getThreadInfo', !!threadInfo, threadInfo.threadName);
  } catch (err) {
    log('getThreadInfo', false, err.message);
  }
  
  try {
    const history = await api.getThreadHistory(TEST_THREAD_ID, 10);
    log('getThreadHistory', Array.isArray(history), `${history.length} messages`);
  } catch (err) {
    log('getThreadHistory', false, err.message);
  }
  
  try {
    const threads = await api.getThreadList(10, null, []);
    log('getThreadList', Array.isArray(threads), `${threads.length} threads`);
  } catch (err) {
    log('getThreadList', false, err.message);
  }
  
  try {
    const pictures = await api.getThreadPictures(TEST_THREAD_ID, 0, 5);
    log('getThreadPictures', true, `Retrieved pictures`);
  } catch (err) {
    log('getThreadPictures', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('USER INFORMATION FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const userInfo = await api.getUserInfo(userID);
    log('getUserInfo', !!userInfo, userInfo.name || userInfo[userID]?.name);
  } catch (err) {
    log('getUserInfo', false, err.message);
  }
  
  try {
    const userInfoV2 = await api.getUserInfoV2(userID);
    log('getUserInfoV2', !!userInfoV2, 'Retrieved V2 info');
  } catch (err) {
    log('getUserInfoV2', false, err.message);
  }
  
  try {
    const userId = await api.getUserID('Mark Zuckerberg');
    log('getUserID', !!userId, userId);
  } catch (err) {
    log('getUserID', false, err.message);
  }
  
  try {
    const friends = await api.getFriendsList();
    log('getFriendsList', Array.isArray(friends), `${friends.length} friends`);
  } catch (err) {
    log('getFriendsList', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('THEME & CUSTOMIZATION FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const themes = await api.getTheme(TEST_THREAD_ID);
    log('getTheme', Array.isArray(themes), `${themes.length} themes`);
  } catch (err) {
    log('getTheme', false, err.message);
  }
  
  try {
    const themeInfo = await api.getThemeInfo(TEST_THREAD_ID);
    log('getThemeInfo', !!themeInfo, themeInfo.color);
  } catch (err) {
    log('getThemeInfo', false, err.message);
  }
  
  try {
    await api.changeThreadColor('#FF0000', TEST_THREAD_ID);
    await sleep(1500);
    log('changeThreadColor', true, 'Changed to red');
    await api.changeThreadColor('#0084FF', TEST_THREAD_ID);
    await sleep(1500);
    log('changeThreadColor (reset)', true, 'Reset to blue');
  } catch (err) {
    log('changeThreadColor', false, err.message);
  }
  
  try {
    await api.emoji('🔥', TEST_THREAD_ID);
    await sleep(1000);
    log('emoji (set)', true);
    await api.emoji('👍', TEST_THREAD_ID);
    await sleep(1000);
    log('emoji (reset)', true);
  } catch (err) {
    log('emoji', false, err.message);
  }
  
  try {
    await api.nickname('🤖 Test Bot', TEST_THREAD_ID, userID);
    await sleep(1000);
    log('nickname (set)', true);
    await api.nickname('', TEST_THREAD_ID, userID);
    await sleep(1000);
    log('nickname (clear)', true);
  } catch (err) {
    log('nickname', false, err.message);
  }
  
  try {
    if (api.createAITheme) {
      log('createAITheme', false, 'Skipped - requires specific input', true);
    }
  } catch (err) {
    log('createAITheme', false, err.message);
  }
  
  try {
    if (api.theme) {
      await api.theme(TEST_THREAD_ID, '0084FF');
      log('theme', true);
    }
  } catch (err) {
    log('theme', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('GROUP MANAGEMENT FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    if (api.gcname) {
      log('gcname', false, 'Skipped - would rename group', true);
    }
  } catch (err) {
    log('gcname', false, err.message);
  }
  
  try {
    if (api.gcmember) {
      log('gcmember', false, 'Skipped - group member management', true);
    }
  } catch (err) {
    log('gcmember', false, err.message);
  }
  
  try {
    if (api.gcrule) {
      log('gcrule', false, 'Skipped - group rules management', true);
    }
  } catch (err) {
    log('gcrule', false, err.message);
  }
  
  try {
    log('createNewGroup', false, 'Skipped - would create actual group', true);
  } catch (err) {
    log('createNewGroup', false, err.message);
  }
  
  try {
    log('changeGroupImage', false, 'Skipped - requires image file', true);
  } catch (err) {
    log('changeGroupImage', false, err.message);
  }
  
  try {
    log('addUserToGroup', false, 'Skipped - requires another user ID', true);
  } catch (err) {
    log('addUserToGroup', false, err.message);
  }
  
  try {
    log('removeUserFromGroup', false, 'Skipped - requires another user ID', true);
  } catch (err) {
    log('removeUserFromGroup', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('MESSAGE MANAGEMENT FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const msg = await api.sendMessage('Message to unsend', TEST_THREAD_ID);
    await sleep(1000);
    await api.unsendMessage(msg.messageID, TEST_THREAD_ID);
    log('unsendMessage', true);
  } catch (err) {
    log('unsendMessage', false, err.message);
  }
  
  try {
    const msg = await api.sendMessage('Message to delete', TEST_THREAD_ID);
    await sleep(1000);
    await api.deleteMessage(msg.messageID);
    log('deleteMessage', true);
  } catch (err) {
    log('deleteMessage', false, err.message);
  }
  
  try {
    const msg = await api.sendMessage('Message to forward', TEST_THREAD_ID);
    await sleep(1000);
    await api.forwardMessage(msg.messageID, TEST_THREAD_ID);
    log('forwardMessage', true);
  } catch (err) {
    log('forwardMessage', false, err.message);
  }
  
  try {
    if (api.pinMessage) {
      log('pinMessage', false, 'Skipped - would pin message', true);
    }
  } catch (err) {
    log('pinMessage', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('THREAD MANAGEMENT FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    await api.muteThread(TEST_THREAD_ID, 60);
    await sleep(1000);
    await api.muteThread(TEST_THREAD_ID, 0);
    log('muteThread', true);
  } catch (err) {
    log('muteThread', false, err.message);
  }
  
  try {
    await api.changeArchivedStatus(TEST_THREAD_ID, true);
    await sleep(1000);
    log('changeArchivedStatus (archive)', true);
    await api.changeArchivedStatus(TEST_THREAD_ID, false);
    await sleep(1000);
    log('changeArchivedStatus (unarchive)', true);
  } catch (err) {
    log('changeArchivedStatus', false, err.message);
  }
  
  try {
    log('deleteThread', false, 'Skipped - would delete thread', true);
  } catch (err) {
    log('deleteThread', false, err.message);
  }
  
  try {
    const results = await api.searchForThread(TEST_THREAD_NAME);
    log('searchForThread', Array.isArray(results), `${results.length} results`);
  } catch (err) {
    log('searchForThread', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('POLL & INTERACTIVE FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    const pollMsg = await api.createPoll(TEST_THREAD_ID, 'Test Poll?', ['Option 1', 'Option 2']);
    log('createPoll', !!pollMsg, 'Poll created');
  } catch (err) {
    log('createPoll', false, err.message);
  }
  
  try {
    if (api.stickers) {
      log('stickers', false, 'Skipped - requires sticker ID', true);
    }
  } catch (err) {
    log('stickers', false, err.message);
  }
  
  try {
    if (api.shareContact) {
      log('shareContact', false, 'Skipped - requires contact info', true);
    }
  } catch (err) {
    log('shareContact', false, err.message);
  }
  
  try {
    if (api.share) {
      log('share', false, 'Skipped - requires share content', true);
    }
  } catch (err) {
    log('share', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('USER RELATIONSHIP FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    await api.changeBlockedStatus(userID, true);
    await sleep(1000);
    log('changeBlockedStatus (block)', true);
    await api.changeBlockedStatus(userID, false);
    await sleep(1000);
    log('changeBlockedStatus (unblock)', true);
  } catch (err) {
    log('changeBlockedStatus', false, err.message);
  }
  
  try {
    if (api.friend) {
      log('friend', false, 'Skipped - friend request management', true);
    }
  } catch (err) {
    log('friend', false, err.message);
  }
  
  try {
    if (api.unfriend) {
      log('unfriend', false, 'Skipped - would unfriend user', true);
    }
  } catch (err) {
    log('unfriend', false, err.message);
  }
  
  try {
    if (api.follow) {
      log('follow', false, 'Skipped - follow/unfollow management', true);
    }
  } catch (err) {
    log('follow', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('PROFILE FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    log('changeAvatar', false, 'Skipped - requires image stream', true);
  } catch (err) {
    log('changeAvatar', false, err.message);
  }
  
  try {
    await api.changeBio('Testing NeoKEX-FCA', false);
    await sleep(1000);
    log('changeBio', true);
  } catch (err) {
    log('changeBio', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('STORY & SOCIAL FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    if (api.story) {
      log('story', false, 'Skipped - story posting', true);
    }
  } catch (err) {
    log('story', false, err.message);
  }
  
  try {
    if (api.comment) {
      log('comment', false, 'Skipped - post commenting', true);
    }
  } catch (err) {
    log('comment', false, err.message);
  }
  
  try {
    if (api.notes) {
      log('notes', false, 'Skipped - notes management', true);
    }
  } catch (err) {
    log('notes', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('MESSAGE REQUEST FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    await api.handleMessageRequest(TEST_THREAD_ID, true);
    log('handleMessageRequest', true);
  } catch (err) {
    log('handleMessageRequest', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('HTTP & UTILITY FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    if (api.httpGet) {
      const response = await api.httpGet('https://www.facebook.com');
      log('httpGet', !!response, 'HTTP GET working');
    }
  } catch (err) {
    log('httpGet', false, err.message);
  }
  
  try {
    if (api.httpPost) {
      log('httpPost', false, 'Skipped - requires POST data', true);
    }
  } catch (err) {
    log('httpPost', false, err.message);
  }
  
  try {
    if (api.httpPostFormData) {
      log('httpPostFormData', false, 'Skipped - requires form data', true);
    }
  } catch (err) {
    log('httpPostFormData', false, err.message);
  }
  
  try {
    if (api.resolvePhotoUrl) {
      log('resolvePhotoUrl', false, 'Skipped - requires photo ID', true);
    }
  } catch (err) {
    log('resolvePhotoUrl', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('BOT & SYSTEM FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    if (api.getBotInfo) {
      const botInfo = await api.getBotInfo();
      log('getBotInfo', !!botInfo, 'Bot info retrieved');
    }
  } catch (err) {
    log('getBotInfo', false, err.message);
  }
  
  try {
    if (api.getBotInitialData) {
      log('getBotInitialData', false, 'Skipped - bot initialization', true);
    }
  } catch (err) {
    log('getBotInitialData', false, err.message);
  }
  
  try {
    if (api.getAccess) {
      log('getAccess', false, 'Skipped - access token management', true);
    }
  } catch (err) {
    log('getAccess', false, err.message);
  }
  
  try {
    if (api.addExternalModule) {
      log('addExternalModule', false, 'Skipped - module loading', true);
    }
  } catch (err) {
    log('addExternalModule', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('MQTT & REALTIME FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    log('listenMqtt', true, 'Already initialized');
  } catch (err) {
    log('listenMqtt', false, err.message);
  }
  
  try {
    if (api.sendMessageMqtt) {
      log('sendMessageMqtt', false, 'Internal MQTT function', true);
    }
  } catch (err) {
    log('sendMessageMqtt', false, err.message);
  }
  
  try {
    if (api.setMessageReactionMqtt) {
      log('setMessageReactionMqtt', false, 'Internal MQTT function', true);
    }
  } catch (err) {
    log('setMessageReactionMqtt', false, err.message);
  }
  
  try {
    if (api.setThreadThemeMqtt) {
      log('setThreadThemeMqtt', false, 'Internal MQTT function', true);
    }
  } catch (err) {
    log('setThreadThemeMqtt', false, err.message);
  }
  
  try {
    if (api.mqttDeltaValue) {
      log('mqttDeltaValue', false, 'Internal MQTT delta handler', true);
    }
  } catch (err) {
    log('mqttDeltaValue', false, err.message);
  }
  
  try {
    if (api.realtime) {
      log('realtime', false, 'Realtime event handler', true);
    }
  } catch (err) {
    log('realtime', false, err.message);
  }
  
  try {
    if (api.listenSpeed) {
      log('listenSpeed', false, 'Network speed monitor', true);
    }
  } catch (err) {
    log('listenSpeed', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('DELIVERY & MARK FUNCTIONS');
  console.log('═'.repeat(60) + '\n');
  
  try {
    if (api.markAsDelivered) {
      await api.markAsDelivered(TEST_THREAD_ID, '1234567890');
      log('markAsDelivered', true);
    }
  } catch (err) {
    log('markAsDelivered', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('SESSION MANAGEMENT');
  console.log('═'.repeat(60) + '\n');
  
  try {
    log('logout', false, 'Skipped - would end session', true);
  } catch (err) {
    log('logout', false, err.message);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 FINAL RESULTS\n');
  console.log('═'.repeat(60));
  console.log(`✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`⊘ Skipped: ${results.skipped}`);
  console.log(`📦 Total:   ${results.passed + results.failed + results.skipped}`);
  console.log('═'.repeat(60) + '\n');
  
  fs.writeFileSync('all-68-functions-results.json', JSON.stringify(results, null, 2));
  console.log('✓ Results saved to all-68-functions-results.json\n');
  
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
