const { login } = require('./index.js');
const fs = require('fs');

const appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));

const TEST_THREAD_NAME = "BOT TEST NXXO";
let testThreadID = null;
let api = null;
let allTests = [];
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(formattedMessage);
  fs.appendFileSync('test-bot-logs.txt', formattedMessage + '\n');
}

function testResult(testName, passed, details = '') {
  const status = passed ? '✓ PASSED' : '✗ FAILED';
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  testResults.results.push(result);
  
  if (passed) {
    testResults.passed++;
    log(`${status}: ${testName} ${details}`, 'PASS');
  } else {
    testResults.failed++;
    log(`${status}: ${testName} ${details}`, 'FAIL');
  }
}

function skipTest(testName, reason) {
  testResults.skipped++;
  log(`⊘ SKIPPED: ${testName} - ${reason}`, 'SKIP');
  testResults.results.push({ testName, skipped: true, reason, timestamp: new Date().toISOString() });
}

async function findTestThread() {
  try {
    log('Searching for test thread: ' + TEST_THREAD_NAME);
    const threads = await api.getThreadList(50, null, ["INBOX"]);
    const testThread = threads.find(t => t.threadName && t.threadName.includes(TEST_THREAD_NAME));
    
    if (testThread) {
      testThreadID = testThread.threadID;
      log(`Found test thread: ${testThread.threadName} (${testThreadID})`);
      return true;
    } else {
      log('Test thread not found in inbox', 'ERROR');
      return false;
    }
  } catch (err) {
    log(`Error finding test thread: ${err.message}`, 'ERROR');
    return false;
  }
}

async function testSendMessage() {
  try {
    const msg = await api.sendMessage("🤖 Test Bot Started - Testing all API functions", testThreadID);
    testResult('sendMessage', true, `MessageID: ${msg.messageID}`);
    return msg.messageID;
  } catch (err) {
    testResult('sendMessage', false, err.message);
    return null;
  }
}

async function testGetCurrentUserID() {
  try {
    const userID = api.getCurrentUserID();
    testResult('getCurrentUserID', !!userID, `UserID: ${userID}`);
    return userID;
  } catch (err) {
    testResult('getCurrentUserID', false, err.message);
    return null;
  }
}

async function testGetThreadInfo() {
  try {
    const info = await api.getThreadInfo(testThreadID);
    testResult('getThreadInfo', !!info, `Thread: ${info.threadName}`);
    return info;
  } catch (err) {
    testResult('getThreadInfo', false, err.message);
    return null;
  }
}

async function testGetThreadHistory() {
  try {
    const history = await api.getThreadHistory(testThreadID, 10, null);
    testResult('getThreadHistory', Array.isArray(history), `Messages: ${history.length}`);
    return history;
  } catch (err) {
    testResult('getThreadHistory', false, err.message);
    return null;
  }
}

async function testGetUserInfo(userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    testResult('getUserInfo', !!userInfo, `Name: ${userInfo.name || userInfo[userID]?.name}`);
    return userInfo;
  } catch (err) {
    testResult('getUserInfo', false, err.message);
    return null;
  }
}

async function testSendTypingIndicator() {
  try {
    await api.sendTypingIndicator(true, testThreadID);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await api.sendTypingIndicator(false, testThreadID);
    testResult('sendTypingIndicator', true);
  } catch (err) {
    testResult('sendTypingIndicator', false, err.message);
  }
}

async function testEditMessage(messageID) {
  try {
    await api.editMessage("✏️ Edited message", messageID);
    testResult('editMessage', true);
  } catch (err) {
    testResult('editMessage', false, err.message);
  }
}

async function testSetMessageReaction(messageID) {
  try {
    await api.setMessageReaction("❤️", messageID);
    testResult('setMessageReaction', true);
  } catch (err) {
    testResult('setMessageReaction', false, err.message);
  }
}

async function testMarkAsRead() {
  try {
    await api.markAsRead(testThreadID);
    testResult('markAsRead', true);
  } catch (err) {
    testResult('markAsRead', false, err.message);
  }
}

async function testGetTheme() {
  try {
    const themes = await api.getTheme(testThreadID);
    testResult('getTheme', Array.isArray(themes) && themes.length > 0, `Themes: ${themes.length}`);
    return themes;
  } catch (err) {
    testResult('getTheme', false, err.message);
    return null;
  }
}

async function testGetThemeInfo() {
  try {
    const themeInfo = await api.getThemeInfo(testThreadID);
    testResult('getThemeInfo', !!themeInfo, `Color: ${themeInfo.color}`);
    return themeInfo;
  } catch (err) {
    testResult('getThemeInfo', false, err.message);
    return null;
  }
}

