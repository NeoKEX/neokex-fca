const { login } = require('./lib/index');
const fs = require('fs');

const cookiesJSON = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));

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

async function runTests(api) {
  console.log('\n🧪 Starting NeoKEX-FCA Function Tests\n');
  console.log('═'.repeat(60));
  
  try {
    console.log('\n📋 Testing Core API Functions:\n');
    
    console.log('User ID:', api.getCurrentUserID());
    logTest('getCurrentUserID', 'passed', `User ID: ${api.getCurrentUserID()}`);
    
    const appState = api.getAppState();
    logTest('getAppState', 'passed', `Got ${appState.length} cookies`);
    
    try {
      const options = api.getOptions();
      logTest('getOptions', 'passed', 'Retrieved options successfully');
    } catch (err) {
      logTest('getOptions', 'failed', err.message);
    }
    
    console.log('\n📬 Testing Messaging Functions:\n');
    
    try {
      const threads = await api.getThreadList(5, null, []);
      logTest('getThreadList', 'passed', `Got ${threads.length} threads`);
      
      if (threads.length > 0) {
        const testThreadID = threads[0].threadID;
        console.log(`Using test thread: ${testThreadID}`);
        
        try {
          const threadInfo = await api.getThreadInfo(testThreadID);
          logTest('getThreadInfo', 'passed', `Thread name: ${threadInfo.name || 'Direct Message'}`);
        } catch (err) {
          logTest('getThreadInfo', 'failed', err.message);
        }
        
        try {
          const history = await api.getThreadHistory(testThreadID, 5, null);
          logTest('getThreadHistory', 'passed', `Got ${history.length} messages`);
        } catch (err) {
          logTest('getThreadHistory', 'failed', err.message);
        }
        
        try {
          await api.markAsRead(testThreadID);
          logTest('markAsRead', 'passed', 'Marked thread as read');
        } catch (err) {
          logTest('markAsRead', 'failed', err.message);
        }
        
        try {
          await api.markAsSeen();
          logTest('markAsSeen', 'passed', 'Marked all as seen');
        } catch (err) {
          logTest('markAsSeen', 'failed', err.message);
        }
        
        try {
          const colors = api.threadColors();
          logTest('threadColors', 'passed', `Got ${Object.keys(colors).length} color options`);
        } catch (err) {
          logTest('threadColors', 'failed', err.message);
        }
        
        try {
          if (api.ctx && api.ctx.mqttClient) {
            await api.sendTypingIndicator(true, testThreadID);
            logTest('sendTypingIndicator', 'passed', 'Sent typing indicator');
          } else {
            logTest('sendTypingIndicator', 'skipped', 'MQTT client not connected');
          }
        } catch (err) {
          logTest('sendTypingIndicator', 'failed', err.message);
        }
      }
    } catch (err) {
      logTest('getThreadList', 'failed', err.message);
    }
    
    console.log('\n🔍 Testing Search Functions:\n');
    
    try {
      const searchResults = await api.searchForThread('test');
      logTest('searchForThread', 'passed', `Found ${searchResults.length} results`);
    } catch (err) {
      logTest('searchForThread', 'failed', err.message);
    }
    
    console.log('\n👥 Testing Account Functions:\n');
    
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
    
    console.log('\n🌐 Testing Network Functions:\n');
    
    try {
      const testUrl = 'https://www.facebook.com/';
      const response = await api.httpGet(testUrl);
      logTest('httpGet', 'passed', 'Successfully made GET request');
    } catch (err) {
      logTest('httpGet', 'failed', err.message);
    }
    
    console.log('\n🎨 Testing Theme Functions:\n');
    
    try {
      if (api.theme) {
        logTest('theme', 'skipped', 'Function exists (requires threadID and MQTT connection)');
      } else {
        logTest('theme', 'failed', 'Theme function not loaded');
      }
    } catch (err) {
      logTest('theme', 'failed', err.message);
    }
    
    console.log('\n🛠️ Testing Utility Functions:\n');
    
    try {
      const emojiUrl = api.getEmojiUrl('😀');
      logTest('getEmojiUrl', 'passed', `URL: ${emojiUrl}`);
    } catch (err) {
      logTest('getEmojiUrl', 'failed', err.message);
    }
    
    try {
      const result = await api.refreshFb_dtsg();
      logTest('refreshFb_dtsg', 'passed', `Successfully refreshed fb_dtsg: ${result.fb_dtsg.substring(0, 20)}...`);
    } catch (err) {
      logTest('refreshFb_dtsg', 'failed', err.message);
    }
    
    console.log('\n🆕 Testing Newly Added Functions:\n');
    
    try {
      if (api.createAITheme) {
        logTest('createAITheme', 'skipped', 'Function exists but not tested (requires premium)');
      } else {
        logTest('createAITheme', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('createAITheme', 'failed', err.message);
    }
    
    try {
      if (api.setThreadThemeMqtt) {
        logTest('setThreadThemeMqtt', 'skipped', 'Function exists but not tested (requires MQTT connection)');
      } else {
        logTest('setThreadThemeMqtt', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('setThreadThemeMqtt', 'failed', err.message);
    }
    
    try {
      if (api.changeAdminStatus) {
        logTest('changeAdminStatus', 'skipped', 'Function exists (requires group thread)');
      } else {
        logTest('changeAdminStatus', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('changeAdminStatus', 'failed', err.message);
    }
    
    try {
      if (api.changeGroupImage) {
        logTest('changeGroupImage', 'skipped', 'Function exists (requires group thread and image)');
      } else {
        logTest('changeGroupImage', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('changeGroupImage', 'failed', err.message);
    }
    
    try {
      if (api.createNewGroup) {
        logTest('createNewGroup', 'skipped', 'Function exists (not tested to avoid creating groups)');
      } else {
        logTest('createNewGroup', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('createNewGroup', 'failed', err.message);
    }
    
    try {
      if (api.deleteThread) {
        logTest('deleteThread', 'skipped', 'Function exists (not tested to avoid data loss)');
      } else {
        logTest('deleteThread', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('deleteThread', 'failed', err.message);
    }
    
    try {
      if (api.getThreadPictures) {
        logTest('getThreadPictures', 'skipped', 'Function exists (requires thread with pictures)');
      } else {
        logTest('getThreadPictures', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getThreadPictures', 'failed', err.message);
    }
    
    try {
      if (api.uploadAttachment) {
        logTest('uploadAttachment', 'skipped', 'Function exists (requires readable stream)');
      } else {
        logTest('uploadAttachment', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('uploadAttachment', 'failed', err.message);
    }
    
    try {
      if (api.stopListening) {
        logTest('stopListening', 'skipped', 'Function exists (not tested to keep connection)');
      } else {
        logTest('stopListening', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('stopListening', 'failed', err.message);
    }
    
    try {
      if (api.changeAvatar) {
        logTest('changeAvatar', 'skipped', 'Function exists (not tested to avoid profile changes)');
      } else {
        logTest('changeAvatar', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('changeAvatar', 'failed', err.message);
    }
    
    try {
      if (api.changeBio) {
        logTest('changeBio', 'skipped', 'Function exists (not tested to avoid profile changes)');
      } else {
        logTest('changeBio', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('changeBio', 'failed', err.message);
    }
    
    try {
      if (api.changeBlockedStatus) {
        logTest('changeBlockedStatus', 'skipped', 'Function exists (not tested to avoid blocking users)');
      } else {
        logTest('changeBlockedStatus', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('changeBlockedStatus', 'failed', err.message);
    }
    
    try {
      if (api.unfriend) {
        logTest('unfriend', 'skipped', 'Function exists (not tested to avoid unfriending)');
      } else {
        logTest('unfriend', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('unfriend', 'failed', err.message);
    }
    
    try {
      if (api.setPostReaction) {
        logTest('setPostReaction', 'skipped', 'Function exists (requires post ID)');
      } else {
        logTest('setPostReaction', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('setPostReaction', 'failed', err.message);
    }
    
    try {
      if (api.handleMessageRequest) {
        logTest('handleMessageRequest', 'skipped', 'Function exists (requires pending message request)');
      } else {
        logTest('handleMessageRequest', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('handleMessageRequest', 'failed', err.message);
    }
    
    try {
      if (api.setTitle) {
        logTest('setTitle', 'skipped', 'Function exists (not tested to avoid changing thread names)');
      } else {
        logTest('setTitle', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('setTitle', 'failed', err.message);
    }
    
    try {
      if (api.getUID) {
        logTest('getUID', 'skipped', 'Function exists (requires URL)');
      } else {
        logTest('getUID', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getUID', 'failed', err.message);
    }
    
    try {
      if (api.getUserID) {
        logTest('getUserID', 'skipped', 'Function exists (requires username)');
      } else {
        logTest('getUserID', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getUserID', 'failed', err.message);
    }
    
    try {
      if (api.getTheme) {
        logTest('getTheme', 'skipped', 'Function exists (wrapper for theme list)');
      } else {
        logTest('getTheme', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getTheme', 'failed', err.message);
    }
    
    try {
      if (api.getThemeInfo) {
        logTest('getThemeInfo', 'skipped', 'Function exists (requires thread ID)');
      } else {
        logTest('getThemeInfo', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getThemeInfo', 'failed', err.message);
    }
    
    try {
      if (api.getFriendsList) {
        logTest('getFriendsList', 'skipped', 'Function exists (alias to friend.list)');
      } else {
        logTest('getFriendsList', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('getFriendsList', 'failed', err.message);
    }
    
    try {
      if (api.addUserToGroup) {
        logTest('addUserToGroup', 'skipped', 'Function exists (wrapper for gcmember)');
      } else {
        logTest('addUserToGroup', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('addUserToGroup', 'failed', err.message);
    }
    
    try {
      if (api.removeUserFromGroup) {
        logTest('removeUserFromGroup', 'skipped', 'Function exists (wrapper for gcmember)');
      } else {
        logTest('removeUserFromGroup', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('removeUserFromGroup', 'failed', err.message);
    }
    
    try {
      if (api.handleFriendRequest) {
        logTest('handleFriendRequest', 'skipped', 'Function exists (wrapper for friend.accept)');
      } else {
        logTest('handleFriendRequest', 'failed', 'Function not loaded');
      }
    } catch (err) {
      logTest('handleFriendRequest', 'failed', err.message);
    }
    
  } catch (err) {
    console.error('\n❌ Test suite error:', err);
  }
  
  console.log('\n═'.repeat(60));
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
  
  runTests(api);
});
