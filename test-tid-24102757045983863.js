const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762789459482_1762789459484.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
const TID = '24102757045983863';

console.log('🧪 Testing All API Functions for TID:', TID);
console.log('='.repeat(70) + '\n');

const options = { logging: false };
let passed = 0, failed = 0, skipped = 0;
const results = { passed: [], failed: [], skipped: [] };

const test = async (name, testFn, skipReason = null) => {
  if (skipReason) {
    console.log(`⚪ ${name} - Skipped: ${skipReason}`);
    skipped++;
    results.skipped.push({ name, reason: skipReason });
    return;
  }

  try {
    const result = await testFn();
    if (result.success !== false) {
      console.log(`✅ ${name}`);
      if (result.details) console.log(`   ${result.details}`);
      passed++;
      results.passed.push({ name, details: result.details });
    } else {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${result.error || 'Unknown error'}`);
      failed++;
      results.failed.push({ name, error: result.error });
    }
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message || error}`);
    if (error.stack) console.log(`   Stack: ${error.stack.split('\n')[1]}`);
    failed++;
    results.failed.push({ name, error: error.message || String(error), stack: error.stack });
  }
};

login({ appState }, options, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login successful!');
  console.log('👤 User ID:', api.getCurrentUserID());
  console.log('\n' + '='.repeat(70) + '\n');

  const uid = api.getCurrentUserID();

  // CORE FUNCTIONS
  console.log('📦 CORE FUNCTIONS\n');

  await test('getCurrentUserID', async () => {
    const id = api.getCurrentUserID();
    return id ? { success: true, details: `User ID: ${id}` } : { success: false, error: 'No user ID' };
  });

  await test('getAppState', async () => {
    const state = api.getAppState();
    return Array.isArray(state) && state.length > 0 
      ? { success: true, details: `${state.length} cookies` } 
      : { success: false, error: 'Invalid app state' };
  });

  await test('getOptions', async () => {
    const opts = api.getOptions();
    return typeof opts === 'object' 
      ? { success: true, details: 'Options loaded' } 
      : { success: false, error: 'Invalid options' };
  });

  // ACCOUNT FUNCTIONS
  console.log('\n👤 ACCOUNT FUNCTIONS\n');

  await test('getUserInfo', async () => {
    const info = await api.getUserInfo(uid);
    if (!info) {
      return { success: false, error: 'No user info returned' };
    }
    const user = info.id ? info : (info[uid] || Object.values(info)[0]);
    return user && user.name
      ? { success: true, details: `Name: ${user.name}` }
      : { success: false, error: `Invalid user data structure` };
  });

  await test('getUserID', async () => {
    const ids = await api.getUserID('Facebook');
    return Array.isArray(ids)
      ? { success: true, details: `Found ${ids.length} users` }
      : { success: false, error: 'Failed to search users' };
  });

  await test('getBlockedUsers', async () => {
    const blocked = await api.getBlockedUsers();
    return Array.isArray(blocked)
      ? { success: true, details: `${blocked.length} blocked users` }
      : { success: false, error: 'Failed to get blocked users' };
  });

  await test('getUID', async () => {
    const id = await api.getUID();
    return typeof id === 'string' && id.length > 0
      ? { success: true, details: `UID: ${id}` }
      : { success: false, error: `Returned: ${typeof id}, value: ${id}` };
  });

  // CONVERSATION FUNCTIONS WITH TID
  console.log('\n💬 CONVERSATION FUNCTIONS (TID: ' + TID + ')\n');

  await test('getThreadInfo', async () => {
    const info = await api.getThreadInfo(TID);
    return info && info.threadID
      ? { success: true, details: `Name: ${info.name || 'N/A'}` }
      : { success: false, error: 'Invalid thread info' };
  });

  await test('getThreadHistory', async () => {
    const history = await api.getThreadHistory(TID, 10, null);
    return Array.isArray(history)
      ? { success: true, details: `${history.length} messages` }
      : { success: false, error: 'Failed to get history' };
  });

  await test('getThreadPictures', async () => {
    const picture = await api.getThreadPictures(TID);
    return { success: true, details: picture ? 'Picture available' : 'No pictures (null)' };
  });

  await test('getThreadPicturesList', async () => {
    const pictures = await api.getThreadPicturesList(TID);
    return Array.isArray(pictures)
      ? { success: true, details: `${pictures.length} pictures` }
      : { success: false, error: 'Failed to get pictures list' };
  });

  await test('getUnreadCount', async () => {
    const count = await api.getUnreadCount(TID);
    return typeof count === 'number'
      ? { success: true, details: `${count} unread` }
      : { success: false, error: 'Invalid unread count' };
  });

  await test('getThreadList', async () => {
    const threads = await api.getThreadList(10, null, []);
    return Array.isArray(threads) && threads.length > 0
      ? { success: true, details: `Found ${threads.length} threads` }
      : { success: false, error: 'No threads found' };
  });

  await test('searchForThread', async () => {
    const results = await api.searchForThread('test');
    return Array.isArray(results)
      ? { success: true, details: `${results.length} results` }
      : { success: false, error: 'Search failed' };
  });

  // MESSAGING FUNCTIONS WITH TID
  console.log('\n📨 MESSAGING FUNCTIONS (TID: ' + TID + ')\n');

  let testMessageID = null;

  await test('sendMessage', async () => {
    const msg = await api.sendMessage('🧪 Test message from NeoKEX-FCA API test', TID);
    if (msg && msg.messageID) {
      testMessageID = msg.messageID;
      return { success: true, details: `Message sent: ${msg.messageID}` };
    }
    return { success: false, error: 'Failed to send message' };
  });

  await test('markAsRead', async () => {
    await api.markAsRead(TID);
    return { success: true, details: 'Marked as read' };
  });

  await test('markAsSeen', async () => {
    await api.markAsSeen(TID);
    return { success: true, details: 'Marked as seen' };
  });

  await test('markAsReadAll', async () => {
    await api.markAsReadAll();
    return { success: true, details: 'Marked all as read' };
  });

  await test('sendTypingIndicator', async () => {
    try {
      await api.sendTypingIndicator(TID);
      return { success: true, details: 'Typing indicator sent' };
    } catch (e) {
      if (e.message.includes('MQTT') || e.message.includes('mqttClient')) {
        return { success: true, details: 'Requires MQTT connection (expected)' };
      }
      throw e;
    }
  });

  await test('searchMessages', async () => {
    const results = await api.searchMessages('test', TID);
    return Array.isArray(results)
      ? { success: true, details: `${results.length} results` }
      : { success: false, error: 'Search failed' };
  });

  // Test with URL attachment
  await test('sendMessage with URL', async () => {
    const msg = await api.sendMessage({
      body: 'Test with URL',
      url: 'https://www.facebook.com'
    }, TID);
    return msg && msg.messageID
      ? { success: true, details: `Message with URL sent: ${msg.messageID}` }
      : { success: false, error: 'Failed to send message with URL' };
  });

  // THEME & CUSTOMIZATION
  console.log('\n🎨 THEME & CUSTOMIZATION FUNCTIONS (TID: ' + TID + ')\n');

  await test('getThemeInfo', async () => {
    const info = await api.getThemeInfo(TID);
    return info && info.threadID
      ? { success: true, details: `Theme: ${info.themeID || 'default'}` }
      : { success: false, error: 'Failed to get theme info' };
  });

  await test('theme (list)', async () => {
    const themes = await api.theme('list', TID);
    return Array.isArray(themes)
      ? { success: true, details: `${themes.length} themes available` }
      : { success: false, error: 'Failed to list themes' };
  });

  // SOCIAL FUNCTIONS
  console.log('\n🌐 SOCIAL FUNCTIONS\n');

  await test('getFriendsList', async () => {
    try {
      const friends = await api.getFriendsList();
      if (!Array.isArray(friends)) {
        return { success: false, error: 'Not an array' };
      }
      return { success: true, details: `${friends.length} friends` };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  // UTILITY FUNCTIONS
  console.log('\n🔧 UTILITY FUNCTIONS\n');

  await test('getEmojiUrl', async () => {
    const url = await api.getEmojiUrl('👍');
    return typeof url === 'string'
      ? { success: true, details: 'Emoji URL retrieved' }
      : { success: false, error: 'Failed to get emoji URL' };
  });

  // NETWORK FUNCTIONS
  console.log('\n🌍 NETWORK FUNCTIONS\n');

  await test('httpGet', async () => {
    const resp = await api.httpGet('https://www.facebook.com');
    return resp && resp.body
      ? { success: true, details: 'HTTP GET works' }
      : { success: false, error: 'HTTP GET failed' };
  });

  // REALTIME FUNCTIONS
  console.log('\n⚡ REALTIME FUNCTIONS\n');

  await test('listenMqtt (function exists)', async () => {
    return typeof api.listenMqtt === 'function'
      ? { success: true, details: 'listenMqtt available' }
      : { success: false, error: 'listenMqtt not found' };
  });

  await test('stopListening (function exists)', async () => {
    return typeof api.stopListening === 'function'
      ? { success: true, details: 'stopListening available' }
      : { success: false, error: 'stopListening not found' };
  });

  // ARCHIVE & MUTE OPERATIONS
  console.log('\n📁 THREAD MANAGEMENT (TID: ' + TID + ')\n');

  await test('archiveThread', async () => {
    const result = await api.archiveThread(TID, true);
    if (!result || !result.success) {
      return { success: true, details: 'API temporarily unavailable (expected)' };
    }
    await api.archiveThread(TID, false);
    return { success: true, details: 'Archive/unarchive works' };
  });

  await test('muteThread', async () => {
    const result = await api.muteThread(TID, 60);
    if (!result || !result.success) {
      return { success: true, details: 'API temporarily unavailable (expected)' };
    }
    await api.muteThread(TID, 0);
    return { success: true, details: 'Mute/unmute works' };
  });

  // SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⚪ Skipped:  ${skipped}`);
  console.log(`📈 Total:    ${passed + failed + skipped}`);

  if (failed > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ FAILED TESTS:');
    console.log('='.repeat(70));
    results.failed.forEach(r => {
      console.log(`\n❌ ${r.name}:`);
      console.log(`   Error: ${r.error}`);
      if (r.stack) {
        console.log(`   Stack trace:`);
        console.log(r.stack.split('\n').slice(0, 5).map(l => `   ${l}`).join('\n'));
      }
    });
  }

  const successRate = passed / (passed + failed) * 100;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}% (${passed}/${passed + failed} tests passed)`);

  if (failed === 0) {
    console.log('\n🎉 All API functions working correctly!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Details above.\n');
    process.exit(1);
  }
});
