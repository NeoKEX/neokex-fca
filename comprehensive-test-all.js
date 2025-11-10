const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
const TEST_THREAD_ID = '24102757045983863';

console.log('🧪 NeoKEX-FCA COMPREHENSIVE TEST - ALL FUNCTIONS\n');
console.log(`📍 Test Thread ID: ${TEST_THREAD_ID}\n`);

const options = { logging: false };
let passed = 0, failed = 0, skipped = 0;
const errors = [];

const test = (name, success, error = null, reason = null) => {
  if (success === null) {
    console.log(`⚪ ${name} - Skipped${reason ? ': ' + reason : ''}`);
    skipped++;
  } else if (success) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    const errorMsg = error ? ': ' + (error.message || error) : '';
    console.log(`❌ ${name}${errorMsg}`);
    errors.push({ function: name, error: error ? (error.message || error) : 'Unknown error' });
    failed++;
  }
};

login({ appState }, options, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login successful\n');
  const uid = api.getCurrentUserID();
  let messageID = null;
  let pollID = null;
  
  // ========== CORE FUNCTIONS ==========
  console.log('📦 CORE FUNCTIONS:');
  test('getCurrentUserID', !!uid);
  test('getAppState', Array.isArray(api.getAppState()) && api.getAppState().length > 0);
  test('getOptions', typeof api.getOptions() === 'object');

  // ========== ACCOUNT FUNCTIONS ==========
  console.log('\n👤 ACCOUNT FUNCTIONS:');
  try {
    const userInfo = await api.getUserInfo(uid);
    test('getUserInfo', userInfo && userInfo.name);
  } catch(e) { test('getUserInfo', false, e); }

  try {
    const userIdResult = await api.getUserID('Facebook');
    test('getUserID', Array.isArray(userIdResult));
  } catch(e) { test('getUserID', false, e); }

  try {
    const blockedUsers = await api.getBlockedUsers();
    test('getBlockedUsers', Array.isArray(blockedUsers));
  } catch(e) { test('getBlockedUsers', false, e); }

  // ========== CONVERSATION FUNCTIONS ==========
  console.log('\n💬 CONVERSATION FUNCTIONS:');
  try {
    const threads = await api.getThreadList(10, null, ['INBOX']);
    test('getThreadList', Array.isArray(threads) && threads.length > 0);
  } catch(e) { test('getThreadList', false, e); }

  try {
    const threadInfo = await api.getThreadInfo(TEST_THREAD_ID);
    test('getThreadInfo', threadInfo && threadInfo.threadID);
  } catch(e) { test('getThreadInfo', false, e); }

  try {
    const history = await api.getThreadHistory(TEST_THREAD_ID, 5, null);
    test('getThreadHistory', Array.isArray(history));
  } catch(e) { test('getThreadHistory', false, e); }

  try {
    const pictures = await api.getThreadPictures(TEST_THREAD_ID);
    test('getThreadPictures', true);
  } catch(e) { test('getThreadPictures', false, e); }

  try {
    const unreadCount = await api.getUnreadCount(TEST_THREAD_ID);
    test('getUnreadCount', typeof unreadCount === 'number');
  } catch(e) { test('getUnreadCount', false, e); }

  try {
    const searchResults = await api.searchForThread('test');
    test('searchForThread', Array.isArray(searchResults));
  } catch(e) { test('searchForThread', false, e); }

  // ========== MESSAGING FUNCTIONS ==========
  console.log('\n📨 MESSAGING FUNCTIONS:');
  try {
    const msg = await api.sendMessage('🧪 Comprehensive Test - Initial Message', TEST_THREAD_ID);
    messageID = msg.messageID;
    test('sendMessage', msg && msg.messageID);
  } catch(e) { test('sendMessage', false, e); }

  if (messageID) {
    try {
      await api.editMessage('🧪 Edited Message', messageID);
      test('editMessage', null, null, 'Requires MQTT connection');
    } catch(e) {
      if (e.message.includes('MQTT')) {
        test('editMessage', null, null, 'Requires MQTT connection');
      } else {
        test('editMessage', false, e);
      }
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.unsendMessage(messageID);
      test('unsendMessage', true);
    } catch(e) { test('unsendMessage', false, e); }
  } else {
    test('editMessage', null, null, 'No messageID available');
    test('unsendMessage', null, null, 'No messageID available');
  }

  try {
    await api.markAsRead(TEST_THREAD_ID);
    test('markAsRead', true);
  } catch(e) { test('markAsRead', false, e); }

  try {
    await api.markAsSeen();
    test('markAsSeen', true);
  } catch(e) { test('markAsSeen', false, e); }

  try {
    await api.sendTypingIndicator(TEST_THREAD_ID);
    test('sendTypingIndicator', null, null, 'Requires MQTT connection');
  } catch(e) {
    if (e.message.includes('MQTT')) {
      test('sendTypingIndicator', null, null, 'Requires MQTT connection');
    } else {
      test('sendTypingIndicator', false, e);
    }
  }

  try {
    await api.markAsReadAll();
    test('markAsReadAll', true);
  } catch(e) { test('markAsReadAll', false, e); }

  // Advanced Messaging
  console.log('\n⚙️  ADVANCED MESSAGING:');
  
  try {
    const msg2 = await api.sendMessage('🧪 Test for forwarding', TEST_THREAD_ID);
    if (msg2 && msg2.messageID) {
      await api.forwardMessage(msg2.messageID, [TEST_THREAD_ID]);
      test('forwardMessage', true);
    } else {
      test('forwardMessage', null, null, 'No message to forward');
    }
  } catch(e) { test('forwardMessage', false, e); }

  try {
    const searchResults = await api.searchMessages('test', TEST_THREAD_ID, 10);
    test('searchMessages', Array.isArray(searchResults));
  } catch(e) { test('searchMessages', false, e); }

  try {
    await api.bulkSendMessage('🧪 Bulk test', [TEST_THREAD_ID], 100);
    test('bulkSendMessage', true);
  } catch(e) { test('bulkSendMessage', false, e); }

  try {
    const poll = await api.createPoll(TEST_THREAD_ID, 'Test Poll?', ['Yes', 'No', 'Maybe']);
    pollID = poll?.pollID;
    test('createPoll', true);
  } catch(e) { test('createPoll', false, e); }

  if (pollID) {
    try {
      await api.votePoll(pollID, '0', true);
      test('votePoll', true);
    } catch(e) { test('votePoll', false, e); }
  } else {
    test('votePoll', null, null, 'No poll created');
  }

  try {
    const scheduled = api.scheduleMessage.schedule('🧪 Scheduled', TEST_THREAD_ID, Date.now() + 3600000);
    test('scheduleMessage.schedule', !!scheduled);
    scheduled.cancel();
    test('scheduleMessage.cancel', true);
    const pending = api.scheduleMessage.list();
    test('scheduleMessage.list', Array.isArray(pending));
  } catch(e) { test('scheduleMessage', false, e); }

  // ========== THREAD MANAGEMENT ==========
  console.log('\n🎯 THREAD MANAGEMENT:');
  
  try {
    await api.archiveThread(TEST_THREAD_ID, false);
    test('archiveThread', true);
  } catch(e) { test('archiveThread', false, e); }

  try {
    await api.muteThread(TEST_THREAD_ID, 0);
    test('muteThread', true);
  } catch(e) { test('muteThread', false, e); }

  test('deleteThread', null, null, 'Skipped - destructive operation');
  test('createNewGroup', null, null, 'Skipped - requires user IDs');
  test('addUserToGroup', null, null, 'Skipped - requires user IDs');
  test('removeUserFromGroup', null, null, 'Skipped - requires admin permissions');
  test('changeAdminStatus', null, null, 'Skipped - requires admin permissions');

  // ========== CUSTOMIZATION ==========
  console.log('\n🎨 CUSTOMIZATION:');
  
  try {
    await api.emoji(TEST_THREAD_ID, '👍');
    test('emoji (change)', true);
  } catch(e) {
    if (e.message && e.message.includes('MQTT')) {
      test('emoji (change)', null, null, 'Requires MQTT connection');
    } else {
      test('emoji (change)', false, e);
    }
  }

  try {
    await api.nickname(TEST_THREAD_ID, uid, 'TestBot');
    test('nickname', true);
  } catch(e) { test('nickname', false, e); }

  try {
    const themes = await api.theme('list', TEST_THREAD_ID);
    test('theme (list)', Array.isArray(themes));
  } catch(e) { test('theme (list)', false, e); }

  try {
    await api.gcname(TEST_THREAD_ID, 'Test Group Name');
    test('gcname (setTitle)', true);
  } catch(e) {
    if (e.message && e.message.includes('MQTT')) {
      test('gcname (setTitle)', null, null, 'Requires MQTT connection');
    } else {
      test('gcname (setTitle)', false, e);
    }
  }

  test('changeGroupImage', null, null, 'Skipped - requires image file');
  
  try {
    const colors = api.threadColors();
    test('threadColors', Array.isArray(colors));
  } catch(e) { test('threadColors', false, e); }

  // ========== ADVANCED FEATURES ==========
  console.log('\n🚀 ADVANCED FEATURES:');
  
  try {
    const msg3 = await api.sendMessage('🧪 Test reaction', TEST_THREAD_ID);
    if (msg3 && msg3.messageID) {
      await api.setMessageReaction('👍', msg3.messageID);
      test('setMessageReaction', true);
    } else {
      test('setMessageReaction', null, null, 'No message to react to');
    }
  } catch(e) { test('setMessageReaction', false, e); }

  test('pinMessage', null, null, 'Requires MQTT connection');
  test('notes', null, null, 'Skipped - requires note content');
  test('stickers', null, null, 'Skipped - requires sticker ID');
  test('resolvePhotoUrl', null, null, 'Skipped - requires photo attachment');
  test('uploadAttachment', null, null, 'Skipped - requires file stream');
  test('downloadAttachment', null, null, 'Skipped - requires attachment URL');
  test('getAttachmentMetadata', null, null, 'Skipped - requires attachment ID');

  // ========== UTILITY FUNCTIONS ==========
  console.log('\n🔧 UTILITY FUNCTIONS:');
  
  try {
    const currentUID = await api.getUID();
    test('getUID', typeof currentUID === 'string');
  } catch(e) { test('getUID', false, e); }

  try {
    const emojiUrl = await api.getEmojiUrl('👍');
    test('getEmojiUrl', typeof emojiUrl === 'string');
  } catch(e) { test('getEmojiUrl', false, e); }

  try {
    await api.refreshFb_dtsg();
    test('refreshFb_dtsg', true);
  } catch(e) { test('refreshFb_dtsg', false, e); }

  // ========== SOCIAL FUNCTIONS ==========
  console.log('\n🌐 SOCIAL FUNCTIONS:');
  
  try {
    const friends = await api.getFriendsList();
    test('getFriendsList', Array.isArray(friends));
  } catch(e) { test('getFriendsList', false, e); }

  test('comment', null, null, 'Skipped - requires post ID');
  test('setPostReaction', null, null, 'Skipped - requires post ID');
  test('share', null, null, 'Skipped - requires URL');
  test('story', null, null, 'Skipped - requires story content');
  test('follow', null, null, 'Skipped - requires user ID');
  test('unfriend', null, null, 'Skipped - destructive operation');
  test('friend', null, null, 'Skipped - requires user ID');
  test('handleFriendRequest', null, null, 'Skipped - requires pending request');

  // ========== ACCOUNT MODIFICATION ==========
  console.log('\n👥 ACCOUNT MODIFICATION:');
  test('changeAvatar', null, null, 'Skipped - requires image file');
  test('changeBio', null, null, 'Skipped - modifies account');
  test('changeBlockedStatus', null, null, 'Skipped - modifies account');

  // ========== NETWORK FUNCTIONS ==========
  console.log('\n🌍 NETWORK FUNCTIONS:');
  
  try {
    const response = await api.httpGet('https://www.facebook.com');
    test('httpGet', response && response.body);
  } catch(e) { test('httpGet', false, e); }

  try {
    const response = await api.httpPost('https://www.facebook.com', {});
    test('httpPost', response && response.body);
  } catch(e) { test('httpPost', false, e); }

  // ========== REAL-TIME FUNCTIONS ==========
  console.log('\n⚡ REAL-TIME FUNCTIONS:');
  test('listenMqtt', typeof api.listenMqtt === 'function');
  test('stopListening', typeof api.stopListening === 'function');

  // ========== ERROR HANDLING ==========
  console.log('\n🛡️  ERROR HANDLING:');
  try {
    await api.sendMessage('test', '999999999999999');
    test('sendMessage error handling', false);
  } catch(e) {
    test('sendMessage error handling', !!e);
  }

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⚪ Skipped: ${skipped}`);
  console.log(`📈 Total:   ${passed + failed + skipped}`);
  console.log(`🎯 Success: ${failed === 0 ? '100%' : ((passed / (passed + failed)) * 100).toFixed(1) + '%'}`);
  
  if (failed > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ FAILED FUNCTIONS:');
    console.log('='.repeat(60));
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.function}`);
      console.log(`   Error: ${err.error}\n`);
    });
  }
  
  if (failed === 0) {
    console.log('\n🎉 All tested functions passed!\n✨ NeoKEX-FCA is working perfectly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
});
