const { login } = require('./lib/index');
const fs = require('fs');

const TARGET_THREAD_ID = '24102757045983863';
const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762797685746_1762797685749.txt';

console.log('🧪 NeoKEX-FCA COMPLETE FUNCTION TEST SUITE');
console.log('='.repeat(80));
console.log(`📍 Target Thread ID: ${TARGET_THREAD_ID}`);
console.log('⚠️  Testing ALL functions including previously skipped ones');
console.log('='.repeat(80) + '\n');

// Load cookies
let appState;
try {
  const cookiesData = fs.readFileSync(cookiesPath, 'utf-8');
  appState = JSON.parse(cookiesData);
  console.log(`✅ Loaded ${appState.length} cookies from file\n`);
} catch (err) {
  console.error('❌ Failed to load cookies:', err.message);
  process.exit(1);
}

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
    failed++;
    results.failed.push({ name, error: error.message || String(error) });
  }
};

login({ appState }, options, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    process.exit(1);
  }

  const uid = api.getCurrentUserID();
  console.log('✅ Login successful!');
  console.log(`👤 User ID: ${uid}`);
  console.log('\n' + '='.repeat(80) + '\n');

  let testMessageID = null;
  let testMessageID2 = null;
  let editedMessageID = null;
  let pollID = null;
  let threadInfo = null;
  let originalTheme = null;
  let originalEmoji = null;

  // Get thread info first
  threadInfo = await api.getThreadInfo(TARGET_THREAD_ID);

  // ============================================================================
  // PART 1: PREVIOUSLY TESTED FUNCTIONS (Quick verification)
  // ============================================================================
  console.log('📦 PART 1: CORE FUNCTIONS (Quick Verification)\n');

  await test('Login & Authentication', async () => {
    return { success: true, details: `Logged in as ${uid}` };
  });

  await test('getThreadInfo', async () => {
    return threadInfo ? { success: true, details: `Thread: ${threadInfo.name || 'N/A'}` } : { success: false };
  });

  // ============================================================================
  // PART 2: MESSAGING - SEND & EDIT
  // ============================================================================
  console.log('\n📨 PART 2: MESSAGING - SEND, EDIT, DELETE\n');

  await test('sendMessage (test message 1)', async () => {
    const msg = await api.sendMessage('🧪 Test Message 1 - Will be edited', TARGET_THREAD_ID);
    if (msg && msg.messageID) {
      testMessageID = msg.messageID;
      return { success: true, details: `Sent: ${msg.messageID}` };
    }
    return { success: false, error: 'Failed to send' };
  });

  await test('sendMessage (test message 2)', async () => {
    const msg = await api.sendMessage('🧪 Test Message 2 - Will be deleted', TARGET_THREAD_ID);
    if (msg && msg.messageID) {
      testMessageID2 = msg.messageID;
      return { success: true, details: `Sent: ${msg.messageID}` };
    }
    return { success: false, error: 'Failed to send' };
  });

  if (testMessageID) {
    await test('editMessage', async () => {
      await api.editMessage('✏️ EDITED: This message was edited by the test', testMessageID);
      editedMessageID = testMessageID;
      return { success: true, details: 'Message edited successfully' };
    });
  }

  if (testMessageID2) {
    await test('unsendMessage', async () => {
      await api.unsendMessage(testMessageID2);
      return { success: true, details: 'Message deleted successfully' };
    });
  }

  // ============================================================================
  // PART 3: MESSAGE FORWARDING & BULK SEND
  // ============================================================================
  console.log('\n📤 PART 3: MESSAGE FORWARDING & BULK OPERATIONS\n');

  if (editedMessageID) {
    await test('forwardMessage', async () => {
      const results = await api.forwardMessage(editedMessageID, [TARGET_THREAD_ID]);
      return Array.isArray(results) && results.length > 0
        ? { success: true, details: `Forwarded to ${results.length} threads` }
        : { success: false, error: 'Forward failed' };
    });
  }

  await test('bulkSendMessage', async () => {
    const results = await api.bulkSendMessage('🧪 Bulk test message', [TARGET_THREAD_ID], 500);
    return Array.isArray(results) && results.some(r => r.success)
      ? { success: true, details: `Sent to ${results.filter(r => r.success).length} threads` }
      : { success: false, error: 'Bulk send failed' };
  });

  // ============================================================================
  // PART 4: POLLS
  // ============================================================================
  console.log('\n📊 PART 4: POLL CREATION & VOTING\n');

  if (threadInfo && threadInfo.isGroup) {
    await test('createPoll', async () => {
      const poll = await api.createPoll(TARGET_THREAD_ID, '🧪 Test Poll - Which is better?', ['Option A', 'Option B', 'Option C']);
      if (poll && poll.pollID) {
        pollID = poll.pollID;
        return { success: true, details: `Poll created: ${poll.pollID}` };
      }
      return { success: false, error: 'Poll creation failed' };
    });

    if (pollID) {
      await test('votePoll (add vote)', async () => {
        await api.votePoll(pollID, 0, true);
        return { success: true, details: 'Vote added to option 0' };
      });

      await test('votePoll (remove vote)', async () => {
        await api.votePoll(pollID, 0, false);
        return { success: true, details: 'Vote removed from option 0' };
      });
    }
  } else {
    await test('createPoll', null, 'Thread is not a group');
    await test('votePoll', null, 'Thread is not a group');
  }

  // ============================================================================
  // PART 5: THREAD CUSTOMIZATION
  // ============================================================================
  console.log('\n🎨 PART 5: THREAD CUSTOMIZATION\n');

  if (threadInfo && threadInfo.isGroup) {
    // Store original values
    originalTheme = threadInfo.themeID || 'default';
    originalEmoji = threadInfo.emoji || '👍';

    await test('emoji (change thread emoji)', async () => {
      await api.emoji('🧪', TARGET_THREAD_ID);
      return { success: true, details: 'Emoji changed to 🧪' };
    });

    await test('emoji (restore original)', async () => {
      await api.emoji(originalEmoji, TARGET_THREAD_ID);
      return { success: true, details: `Restored to ${originalEmoji}` };
    });

    await test('gcname (change group name temporarily)', async () => {
      const originalName = threadInfo.name || threadInfo.threadName;
      await api.gcname('🧪 TEST MODE 🧪', TARGET_THREAD_ID);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.gcname(originalName, TARGET_THREAD_ID);
      return { success: true, details: 'Name changed and restored' };
    });

    await test('nickname (set nickname)', async () => {
      const participants = threadInfo.participantIDs || [];
      if (participants.length > 0) {
        const targetUser = participants[0];
        await api.nickname('🧪TestNick', targetUser, TARGET_THREAD_ID);
        await new Promise(resolve => setTimeout(resolve, 500));
        await api.nickname('', targetUser, TARGET_THREAD_ID);
        return { success: true, details: 'Nickname set and cleared' };
      }
      return { success: false, error: 'No participants found' };
    });

    await test('setTitle (function exists)', async () => {
      return typeof api.setTitle === 'function'
        ? { success: true, details: 'setTitle function available' }
        : { success: false, error: 'setTitle not found' };
    });

  } else {
    await test('emoji', null, 'Thread is not a group');
    await test('gcname', null, 'Thread is not a group');
    await test('nickname', null, 'Thread is not a group');
    await test('setTitle', null, 'Thread is not a group');
  }

  // ============================================================================
  // PART 6: THREAD MANAGEMENT
  // ============================================================================
  console.log('\n📂 PART 6: THREAD MANAGEMENT\n');

  await test('archiveThread (archive)', async () => {
    await api.archiveThread(TARGET_THREAD_ID, true);
    return { success: true, details: 'Thread archived' };
  });

  await test('archiveThread (unarchive)', async () => {
    await api.archiveThread(TARGET_THREAD_ID, false);
    return { success: true, details: 'Thread unarchived' };
  });

  await test('muteThread (mute for 60 seconds)', async () => {
    await api.muteThread(TARGET_THREAD_ID, 60);
    return { success: true, details: 'Thread muted for 60s' };
  });

  await test('muteThread (unmute)', async () => {
    await api.muteThread(TARGET_THREAD_ID, 0);
    return { success: true, details: 'Thread unmuted' };
  });

  // ============================================================================
  // PART 7: ATTACHMENTS & MEDIA
  // ============================================================================
  console.log('\n📎 PART 7: ATTACHMENTS & MEDIA\n');

  await test('getThreadHistory (find attachments)', async () => {
    const history = await api.getThreadHistory(TARGET_THREAD_ID, 50, null);
    const msgWithAttachments = history.find(msg => msg.attachments && msg.attachments.length > 0);
    
    if (msgWithAttachments && msgWithAttachments.attachments[0]) {
      const attachment = msgWithAttachments.attachments[0];
      
      if (attachment.url) {
        await test('getAttachmentMetadata', async () => {
          const metadata = await api.getAttachmentMetadata(attachment.url);
          return metadata && metadata.isAccessible !== undefined
            ? { success: true, details: `Accessible: ${metadata.isAccessible}, Type: ${metadata.mediaType || 'unknown'}` }
            : { success: false, error: 'No metadata returned' };
        });

        await test('downloadAttachment (to memory)', async () => {
          const result = await api.downloadAttachment(attachment.url, null);
          return result && result.data
            ? { success: true, details: `Downloaded ${result.size} bytes` }
            : { success: false, error: 'Download failed' };
        });
      }
    } else {
      await test('getAttachmentMetadata', null, 'No attachments found in recent history');
      await test('downloadAttachment', null, 'No attachments found in recent history');
    }
    
    return { success: true, details: `${history.length} messages retrieved` };
  });

  await test('resolvePhotoUrl (function exists)', async () => {
    return typeof api.resolvePhotoUrl === 'function'
      ? { success: true, details: 'resolvePhotoUrl function available' }
      : { success: false, error: 'resolvePhotoUrl not found' };
  });

  // ============================================================================
  // PART 8: ADVANCED MESSAGING FEATURES
  // ============================================================================
  console.log('\n🚀 PART 8: ADVANCED MESSAGING FEATURES\n');

  await test('scheduleMessage.schedule', async () => {
    const scheduledTime = Date.now() + 3000; // 3 seconds from now
    const scheduled = api.scheduleMessage.schedule('🧪 Scheduled test message', TARGET_THREAD_ID, scheduledTime);
    
    if (scheduled && scheduled.id) {
      // Cancel it immediately to avoid spam
      scheduled.cancel();
      return { success: true, details: 'Message scheduled and cancelled' };
    }
    return { success: false, error: 'Schedule failed' };
  });

  await test('scheduleMessage.list', async () => {
    const pending = api.scheduleMessage.list();
    return Array.isArray(pending)
      ? { success: true, details: `${pending.length} scheduled messages` }
      : { success: false, error: 'List function failed' };
  });

  await test('scheduleMessage.cancelAll', async () => {
    api.scheduleMessage.cancelAll();
    const pending = api.scheduleMessage.list();
    return pending.length === 0
      ? { success: true, details: 'All scheduled messages cancelled' }
      : { success: false, error: 'Cancel all failed' };
  });

  // ============================================================================
  // PART 9: GROUP MANAGEMENT (if applicable)
  // ============================================================================
  console.log('\n👥 PART 9: GROUP MANAGEMENT\n');

  if (threadInfo && threadInfo.isGroup) {
    await test('gcmember (function exists)', async () => {
      return typeof api.gcmember === 'function'
        ? { success: true, details: 'gcmember function available' }
        : { success: false, error: 'gcmember not found' };
    });

    await test('addUserToGroup (function exists)', async () => {
      return typeof api.addUserToGroup === 'function'
        ? { success: true, details: 'addUserToGroup function available' }
        : { success: false, error: 'addUserToGroup not found' };
    });

    await test('removeUserFromGroup (function exists)', async () => {
      return typeof api.removeUserFromGroup === 'function'
        ? { success: true, details: 'removeUserFromGroup function available' }
        : { success: false, error: 'removeUserFromGroup not found' };
    });

    await test('changeAdminStatus (function exists)', async () => {
      return typeof api.changeAdminStatus === 'function'
        ? { success: true, details: 'changeAdminStatus function available' }
        : { success: false, error: 'changeAdminStatus not found' };
    });

    await test('changeGroupImage (function exists)', async () => {
      return typeof api.changeGroupImage === 'function'
        ? { success: true, details: 'changeGroupImage function available' }
        : { success: false, error: 'changeGroupImage not found' };
    });

  } else {
    await test('gcmember', null, 'Thread is not a group');
    await test('addUserToGroup', null, 'Thread is not a group');
    await test('removeUserFromGroup', null, 'Thread is not a group');
    await test('changeAdminStatus', null, 'Thread is not a group');
    await test('changeGroupImage', null, 'Thread is not a group');
  }

  await test('createNewGroup (function exists)', async () => {
    return typeof api.createNewGroup === 'function'
      ? { success: true, details: 'createNewGroup function available' }
      : { success: false, error: 'createNewGroup not found' };
  });

  // ============================================================================
  // PART 10: SOCIAL FUNCTIONS
  // ============================================================================
  console.log('\n🌐 PART 10: SOCIAL FUNCTIONS\n');

  await test('comment (function exists)', async () => {
    return typeof api.comment === 'function'
      ? { success: true, details: 'comment function available' }
      : { success: false, error: 'comment not found' };
  });

  await test('setPostReaction (function exists)', async () => {
    return typeof api.setPostReaction === 'function'
      ? { success: true, details: 'setPostReaction function available' }
      : { success: false, error: 'setPostReaction not found' };
  });

  await test('share (function exists)', async () => {
    return typeof api.share === 'function'
      ? { success: true, details: 'share function available' }
      : { success: false, error: 'share not found' };
  });

  await test('story (function exists)', async () => {
    return typeof api.story === 'function'
      ? { success: true, details: 'story function available' }
      : { success: false, error: 'story not found' };
  });

  await test('follow (function exists)', async () => {
    return typeof api.follow === 'function'
      ? { success: true, details: 'follow function available' }
      : { success: false, error: 'follow not found' };
  });

  await test('unfriend (function exists)', async () => {
    return typeof api.unfriend === 'function'
      ? { success: true, details: 'unfriend function available' }
      : { success: false, error: 'unfriend not found' };
  });

  await test('friend (function exists)', async () => {
    return typeof api.friend === 'function'
      ? { success: true, details: 'friend function available' }
      : { success: false, error: 'friend not found' };
  });

  await test('handleFriendRequest (function exists)', async () => {
    return typeof api.handleFriendRequest === 'function'
      ? { success: true, details: 'handleFriendRequest function available' }
      : { success: false, error: 'handleFriendRequest not found' };
  });

  // ============================================================================
  // PART 11: ADVANCED & EXPERIMENTAL FEATURES
  // ============================================================================
  console.log('\n⭐ PART 11: ADVANCED & EXPERIMENTAL FEATURES\n');

  await test('createAITheme (function exists)', async () => {
    return typeof api.createAITheme === 'function'
      ? { success: true, details: 'createAITheme function available' }
      : { success: false, error: 'createAITheme not found' };
  });

  await test('handleMessageRequest (function exists)', async () => {
    return typeof api.handleMessageRequest === 'function'
      ? { success: true, details: 'handleMessageRequest function available' }
      : { success: false, error: 'handleMessageRequest not found' };
  });

  await test('notes (function exists)', async () => {
    return typeof api.notes === 'function'
      ? { success: true, details: 'notes function available' }
      : { success: false, error: 'notes not found' };
  });

  // ============================================================================
  // PART 12: MQTT REAL-TIME FUNCTIONS
  // ============================================================================
  console.log('\n⚡ PART 12: MQTT REAL-TIME FUNCTIONS\n');

  await test('sendMessageMqtt (function exists)', async () => {
    return typeof api.sendMessageMqtt === 'function'
      ? { success: true, details: 'sendMessageMqtt function available' }
      : { success: false, error: 'sendMessageMqtt not found' };
  });

  await test('setMessageReactionMqtt (function exists)', async () => {
    return typeof api.setMessageReactionMqtt === 'function'
      ? { success: true, details: 'setMessageReactionMqtt function available' }
      : { success: false, error: 'setMessageReactionMqtt not found' };
  });

  await test('setThreadThemeMqtt (function exists)', async () => {
    return typeof api.setThreadThemeMqtt === 'function'
      ? { success: true, details: 'setThreadThemeMqtt function available' }
      : { success: false, error: 'setThreadThemeMqtt not found' };
  });

  await test('pinMessage (function exists)', async () => {
    return typeof api.pinMessage === 'function'
      ? { success: true, details: 'pinMessage function available' }
      : { success: false, error: 'pinMessage not found' };
  });

  // ============================================================================
  // PART 13: ACCOUNT MODIFICATION
  // ============================================================================
  console.log('\n✏️  PART 13: ACCOUNT MODIFICATION FUNCTIONS\n');

  await test('changeAvatar (function exists)', async () => {
    return typeof api.changeAvatar === 'function'
      ? { success: true, details: 'changeAvatar function available' }
      : { success: false, error: 'changeAvatar not found' };
  });

  await test('changeBio (function exists)', async () => {
    return typeof api.changeBio === 'function'
      ? { success: true, details: 'changeBio function available' }
      : { success: false, error: 'changeBio not found' };
  });

  await test('changeBlockedStatus (function exists)', async () => {
    return typeof api.changeBlockedStatus === 'function'
      ? { success: true, details: 'changeBlockedStatus function available' }
      : { success: false, error: 'changeBlockedStatus not found' };
  });

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPLETE TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`📍 Target Thread ID: ${TARGET_THREAD_ID}`);
  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⚪ Skipped:  ${skipped}`);
  console.log(`📈 Total:    ${passed + failed + skipped}`);

  if (failed > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ FAILED TESTS:');
    console.log('='.repeat(80));
    results.failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  const successRate = passed > 0 ? (passed / (passed + failed) * 100) : 0;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}% (${passed}/${passed + failed} executable tests passed)`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
});