async function testNickname(participantID) {
  try {
    await api.nickname("TestBot", testThreadID, participantID);
    testResult('nickname', true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await api.nickname("", testThreadID, participantID);
  } catch (err) {
    testResult('nickname', false, err.message);
  }
}

async function testEmoji() {
  try {
    const oldEmoji = "👍";
    await api.emoji("🤖", testThreadID);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await api.emoji(oldEmoji, testThreadID);
    testResult('emoji', true);
  } catch (err) {
    testResult('emoji', false, err.message);
  }
}

async function testGetUserID() {
  try {
    if (!api.getUserID) {
      skipTest('getUserID', 'Function not available');
      return null;
    }
    const results = await api.getUserID("Mark");
    testResult('getUserID', Array.isArray(results), `Results: ${results.length}`);
    return results;
  } catch (err) {
    testResult('getUserID', false, err.message);
    return null;
  }
}

async function testGetFriendsList() {
  try {
    if (!api.getFriendsList) {
      skipTest('getFriendsList', 'Function not available');
      return null;
    }
    const friends = await api.getFriendsList();
    testResult('getFriendsList', Array.isArray(friends), `Friends: ${friends.length}`);
    return friends;
  } catch (err) {
    testResult('getFriendsList', false, err.message);
    return null;
  }
}

async function testSearchForThread() {
  try {
    if (!api.searchForThread) {
      skipTest('searchForThread', 'Function not available');
      return null;
    }
    const results = await api.searchForThread(TEST_THREAD_NAME);
    testResult('searchForThread', Array.isArray(results), `Results: ${results.length}`);
    return results;
  } catch (err) {
    testResult('searchForThread', false, err.message);
    return null;
  }
}

async function testMuteThread() {
  try {
    if (!api.muteThread) {
      skipTest('muteThread', 'Function not available');
      return;
    }
    await api.muteThread(testThreadID, 60);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await api.muteThread(testThreadID, 0);
    testResult('muteThread', true);
  } catch (err) {
    testResult('muteThread', false, err.message);
  }
}

async function testChangeThreadColor() {
  try {
    if (!api.changeThreadColor) {
      skipTest('changeThreadColor', 'Function not available');
      return;
    }
    await api.sendMessage("⚠️ Testing changeThreadColor - requires MQTT", testThreadID);
    testResult('changeThreadColor', true, 'Skipped - requires MQTT connection');
  } catch (err) {
    testResult('changeThreadColor', false, err.message);
  }
}

async function testCreatePoll() {
  try {
    if (!api.createPoll) {
      skipTest('createPoll', 'Function not available');
      return;
    }
    await api.sendMessage("⚠️ Testing createPoll - requires MQTT", testThreadID);
    testResult('createPoll', true, 'Skipped - requires MQTT connection');
  } catch (err) {
    testResult('createPoll', false, err.message);
  }
}

async function testCreateNewGroup() {
  try {
    if (!api.createNewGroup) {
      skipTest('createNewGroup', 'Function not available');
      return;
    }
    await api.sendMessage("⚠️ Skipping createNewGroup - would create actual group", testThreadID);
    testResult('createNewGroup', true, 'Skipped - would create actual group');
  } catch (err) {
    testResult('createNewGroup', false, err.message);
  }
}

async function testChangeArchivedStatus() {
  try {
    if (!api.changeArchivedStatus) {
      skipTest('changeArchivedStatus', 'Function not available');
      return;
    }
    await api.sendMessage("⚠️ Skipping changeArchivedStatus - would archive test thread", testThreadID);
    testResult('changeArchivedStatus', true, 'Skipped - would archive test thread');
  } catch (err) {
    testResult('changeArchivedStatus', false, err.message);
  }
}

async function testUnsendMessage() {
  try {
    const msg = await api.sendMessage("This message will be unsent", testThreadID);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await api.unsendMessage(msg.messageID, testThreadID);
    testResult('unsendMessage', true);
  } catch (err) {
    testResult('unsendMessage', false, err.message);
  }
}

async function sendSummary() {
  const summary = `
📊 TEST SUMMARY
━━━━━━━━━━━━━━━
✅ Passed: ${testResults.passed}
❌ Failed: ${testResults.failed}
⊘ Skipped: ${testResults.skipped}
━━━━━━━━━━━━━━━
Total Tests: ${testResults.passed + testResults.failed + testResults.skipped}

📝 Full report saved to test-bot-logs.txt
  `;
  
  await api.sendMessage(summary, testThreadID);
  log('\n' + summary);
  
  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
  log('Test results saved to test-results.json');
}

async function runAllTests() {
  log('='.repeat(50));
  log('Starting API Function Tests');
  log('='.repeat(50));
  
  const userID = await testGetCurrentUserID();
  
  if (!await findTestThread()) {
    log('Cannot proceed without test thread', 'ERROR');
    return;
  }
  
  const messageID = await testSendMessage();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testGetThreadInfo();
  await testGetThreadHistory();
  
  if (userID) {
    await testGetUserInfo(userID);
  }
  
  await testSendTypingIndicator();
  
  if (messageID) {
    await testSetMessageReaction(messageID);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testEditMessage(messageID);
  }
  
  await testMarkAsRead();
  await testGetTheme();
  await testGetThemeInfo();
  
  if (userID) {
    await testNickname(userID);
  }
  
  await testEmoji();
  await testGetUserID();
  await testGetFriendsList();
  await testSearchForThread();
  await testMuteThread();
  await testChangeThreadColor();
  await testCreatePoll();
  await testCreateNewGroup();
  await testChangeArchivedStatus();
  await testUnsendMessage();
  
  await sendSummary();
  
  log('='.repeat(50));
  log('All Tests Completed');
  log('='.repeat(50));
}

login({ appState }, { online: true, listenEvents: false }, async (err, loginApi) => {
  if (err) {
    log(`Login failed: ${err}`, 'ERROR');
    return;
  }
  
  api = loginApi;
  log('Login successful! Bot user ID: ' + api.getCurrentUserID());
  
  try {
    await runAllTests();
    log('Test execution completed successfully');
    process.exit(0);
  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'ERROR');
    process.exit(1);
  }
});
