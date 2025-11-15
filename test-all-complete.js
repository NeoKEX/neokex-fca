const { login } = require('./src/engine/client');
const fs = require('fs');

const TEST_THREAD_ID = '1452334112548569';
const TEST_THREAD_NAME = 'BOT TEST NXXO';

let api;
const results = { passed: 0, failed: 0, details: [] };

function log(test, status, details = '') {
  const timestamp = new Date().toISOString();
  const symbol = status ? '✅' : '❌';
  const message = `[${timestamp}] ${symbol} ${test}: ${details}`;
  console.log(message);
  
  if (status) results.passed++;
  else results.failed++;
  
  results.details.push({ test, status, details, timestamp });
}

async function runTests() {
  console.log('\n🚀 COMPLETE API TEST - NO SKIPPING\n');
  
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
  
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    const userID = api.getCurrentUserID();
    log('getCurrentUserID', !!userID, userID);
    
    const msg = await api.sendMessage('🧪 Testing all API functions', TEST_THREAD_ID);
    log('sendMessage', !!msg.messageID, msg.messageID);
    await sleep(1000);
    
    const threadInfo = await api.getThreadInfo(TEST_THREAD_ID);
    log('getThreadInfo', !!threadInfo, threadInfo.threadName);
    
    const history = await api.getThreadHistory(TEST_THREAD_ID, 10);
    log('getThreadHistory', Array.isArray(history), `${history.length} messages`);
    
    const userInfo = await api.getUserInfo(userID);
    log('getUserInfo', !!userInfo, userInfo.name || userInfo[userID]?.name);
    
    await api.sendTypingIndicator(TEST_THREAD_ID, true);
    await sleep(2000);
    await api.sendTypingIndicator(TEST_THREAD_ID, false);
    log('sendTypingIndicator', true);
    
    if (msg.messageID) {
      await api.setMessageReaction('❤️', msg.messageID);
      log('setMessageReaction', true);
      await sleep(1000);
      
      await api.editMessage('✏️ Edited message', msg.messageID);
      log('editMessage', true);
    }
    
    await api.markAsRead(TEST_THREAD_ID);
    log('markAsRead', true);
    
    const themes = await api.getTheme(TEST_THREAD_ID);
    log('getTheme', Array.isArray(themes), `${themes.length} themes`);
    
    const themeInfo = await api.getThemeInfo(TEST_THREAD_ID);
    log('getThemeInfo', !!themeInfo, themeInfo.color);
    
    await api.nickname('🤖 Bot Test', TEST_THREAD_ID, userID);
    log('nickname', true);
    await sleep(1000);
    await api.nickname('', TEST_THREAD_ID, userID);
    
    await api.emoji('🔥', TEST_THREAD_ID);
    log('emoji', true);
    await sleep(1000);
    await api.emoji('👍', TEST_THREAD_ID);
    
  } catch (err) {
    log('Basic Tests', false, err.message);
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
  
  try {
    const results = await api.searchForThread(TEST_THREAD_NAME);
    log('searchForThread', Array.isArray(results), `${results.length} results`);
  } catch (err) {
    log('searchForThread', false, err.message);
  }
  
  try {
    await api.muteThread(TEST_THREAD_ID, 60);
    await sleep(1000);
    await api.muteThread(TEST_THREAD_ID, 0);
    log('muteThread', true);
  } catch (err) {
    log('muteThread', false, err.message);
  }
  
  try {
    await api.changeThreadColor('#FF0000', TEST_THREAD_ID);
    await sleep(2000);
    log('changeThreadColor', true, 'Changed to red');
    await api.changeThreadColor('#0084FF', TEST_THREAD_ID);
    await sleep(2000);
    log('changeThreadColor (reset)', true, 'Back to blue');
  } catch (err) {
    log('changeThreadColor', false, err.message);
  }
  
  try {
    const pollMsg = await api.createPoll(TEST_THREAD_ID, 'Test Poll?', ['Option 1', 'Option 2']);
    log('createPoll', !!pollMsg, 'Poll created');
  } catch (err) {
    log('createPoll', false, err.message);
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
    const msg = await api.sendMessage('Message to delete', TEST_THREAD_ID);
    await sleep(1000);
    await api.unsendMessage(msg.messageID, TEST_THREAD_ID);
    log('unsendMessage', true);
  } catch (err) {
    log('unsendMessage', false, err.message);
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
    const msg = await api.sendMessage('Message to delete via API', TEST_THREAD_ID);
    await sleep(1000);
    await api.deleteMessage(msg.messageID);
    log('deleteMessage', true);
  } catch (err) {
    log('deleteMessage', false, err.message);
  }
  
  try {
    const pictures = await api.getThreadPictures(TEST_THREAD_ID, 0, 5);
    log('getThreadPictures', true, `Retrieved ${pictures?.length || 0} pictures`);
  } catch (err) {
    log('getThreadPictures', false, err.message);
  }
  
  try {
    const currentUserID = api.getCurrentUserID();
    await api.changeBlockedStatus(currentUserID, true);
    await sleep(1000);
    log('changeBlockedStatus (block)', true);
    await api.changeBlockedStatus(currentUserID, false);
    await sleep(1000);
    log('changeBlockedStatus (unblock)', true);
  } catch (err) {
    log('changeBlockedStatus', false, err.message);
  }
  
  try {
    await api.handleMessageRequest(TEST_THREAD_ID, true);
    log('handleMessageRequest', true);
  } catch (err) {
    log('handleMessageRequest', false, err.message);
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`\n📊 RESULTS: ${results.passed} passed, ${results.failed} failed\n`);
  
  fs.writeFileSync('complete-test-results.json', JSON.stringify(results, null, 2));
  console.log('✓ Results saved to complete-test-results.json\n');
  
  process.exit(0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
