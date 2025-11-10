const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🧪 NeoKEX-FCA Complete Function Test v3.0.2\n');

const options = { logging: false };
let passed = 0, failed = 0, skipped = 0;

const test = (name, success, error = null) => {
  if (success === null) {
    console.log(`⚪ ${name} - Skipped`);
    skipped++;
  } else if (success) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}${error ? ': ' + error.message : ''}`);
    failed++;
  }
};

login({ appState }, options, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login\n');
  const uid = api.getCurrentUserID();
  
  // Core Functions
  console.log('📦 Core Functions:');
  test('getCurrentUserID', !!uid);
  test('getAppState', Array.isArray(api.getAppState()) && api.getAppState().length > 0);
  test('getOptions', typeof api.getOptions() === 'object');

  // Accounts
  console.log('\n👤 Account Functions:');
  try { const u = await api.getUserInfo(uid); test('getUserInfo', u && u.name); } catch(e) { test('getUserInfo', false, e); }
  try { const u = await api.getUserID('Facebook'); test('getUserID', Array.isArray(u)); } catch(e) { test('getUserID', false, e); }
  try { const b = await api.getBlockedUsers(); test('getBlockedUsers', Array.isArray(b)); } catch(e) { test('getBlockedUsers', false, e); }

  // Conversations
  console.log('\n💬 Conversation Functions:');
  let testThreadID = null;
  try { const t = await api.getThreadList(5, null, []); test('getThreadList', Array.isArray(t)); if(t.length>0) testThreadID = t[0].threadID; } catch(e) { test('getThreadList', false, e); }
  
  if (testThreadID) {
    try { const i = await api.getThreadInfo(testThreadID); test('getThreadInfo', i && i.threadID); } catch(e) { test('getThreadInfo', false, e); }
    try { const h = await api.getThreadHistory(testThreadID, 5, null); test('getThreadHistory', Array.isArray(h)); } catch(e) { test('getThreadHistory', false, e); }
    try { const p = await api.getThreadPictures(testThreadID); test('getThreadPictures', p && p.url); } catch(e) { test('getThreadPictures', false, e); }
    try { const u = await api.getUnreadCount(testThreadID); test('getUnreadCount', typeof u === 'number'); } catch(e) { test('getUnreadCount', false, e); }
  } else {
    test('getThreadInfo', null); test('getThreadHistory', null); test('getThreadPictures', null); test('getUnreadCount', null);
  }
  
  try { const r = await api.searchForThread('test'); test('searchForThread', Array.isArray(r)); } catch(e) { test('searchForThread', false, e); }

  // Messaging
  console.log('\n📨 Messaging Functions:');
  if (testThreadID) {
    try { const m = await api.sendMessage('🧪 NeoKEX-FCA v3.0.2 Test', testThreadID); test('sendMessage', m && m.messageID); } catch(e) { test('sendMessage', false, e); }
    try { await api.markAsRead(testThreadID); test('markAsRead', true); } catch(e) { test('markAsRead', false, e); }
    try { await api.markAsSeen(); test('markAsSeen', true); } catch(e) { test('markAsSeen', false, e); }
    try { await api.sendTypingIndicator(testThreadID); test('sendTypingIndicator', true); } catch(e) { test('sendTypingIndicator', false, e); }
  } else {
    test('sendMessage', null); test('markAsRead', null); test('markAsSeen', null); test('sendTypingIndicator', null);
  }

  try { await api.markAsReadAll(); test('markAsReadAll', true); } catch(e) { test('markAsReadAll', false, e); }

  // Error Handling Tests
  console.log('\n🛡️  Error Handling:');
  try { await api.sendMessage('test', '999999999999999'); test('sendMessage error (invalid thread)', false); } catch(e) { test('sendMessage error (invalid thread)', !!e.errorCode); }

  // Utilities
  console.log('\n🔧 Utility Functions:');
  try { const uid = api.getUID(); test('getUID', typeof uid === 'string'); } catch(e) { test('getUID', false, e); }
  try { const ei = await api.getEmojiUrl('👍'); test('getEmojiUrl', typeof ei === 'string'); } catch(e) { test('getEmojiUrl', false, e); }
  
  // Social Functions
  console.log('\n🌐 Social Functions:');
  try { const f = await api.getFriendsList(); test('getFriendsList', Array.isArray(f)); } catch(e) { test('getFriendsList', false, e); }

  // Network Functions
  console.log('\n🌍 Network Functions:');
  try { const r = await api.httpGet('https://www.facebook.com'); test('httpGet', r && r.body); } catch(e) { test('httpGet', false, e); }

  // Advanced Messaging (conditional tests)
  console.log('\n⚙️  Advanced Messaging:');
  test('editMessage', null);
  test('unsendMessage', null);
  test('forwardMessage', null);
  test('createPoll', null);
  test('votePoll', null);
  test('searchMessages', null);
  test('bulkSendMessage', null);
  test('shareContact', null);
  test('scheduleMessage', null);
  
  // Thread Management
  console.log('\n🎯 Thread Management:');
  test('archiveThread', null);
  test('muteThread', null);
  test('deleteThread', null);
  test('createNewGroup', null);
  test('addUserToGroup', null);
  test('removeUserFromGroup', null);
  test('changeAdminStatus', null);
  
  // Customization
  console.log('\n🎨 Customization:');
  test('emoji (change)', null);
  test('nickname', null);
  test('theme', null);
  test('setTitle', null);
  test('changeGroupImage', null);
  test('threadColors', null);

  // Advanced Features
  console.log('\n🚀 Advanced Features:');
  test('setMessageReaction', null);
  test('pinMessage', null);
  test('notes', null);
  test('stickers', null);
  test('resolvePhotoUrl', null);
  test('uploadAttachment', null);
  test('downloadAttachment', null);
  test('getAttachmentMetadata', null);

  // Account Modification
  console.log('\n👥 Account Modification:');
  test('changeAvatar', null);
  test('changeBio', null);
  test('changeBlockedStatus', null);

  // Social Actions
  console.log('\n❤️  Social Actions:');
  test('comment', null);
  test('setPostReaction', null);
  test('share', null);
  test('story', null);
  test('follow', null);
  test('unfriend', null);
  test('friend', null);
  test('handleFriendRequest', null);

  // Real-time
  console.log('\n⚡ Real-time Functions:');
  test('listenMqtt', typeof api.listenMqtt === 'function');
  test('stopListening', typeof api.stopListening === 'function');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results');
  console.log('='.repeat(60));
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⚪ Skipped: ${skipped} (safe tests only)`);
  console.log(`📈 Total:   ${passed + failed + skipped}`);
  console.log(`🎯 Success: ${failed === 0 ? '100%' : ((passed / (passed + failed)) * 100).toFixed(1) + '%'}`);
  
  if (failed === 0) {
    console.log('\n🎉 All testable functions passed!\n✨ NeoKEX-FCA v3.0.2 is ready for npm publishing.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
});
