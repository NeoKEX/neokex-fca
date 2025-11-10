const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🧪 NeoKEX-FCA Comprehensive Test Suite v3.0.2\n');

const options = {
  selfListen: false,
  listenEvents: false,
  logging: false
};

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, error = null) {
  if (passed) {
    console.log(`✅ ${name}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}`);
    if (error) console.log(`   Error: ${error.message || error}`);
    testsFailed++;
  }
}

login({ appState }, options, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login successful\n');
  const userID = api.getCurrentUserID();
  console.log(`📝 Testing with User ID: ${userID}\n`);

  // Test 1: getUserInfo
  try {
    const userInfo = await api.getUserInfo(userID);
    if (userInfo && userInfo.name && userInfo.id) {
      logTest('getUserInfo', true);
    } else {
      logTest('getUserInfo', false, new Error('User data not found'));
    }
  } catch (e) {
    logTest('getUserInfo', false, e);
  }

  // Test 2: getThreadList
  try {
    const threads = await api.getThreadList(5, null, []);
    if (Array.isArray(threads) && threads.length >= 0) {
      logTest('getThreadList', true);
    } else {
      logTest('getThreadList', false, new Error('Invalid thread list'));
    }
  } catch (e) {
    logTest('getThreadList', false, e);
  }

  // Test 3: getAppState
  try {
    const state = api.getAppState();
    if (Array.isArray(state) && state.length > 0) {
      logTest('getAppState', true);
    } else {
      logTest('getAppState', false, new Error('Invalid app state'));
    }
  } catch (e) {
    logTest('getAppState', false, e);
  }

  // Test 4: getCurrentUserID
  try {
    const id = api.getCurrentUserID();
    if (id && typeof id === 'string') {
      logTest('getCurrentUserID', true);
    } else {
      logTest('getCurrentUserID', false, new Error('Invalid user ID'));
    }
  } catch (e) {
    logTest('getCurrentUserID', false, e);
  }

  // Test 5: getOptions
  try {
    const opts = api.getOptions();
    if (opts && typeof opts === 'object') {
      logTest('getOptions', true);
    } else {
      logTest('getOptions', false, new Error('Invalid options'));
    }
  } catch (e) {
    logTest('getOptions', false, e);
  }

  // Test 6: sendMessage error handling (invalid thread)
  try {
    await api.sendMessage('Test', '999999999999999');
    logTest('sendMessage error handling', false, new Error('Should have thrown error'));
  } catch (e) {
    if (e.errorCode) {
      logTest('sendMessage error handling', true);
    } else {
      logTest('sendMessage error handling', false, new Error('Error missing errorCode'));
    }
  }

  // Test 7: sendMessage to real thread
  try {
    const threads = await api.getThreadList(1, null, []);
    if (threads.length > 0) {
      const result = await api.sendMessage('🧪 Test from NeoKEX-FCA v3.0.2', threads[0].threadID);
      if (result && result.messageID && result.threadID) {
        logTest('sendMessage (real thread)', true);
      } else {
        logTest('sendMessage (real thread)', false, new Error('Invalid response'));
      }
    } else {
      console.log('⚠️  sendMessage (real thread) - skipped (no threads available)');
    }
  } catch (e) {
    logTest('sendMessage (real thread)', false, e);
  }

  // Test 8: getThreadInfo
  try {
    const threads = await api.getThreadList(1, null, []);
    if (threads.length > 0) {
      const info = await api.getThreadInfo(threads[0].threadID);
      if (info && info.threadID) {
        logTest('getThreadInfo', true);
      } else {
        logTest('getThreadInfo', false, new Error('Invalid thread info'));
      }
    } else {
      console.log('⚠️  getThreadInfo - skipped (no threads available)');
    }
  } catch (e) {
    logTest('getThreadInfo', false, e);
  }

  // Test 9: getUserID
  try {
    const threads = await api.getThreadList(1, null, []);
    if (threads.length > 0 && threads[0].participants && threads[0].participants.length > 0) {
      const participant = threads[0].participants[0];
      const id = await api.getUserID(participant.name);
      if (Array.isArray(id) && id.length > 0) {
        logTest('getUserID', true);
      } else {
        logTest('getUserID', false, new Error('Invalid user ID result'));
      }
    } else {
      console.log('⚠️  getUserID - skipped (no participants available)');
    }
  } catch (e) {
    logTest('getUserID', false, e);
  }

  // Test 10: markAsRead
  try {
    const threads = await api.getThreadList(1, null, []);
    if (threads.length > 0) {
      await api.markAsRead(threads[0].threadID);
      logTest('markAsRead', true);
    } else {
      console.log('⚠️  markAsRead - skipped (no threads available)');
    }
  } catch (e) {
    logTest('markAsRead', false, e);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);
  console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Library is ready for npm publishing.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
});
