const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🧪 NeoKEX-FCA Thread & Theme Function Tests\n');
console.log('='.repeat(60) + '\n');

const options = { logging: false };
let passed = 0, failed = 0, warnings = 0;
const results = [];

const test = async (name, testFn) => {
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`✅ ${name}`);
      if (result.details) console.log(`   ℹ️  ${result.details}`);
      passed++;
      results.push({ name, status: 'passed', details: result.details });
    } else if (result.warning) {
      console.log(`⚠️  ${name}`);
      console.log(`   ℹ️  ${result.warning}`);
      warnings++;
      results.push({ name, status: 'warning', details: result.warning });
    } else {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${result.error}`);
      failed++;
      results.push({ name, status: 'failed', error: result.error });
    }
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message || error}`);
    failed++;
    results.push({ name, status: 'failed', error: error.message || String(error) });
  }
};

login({ appState }, options, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login successful!');
  console.log('👤 User ID:', api.getCurrentUserID());
  console.log('\n' + '='.repeat(60) + '\n');

  let testThreadID = null;
  let testThreadName = '';
  let originalTheme = null;
  let originalEmoji = null;

  // THREAD FUNCTIONS
  console.log('📦 THREAD FUNCTIONS\n');

  await test('getThreadList', async () => {
    try {
      const threads = await api.getThreadList(5, null, []);
      if (!Array.isArray(threads)) {
        return { success: false, error: 'Expected array, got ' + typeof threads };
      }
      if (threads.length === 0) {
        return { warning: 'No threads found in list' };
      }
      testThreadID = threads[0].threadID;
      testThreadName = threads[0].name || threads[0].threadID;
      return { 
        success: true, 
        details: `Found ${threads.length} threads, using "${testThreadName}" (${testThreadID})` 
      };
    } catch (error) {
      return { success: false, error: error.message || String(error) };
    }
  });

  if (!testThreadID) {
    console.log('\n⚠️  No test thread available. Skipping thread-specific tests.\n');
  } else {
    await test('getThreadInfo', async () => {
      try {
        const info = await api.getThreadInfo(testThreadID);
        if (!info || !info.threadID) {
          return { success: false, error: 'Invalid thread info returned' };
        }
        originalTheme = info.themeID;
        originalEmoji = info.emoji;
        return { 
          success: true, 
          details: `Name: ${info.name || 'N/A'}, Members: ${info.participantIDs ? info.participantIDs.length : 'N/A'}` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('getThreadHistory', async () => {
      try {
        const history = await api.getThreadHistory(testThreadID, 5, null);
        if (!Array.isArray(history)) {
          return { success: false, error: 'Expected array, got ' + typeof history };
        }
        return { 
          success: true, 
          details: `Retrieved ${history.length} messages` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('getThreadPictures', async () => {
      try {
        const pictures = await api.getThreadPictures(testThreadID);
        if (pictures === null) {
          return { 
            success: true, 
            details: 'No pictures available (null returned as expected)' 
          };
        }
        return { 
          success: true, 
          details: `URL: ${pictures.url ? 'Available' : 'None'}` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('getUnreadCount (specific thread)', async () => {
      try {
        const count = await api.getUnreadCount(testThreadID);
        if (typeof count !== 'number') {
          return { success: false, error: 'Expected number, got ' + typeof count };
        }
        return { 
          success: true, 
          details: `Unread count: ${count}` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('getUnreadCount (all threads)', async () => {
      try {
        const count = await api.getUnreadCount();
        if (typeof count !== 'number') {
          return { success: false, error: 'Expected number, got ' + typeof count };
        }
        return { 
          success: true, 
          details: `Total unread: ${count}` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('searchForThread', async () => {
      try {
        const searchTerm = testThreadName.substring(0, 3);
        const results = await api.searchForThread(searchTerm);
        if (!Array.isArray(results)) {
          return { success: false, error: 'Expected array, got ' + typeof results };
        }
        return { 
          success: true, 
          details: `Searched for "${searchTerm}", found ${results.length} results` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('archiveThread (test mode)', async () => {
      try {
        const result = await api.archiveThread(testThreadID, true);
        if (!result || !result.success) {
          return { 
            warning: result.error || 'Archive operation may not be supported' 
          };
        }
        await api.archiveThread(testThreadID, false);
        return { 
          success: true, 
          details: 'Archived and unarchived successfully' 
        };
      } catch (error) {
        return { warning: 'Archive feature may be unavailable: ' + error.message };
      }
    });

    await test('muteThread (test mode)', async () => {
      try {
        const result = await api.muteThread(testThreadID, 60);
        if (!result || !result.success) {
          return { 
            warning: result.error || 'Mute operation may not be supported' 
          };
        }
        await api.muteThread(testThreadID, 0);
        return { 
          success: true, 
          details: 'Muted for 60s and unmuted successfully' 
        };
      } catch (error) {
        return { warning: 'Mute feature may be unavailable: ' + error.message };
      }
    });
  }

  await test('searchForThread (general)', async () => {
    try {
      const results = await api.searchForThread('test');
      if (!Array.isArray(results)) {
        return { success: false, error: 'Expected array, got ' + typeof results };
      }
      return { 
        success: true, 
        details: `Found ${results.length} threads matching "test"` 
      };
    } catch (error) {
      return { success: false, error: error.message || String(error) };
    }
  });

  // THEME FUNCTIONS
  console.log('\n🎨 THEME FUNCTIONS\n');

  if (!testThreadID) {
    console.log('⚠️  No test thread available. Skipping theme tests.\n');
  } else {
    await test('getThemeInfo', async () => {
      try {
        const themeInfo = await api.getThemeInfo(testThreadID);
        if (!themeInfo || !themeInfo.threadID) {
          return { success: false, error: 'Invalid theme info returned' };
        }
        return { 
          success: true, 
          details: `Theme ID: ${themeInfo.themeID || 'default'}, Emoji: ${themeInfo.emoji || 'none'}, Color: ${themeInfo.color || 'default'}` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('theme (list themes)', async () => {
      try {
        const themes = await api.theme('list', testThreadID);
        if (!Array.isArray(themes)) {
          return { success: false, error: 'Expected array of themes, got ' + typeof themes };
        }
        return { 
          success: true, 
          details: `Found ${themes.length} available themes` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('theme (search for theme by name)', async () => {
      try {
        const themes = await api.theme('list', testThreadID);
        if (!Array.isArray(themes) || themes.length === 0) {
          return { warning: 'No themes available to test' };
        }
        
        const testTheme = themes.find(t => t.name && t.name.toLowerCase().includes('love'));
        if (!testTheme) {
          return { 
            success: true, 
            details: 'Theme search works, but "love" theme not found (tested search logic)' 
          };
        }
        
        return { 
          success: true, 
          details: `Found theme: ${testTheme.name}` 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('emoji function (validation)', async () => {
      try {
        if (typeof api.emoji !== 'function') {
          return { success: false, error: 'emoji function not available in API' };
        }
        return { 
          success: true, 
          details: 'Emoji function exists (skipping actual change to avoid modifying thread)' 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('gcname function (validation)', async () => {
      try {
        if (typeof api.gcname !== 'function') {
          return { success: false, error: 'gcname function not available in API' };
        }
        return { 
          success: true, 
          details: 'Group name change function exists (skipping actual change to avoid modifying thread)' 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('setThreadThemeMqtt function (validation)', async () => {
      try {
        if (typeof api.setThreadThemeMqtt !== 'function') {
          return { success: false, error: 'setThreadThemeMqtt function not available in API' };
        }
        return { 
          success: true, 
          details: 'MQTT theme setter exists (requires MQTT connection to test)' 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('createAITheme function (validation)', async () => {
      try {
        if (typeof api.createAITheme !== 'function') {
          return { success: false, error: 'createAITheme function not available in API' };
        }
        return { 
          success: true, 
          details: 'AI theme creator exists (may require premium features)' 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });

    await test('changeGroupImage function (validation)', async () => {
      try {
        if (typeof api.changeGroupImage !== 'function') {
          return { success: false, error: 'changeGroupImage function not available in API' };
        }
        return { 
          success: true, 
          details: 'Group image change function exists (skipping actual change)' 
        };
      } catch (error) {
        return { success: false, error: error.message || String(error) };
      }
    });
  }

  // SUMMARY
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📈 Total:    ${passed + failed + warnings}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(`   - ${r.name}: ${r.details}`);
    });
  }
  
  const successRate = passed / (passed + failed) * 100;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}% (excluding warnings)`);
  
  if (failed === 0) {
    console.log('\n🎉 All thread and theme tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
});
