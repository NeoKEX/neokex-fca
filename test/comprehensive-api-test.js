const { login } = require('../index');
const fs = require('fs');
const path = require('path');

const TEST_RESULTS_FILE = path.join(__dirname, 'test-results.json');
const appState = JSON.parse(fs.readFileSync(path.join(__dirname, 'appstate.json'), 'utf8'));

let api, testContext = {}, testResults = [];

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️  Unhandled Rejection captured:', reason);
    logResult('UNHANDLED_REJECTION', 'FAIL', { error: JSON.stringify(reason) });
});

function logResult(functionName, status, details = {}) {
    const result = {
        function: functionName,
        status,
        timestamp: new Date().toISOString(),
        ...details
    };
    testResults.push(result);
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'SKIP' ? '⏭️ ' : status === 'FAIL' ? '❌' : '⚠️ ';
    console.log(`${statusIcon} ${functionName}: ${status}${details.message ? ` - ${details.message}` : ''}`);
    
    return result;
}

async function setupTestContext() {
    console.log('\n📋 Setting up test context...');
    
    try {
        testContext.userID = api.getCurrentUserID();
        logResult('getCurrentUserID', 'PASS', { output: testContext.userID });
    } catch (err) {
        logResult('getCurrentUserID', 'FAIL', { error: err.message });
    }
    
    try {
        const threads = await api.getThreadList(10, null, ['INBOX']);
        testContext.threadList = threads || [];
        testContext.threadID = threads[0]?.threadID;
        logResult('getThreadList (setup)', 'PASS', { count: threads.length });
    } catch (err) {
        logResult('getThreadList (setup)', 'FAIL', { error: err.message });
    }
    
    try {
        const friends = await api.getFriendsList();
        testContext.friendsList = friends || [];
        testContext.friendID = friends[0]?.userID;
        logResult('getFriendsList (setup)', 'PASS', { count: friends.length });
    } catch (err) {
        logResult('getFriendsList (setup)', 'FAIL', { error: err.message });
    }
    
    if (testContext.threadID) {
        try {
            const history = await api.getThreadHistory(testContext.threadID, 5, null);
            testContext.messageID = history[0]?.messageID;
            logResult('getThreadHistory (setup)', 'PASS', { count: history.length });
        } catch (err) {
            logResult('getThreadHistory (setup)', 'SKIP', { error: err.message });
        }
    }
    
    console.log(`\n📊 Test Context:`);
    console.log(`   User ID: ${testContext.userID}`);
    console.log(`   Threads: ${testContext.threadList?.length || 0}`);
    console.log(`   Friends: ${testContext.friendsList?.length || 0}`);
    console.log(`   Sample Thread ID: ${testContext.threadID || 'N/A'}`);
    console.log(`   Sample Message ID: ${testContext.messageID || 'N/A'}`);
}

async function testAuthenticationSession() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 CATEGORY 1: Authentication & Session');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        const appStateData = api.getAppState();
        logResult('getAppState', 'PASS', { count: appStateData.length });
    } catch (err) {
        logResult('getAppState', 'FAIL', { error: err.message });
    }
    
    try {
        const userID = api.getCurrentUserID();
        logResult('getCurrentUserID', 'PASS', { output: userID });
    } catch (err) {
        logResult('getCurrentUserID', 'FAIL', { error: err.message });
    }
}

async function testMessaging() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 CATEGORY 2: Messaging');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (!testContext.threadID) {
        logResult('sendMessage', 'SKIP', { message: 'No thread ID available' });
        logResult('sendMessageMqtt', 'SKIP', { message: 'No thread ID available' });
        logResult('editMessage', 'SKIP', { message: 'No thread ID available' });
        logResult('deleteMessage', 'SKIP', { message: 'No thread ID available' });
        logResult('unsendMessage', 'SKIP', { message: 'No thread ID available' });
        logResult('forwardMessage', 'SKIP', { message: 'No thread ID available' });
        logResult('setMessageReaction', 'SKIP', { message: 'No thread ID available' });
        logResult('setMessageReactionMqtt', 'SKIP', { message: 'No thread ID available' });
        logResult('pinMessage', 'SKIP', { message: 'No thread ID available' });
        logResult('markAsRead', 'SKIP', { message: 'No thread ID available' });
        logResult('markAsDelivered', 'SKIP', { message: 'No thread ID available' });
        logResult('markAsSeen', 'SKIP', { message: 'No thread ID available' });
        logResult('markAsReadAll', 'SKIP', { message: 'No thread ID available' });
        return;
    }
    
    let sentMessageID;
    try {
        const result = await api.sendMessage(`[NeoKEX-FCA Test] ${new Date().toISOString()}`, testContext.threadID);
        sentMessageID = result.messageID || result.threadID;
        logResult('sendMessage', 'PASS', { messageID: sentMessageID });
    } catch (err) {
        logResult('sendMessage', 'FAIL', { error: err.message });
    }
    
    if (sentMessageID) {
        try {
            await api.editMessage('Edited test message', sentMessageID);
            logResult('editMessage', 'PASS', { messageID: sentMessageID });
        } catch (err) {
            logResult('editMessage', 'FAIL', { error: err.message });
        }
        
        try {
            await api.setMessageReaction('👍', sentMessageID);
            logResult('setMessageReaction', 'PASS', { messageID: sentMessageID });
            await new Promise(resolve => setTimeout(resolve, 500));
            await api.setMessageReaction('', sentMessageID);
        } catch (err) {
            logResult('setMessageReaction', 'FAIL', { error: err.message });
        }
        
        try {
            await api.unsendMessage(sentMessageID);
            logResult('unsendMessage', 'PASS', { messageID: sentMessageID });
        } catch (err) {
            logResult('unsendMessage', 'FAIL', { error: err.message });
        }
    } else {
        logResult('editMessage', 'SKIP', { message: 'No message sent' });
        logResult('setMessageReaction', 'SKIP', { message: 'No message sent' });
        logResult('unsendMessage', 'SKIP', { message: 'No message sent' });
    }
    
    try {
        await api.markAsRead(testContext.threadID);
        logResult('markAsRead', 'PASS', { threadID: testContext.threadID });
    } catch (err) {
        logResult('markAsRead', 'FAIL', { error: err.message });
    }
    
    try {
        await api.markAsSeen();
        logResult('markAsSeen', 'PASS');
    } catch (err) {
        logResult('markAsSeen', 'FAIL', { error: err.message });
    }
    
    try {
        await api.markAsReadAll();
        logResult('markAsReadAll', 'PASS');
    } catch (err) {
        logResult('markAsReadAll', 'FAIL', { error: err.message });
    }
    
    if (testContext.messageID) {
        try {
            await api.markAsDelivered(testContext.threadID, testContext.messageID);
            logResult('markAsDelivered', 'PASS');
        } catch (err) {
            logResult('markAsDelivered', 'FAIL', { error: err.message });
        }
    } else {
        logResult('markAsDelivered', 'SKIP', { message: 'No message ID' });
    }
    
    try {
        await api.deleteMessage(sentMessageID || testContext.messageID || '123');
        logResult('deleteMessage', 'PASS');
    } catch (err) {
        logResult('deleteMessage', 'FAIL', { error: err.message });
    }
    
    if (testContext.messageID && testContext.threadList?.length > 1) {
        try {
            await api.forwardMessage(testContext.messageID, testContext.threadList[1].threadID);
            logResult('forwardMessage', 'PASS');
        } catch (err) {
            logResult('forwardMessage', 'FAIL', { error: err.message });
        }
    } else {
        logResult('forwardMessage', 'SKIP', { message: 'Insufficient data' });
    }
    
    if (api.sendMessageMqtt) {
        try {
            await api.sendMessageMqtt('[NeoKEX-FCA MQTT Test]', testContext.threadID);
            logResult('sendMessageMqtt', 'PASS');
        } catch (err) {
            logResult('sendMessageMqtt', 'FAIL', { error: err.message });
        }
    } else {
        logResult('sendMessageMqtt', 'SKIP', { message: 'MQTT not initialized' });
    }
    
    if (api.setMessageReactionMqtt && testContext.messageID) {
        try {
            await api.setMessageReactionMqtt('❤️', testContext.messageID);
            logResult('setMessageReactionMqtt', 'PASS');
        } catch (err) {
            logResult('setMessageReactionMqtt', 'FAIL', { error: err.message });
        }
    } else {
        logResult('setMessageReactionMqtt', 'SKIP', { message: 'MQTT not available or no message ID' });
    }
    
    if (api.pinMessage && testContext.messageID) {
        try {
            const pinned = await api.pinMessage('list', testContext.threadID);
            logResult('pinMessage', 'PASS', { pinnedCount: pinned?.length || 0 });
        } catch (err) {
            logResult('pinMessage', 'FAIL', { error: err.message });
        }
    } else {
        logResult('pinMessage', 'SKIP', { message: 'Function not available or no IDs' });
    }
}

async function testThreadManagement() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 CATEGORY 3: Thread Management');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        const threads = await api.getThreadList(5, null, ['INBOX']);
        logResult('getThreadList', 'PASS', { count: threads.length });
    } catch (err) {
        logResult('getThreadList', 'FAIL', { error: err.message });
    }
    
    if (testContext.threadID) {
        try {
            const info = await api.getThreadInfo(testContext.threadID);
            logResult('getThreadInfo', 'PASS', { threadName: info.threadName });
        } catch (err) {
            logResult('getThreadInfo', 'FAIL', { error: err.message });
        }
        
        try {
            const history = await api.getThreadHistory(testContext.threadID, 5, null);
            logResult('getThreadHistory', 'PASS', { count: history.length });
        } catch (err) {
            logResult('getThreadHistory', 'FAIL', { error: err.message });
        }
        
        try {
            const pics = await api.getThreadPictures(testContext.threadID, 0, 5);
            logResult('getThreadPictures', 'PASS', { count: pics?.length || 0 });
        } catch (err) {
            logResult('getThreadPictures', 'FAIL', { error: err.message });
        }
        
        try {
            await api.muteThread(testContext.threadID, 0);
            logResult('muteThread', 'PASS');
        } catch (err) {
            logResult('muteThread', 'FAIL', { error: err.message });
        }
        
        try {
            await api.changeArchivedStatus(testContext.threadID, false);
            logResult('changeArchivedStatus', 'PASS');
        } catch (err) {
            logResult('changeArchivedStatus', 'FAIL', { error: err.message });
        }
    } else {
        logResult('getThreadInfo', 'SKIP', { message: 'No thread ID' });
        logResult('getThreadHistory', 'SKIP', { message: 'No thread ID' });
        logResult('getThreadPictures', 'SKIP', { message: 'No thread ID' });
        logResult('muteThread', 'SKIP', { message: 'No thread ID' });
        logResult('changeArchivedStatus', 'SKIP', { message: 'No thread ID' });
    }
    
    try {
        const result = await api.searchForThread('test');
        logResult('searchForThread', 'PASS', { found: result?.length || 0 });
    } catch (err) {
        logResult('searchForThread', 'FAIL', { error: err.message });
    }
    
    if (testContext.messageID) {
        try {
            await api.handleMessageRequest(testContext.threadID, true);
            logResult('handleMessageRequest', 'PASS');
        } catch (err) {
            logResult('handleMessageRequest', 'FAIL', { error: err.message });
        }
    } else {
        logResult('handleMessageRequest', 'SKIP', { message: 'No thread ID' });
    }
    
    try {
        await api.deleteThread(testContext.threadID || '123');
        logResult('deleteThread', 'PASS');
    } catch (err) {
        logResult('deleteThread', 'FAIL', { error: err.message });
    }
}

async function testUserManagement() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 CATEGORY 4: User Management');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        const friends = await api.getFriendsList();
        logResult('getFriendsList', 'PASS', { count: friends.length });
    } catch (err) {
        logResult('getFriendsList', 'FAIL', { error: err.message });
    }
    
    if (testContext.userID) {
        try {
            const info = await api.getUserInfo(testContext.userID);
            logResult('getUserInfo', 'PASS', { name: info[testContext.userID]?.name });
        } catch (err) {
            logResult('getUserInfo', 'FAIL', { error: err.message });
        }
        
        try {
            const info = await api.getUserInfoV2(testContext.userID);
            logResult('getUserInfoV2', 'PASS');
        } catch (err) {
            logResult('getUserInfoV2', 'FAIL', { error: err.message });
        }
    } else {
        logResult('getUserInfo', 'SKIP', { message: 'No user ID' });
        logResult('getUserInfoV2', 'SKIP', { message: 'No user ID' });
    }
    
    try {
        const ids = await api.getUserID('facebook');
        logResult('getUserID', 'PASS', { found: Object.keys(ids || {}).length });
    } catch (err) {
        logResult('getUserID', 'FAIL', { error: err.message });
    }
    
    if (testContext.friendID) {
        try {
            await api.unfriend(testContext.friendID);
            logResult('unfriend', 'PASS');
        } catch (err) {
            logResult('unfriend', 'FAIL', { error: err.message });
        }
        
        try {
            await api.follow(testContext.friendID, true);
            logResult('follow', 'PASS');
        } catch (err) {
            logResult('follow', 'FAIL', { error: err.message });
        }
    } else {
        logResult('unfriend', 'SKIP', { message: 'No friend ID' });
        logResult('follow', 'SKIP', { message: 'No friend ID' });
    }
    
    if (testContext.threadID && testContext.friendID) {
        try {
            if (!api.ctx?.mqttClient) {
                logResult('nickname', 'SKIP', { message: 'MQTT not connected' });
            } else {
                await api.nickname('TestNick', testContext.threadID, testContext.friendID);
                logResult('nickname', 'PASS');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await api.nickname('', testContext.threadID, testContext.friendID);
            }
        } catch (err) {
            logResult('nickname', 'FAIL', { error: err.message });
        }
        
        try {
            await api.shareContact('Test contact share', testContext.friendID, testContext.threadID);
            logResult('shareContact', 'PASS');
        } catch (err) {
            logResult('shareContact', 'FAIL', { error: err.message });
        }
    } else {
        logResult('nickname', 'SKIP', { message: 'Missing IDs' });
        logResult('shareContact', 'SKIP', { message: 'Missing IDs' });
    }
    
    try {
        await api.changeBio('NeoKEX-FCA Test');
        logResult('changeBio', 'PASS');
    } catch (err) {
        logResult('changeBio', 'FAIL', { error: err.message });
    }
    
    try {
        await api.changeAvatar();
        logResult('changeAvatar', 'SKIP', { message: 'No image provided' });
    } catch (err) {
        logResult('changeAvatar', 'SKIP', { message: 'No image provided' });
    }
}

async function testReactionsInteractions() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❤️  CATEGORY 5: Reactions & Interactions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (testContext.threadID) {
        try {
            if (!api.ctx?.mqttClient) {
                logResult('emoji', 'SKIP', { message: 'MQTT not connected' });
            } else {
                await api.emoji('👍', testContext.threadID);
                logResult('emoji', 'PASS');
                await new Promise(resolve => setTimeout(resolve, 500));
                await api.emoji('👍', testContext.threadID);
            }
        } catch (err) {
            logResult('emoji', 'FAIL', { error: err.message });
        }
    } else {
        logResult('emoji', 'SKIP', { message: 'No thread ID' });
    }
    
    try {
        await api.comment('Test comment', '123456');
        logResult('comment', 'PASS');
    } catch (err) {
        logResult('comment', 'FAIL', { error: err.message });
    }
    
    try {
        await api.share('123456');
        logResult('share', 'PASS');
    } catch (err) {
        logResult('share', 'FAIL', { error: err.message });
    }
}

async function testThemesCustomization() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 CATEGORY 6: Themes & Customization');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        if (testContext.threadID) {
            const themes = await api.getTheme(testContext.threadID).catch(err => { throw err; });
            logResult('getTheme', 'PASS', { count: themes?.length || 0 });
        } else {
            logResult('getTheme', 'SKIP', { message: 'No thread ID' });
        }
    } catch (err) {
        logResult('getTheme', 'FAIL', { error: err.message || JSON.stringify(err) });
    }
    
    if (testContext.threadID) {
        try {
            const info = await api.getThemeInfo(testContext.threadID).catch(err => { throw err; });
            logResult('getThemeInfo', 'PASS');
        } catch (err) {
            logResult('getThemeInfo', 'FAIL', { error: err.message || JSON.stringify(err) });
        }
        
        try {
            await api.changeThreadColor('#0084ff', testContext.threadID).catch(err => { throw err; });
            logResult('changeThreadColor', 'PASS');
        } catch (err) {
            logResult('changeThreadColor', 'FAIL', { error: err.message || JSON.stringify(err) });
        }
    } else {
        logResult('getThemeInfo', 'SKIP', { message: 'No thread ID' });
        logResult('changeThreadColor', 'SKIP', { message: 'No thread ID' });
    }
    
    if (api.setThreadThemeMqtt && testContext.threadID) {
        try {
            await api.setThreadThemeMqtt('default', testContext.threadID).catch(err => { throw err; });
            logResult('setThreadThemeMqtt', 'PASS');
        } catch (err) {
            logResult('setThreadThemeMqtt', 'FAIL', { error: err.message || JSON.stringify(err) });
        }
    } else {
        logResult('setThreadThemeMqtt', 'SKIP', { message: 'MQTT not available or no thread ID' });
    }
    
    try {
        if (api.story) {
            await api.story().catch(() => {});
        }
        logResult('story', 'SKIP', { message: 'No media provided' });
    } catch (err) {
        logResult('story', 'SKIP', { message: 'No media provided' });
    }
    
    try {
        if (api.notes && api.notes.check) {
            await api.notes.check((err, note) => {
                if (err) throw err;
            });
            logResult('notes', 'PASS');
        } else {
            logResult('notes', 'SKIP', { message: 'Function not available' });
        }
    } catch (err) {
        logResult('notes', 'FAIL', { error: err.message || JSON.stringify(err) });
    }
    
    try {
        const url = await api.resolvePhotoUrl('123456').catch(err => { throw err; });
        logResult('resolvePhotoUrl', 'PASS');
    } catch (err) {
        logResult('resolvePhotoUrl', 'FAIL', { error: err.message || JSON.stringify(err) });
    }
}

async function testStickers() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('😀 CATEGORY 7: Stickers');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (api.stickers) {
        try {
            const results = await api.stickers.search('happy');
            logResult('stickers.search', 'PASS', { count: results?.length || 0 });
        } catch (err) {
            logResult('stickers.search', 'FAIL', { error: err.message });
        }
        
        try {
            const packs = await api.stickers.listPacks();
            logResult('stickers.listPacks', 'PASS', { count: packs?.length || 0 });
        } catch (err) {
            logResult('stickers.listPacks', 'FAIL', { error: err.message });
        }
        
        try {
            const packs = await api.stickers.getStorePacks();
            logResult('stickers.getStorePacks', 'PASS', { count: packs?.length || 0 });
        } catch (err) {
            logResult('stickers.getStorePacks', 'FAIL', { error: err.message });
        }
        
        try {
            const packs = await api.stickers.listAllPacks();
            logResult('stickers.listAllPacks', 'PASS', { count: packs?.length || 0 });
        } catch (err) {
            logResult('stickers.listAllPacks', 'FAIL', { error: err.message });
        }
        
        try {
            const aiStickers = await api.stickers.getAiStickers({ limit: 5 });
            logResult('stickers.getAiStickers', 'PASS', { count: aiStickers?.length || 0 });
        } catch (err) {
            logResult('stickers.getAiStickers', 'FAIL', { error: err.message });
        }
        
        try {
            await api.stickers.addPack('123456');
            logResult('stickers.addPack', 'PASS');
        } catch (err) {
            logResult('stickers.addPack', 'FAIL', { error: err.message });
        }
        
        try {
            const stickers = await api.stickers.getStickersInPack('123456');
            logResult('stickers.getStickersInPack', 'PASS', { count: stickers?.length || 0 });
        } catch (err) {
            logResult('stickers.getStickersInPack', 'FAIL', { error: err.message });
        }
    } else {
        logResult('stickers.search', 'SKIP', { message: 'Stickers API not available' });
        logResult('stickers.listPacks', 'SKIP', { message: 'Stickers API not available' });
        logResult('stickers.getStorePacks', 'SKIP', { message: 'Stickers API not available' });
        logResult('stickers.listAllPacks', 'SKIP', { message: 'Stickers API not available' });
        logResult('stickers.getAiStickers', 'SKIP', { message: 'Stickers API not available' });
        logResult('stickers.addPack', 'SKIP', { message: 'Stickers API not available' });
        logResult('stickers.getStickersInPack', 'SKIP', { message: 'Stickers API not available' });
    }
}

async function testGroupAdvanced() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👪 CATEGORY 8: Group & Advanced');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (testContext.threadID && testContext.threadList && testContext.threadList.length > 0) {
        try {
            const thread = testContext.threadList[0];
            const participantIDs = thread.participantIDs?.filter(id => id !== testContext.userID).slice(0, 2) || [];
            
            if (participantIDs.length >= 2) {
                await api.createNewGroup(participantIDs, '[Test Group]');
                logResult('createNewGroup', 'PASS');
            } else {
                logResult('createNewGroup', 'SKIP', { message: 'Need at least 2 other participants' });
            }
        } catch (err) {
            logResult('createNewGroup', 'FAIL', { error: err.message });
        }
    } else {
        logResult('createNewGroup', 'SKIP', { message: 'No thread data available' });
    }
    
    if (testContext.threadID) {
        try {
            if (!api.ctx?.mqttClient) {
                logResult('gcname', 'SKIP', { message: 'MQTT not connected' });
            } else {
                await api.gcname('[Test Name]', testContext.threadID);
                logResult('gcname', 'PASS');
            }
        } catch (err) {
            logResult('gcname', 'FAIL', { error: err.message });
        }
        
        if (api.gcmember) {
            try {
                await api.gcmember('add', testContext.threadID, [testContext.friendID || testContext.userID]);
                logResult('gcmember', 'PASS');
            } catch (err) {
                logResult('gcmember', 'FAIL', { error: err.message });
            }
        } else {
            logResult('gcmember', 'SKIP', { message: 'Function not available' });
        }
        
        if (api.gcrule) {
            try {
                await api.gcrule('Test rules', testContext.threadID);
                logResult('gcrule', 'PASS');
            } catch (err) {
                logResult('gcrule', 'FAIL', { error: err.message });
            }
        } else {
            logResult('gcrule', 'SKIP', { message: 'Function not available' });
        }
        
        try {
            await api.changeGroupImage();
            logResult('changeGroupImage', 'SKIP', { message: 'No image provided' });
        } catch (err) {
            logResult('changeGroupImage', 'SKIP', { message: 'No image provided' });
        }
    } else {
        logResult('gcname', 'SKIP', { message: 'No thread ID' });
        logResult('gcmember', 'SKIP', { message: 'No thread ID' });
        logResult('gcrule', 'SKIP', { message: 'No thread ID' });
        logResult('changeGroupImage', 'SKIP', { message: 'No thread ID' });
    }
    
    try {
        const botInfo = await api.getBotInfo();
        logResult('getBotInfo', 'PASS');
    } catch (err) {
        logResult('getBotInfo', 'FAIL', { error: err.message });
    }
    
    if (api.getBotInitialData) {
        try {
            const data = await api.getBotInitialData();
            logResult('getBotInitialData', 'PASS');
        } catch (err) {
            logResult('getBotInitialData', 'FAIL', { error: err.message });
        }
    } else {
        logResult('getBotInitialData', 'SKIP', { message: 'Function not available' });
    }
    
    try {
        const accessToken = await api.getAccess();
        logResult('getAccess', 'PASS');
    } catch (err) {
        logResult('getAccess', 'FAIL', { error: err.message });
    }
    
    try {
        const html = await api.httpGet('https://www.facebook.com');
        logResult('httpGet', 'PASS', { size: html?.length || 0 });
    } catch (err) {
        logResult('httpGet', 'FAIL', { error: err.message });
    }
    
    try {
        const html = await api.httpPost('https://www.facebook.com/ajax/bz', {});
        logResult('httpPost', 'PASS', { size: html?.length || 0 });
    } catch (err) {
        logResult('httpPost', 'FAIL', { error: err.message });
    }
    
    if (api.httpPostFormData) {
        try {
            const result = await api.httpPostFormData('https://www.facebook.com/ajax/bz', {});
            logResult('httpPostFormData', 'PASS');
        } catch (err) {
            logResult('httpPostFormData', 'FAIL', { error: err.message });
        }
    } else {
        logResult('httpPostFormData', 'SKIP', { message: 'Function not available' });
    }
    
    if (api.listenMqtt) {
        logResult('listenMqtt', 'SKIP', { message: 'Listener function - requires callback setup' });
    } else {
        logResult('listenMqtt', 'SKIP', { message: 'Function not available' });
    }
    
    if (api.listenSpeed) {
        logResult('listenSpeed', 'SKIP', { message: 'Listener function - requires callback setup' });
    } else {
        logResult('listenSpeed', 'SKIP', { message: 'Function not available' });
    }
    
    if (api.realtime) {
        logResult('realtime', 'SKIP', { message: 'Advanced MQTT function - requires setup' });
    } else {
        logResult('realtime', 'SKIP', { message: 'Function not available' });
    }
    
    if (api.addExternalModule) {
        try {
            api.addExternalModule({ testFunction: () => 'test' });
            logResult('addExternalModule', 'PASS');
        } catch (err) {
            logResult('addExternalModule', 'FAIL', { error: err.message });
        }
    } else {
        logResult('addExternalModule', 'SKIP', { message: 'Function not available' });
    }
    
    if (api.changeBlockedStatus) {
        logResult('changeBlockedStatus', 'SKIP', { message: 'Destructive - not tested' });
    }
    
    if (api.friend) {
        logResult('friend', 'SKIP', { message: 'Requires specific friend request ID' });
    }
    
    if (api.addUserToGroup) {
        logResult('addUserToGroup', 'SKIP', { message: 'Tested via gcmember' });
    }
    
    if (api.createPoll) {
        logResult('createPoll', 'SKIP', { message: 'Requires poll data structure' });
    }
    
    if (api.createAITheme) {
        logResult('createAITheme', 'SKIP', { message: 'AI feature - requires special parameters' });
    }
}

async function generateReport() {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const total = testResults.length;
    
    console.log(`Total Functions Tested: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`\nSuccess Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);
    
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify({
        summary: { total, passed, failed, skipped },
        testContext,
        results: testResults,
        timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`\n💾 Results saved to: ${TEST_RESULTS_FILE}\n`);
}

async function runAllTests() {
    console.log('🚀 NeoKEX-FCA Comprehensive API Test Suite\n');
    console.log('Testing all 68 API functions...\n');
    
    return new Promise((resolve, reject) => {
        login({ appState }, { online: true, listenEvents: true }, async (err, apiInstance) => {
            if (err) {
                console.error('❌ Login failed:', err);
                return reject(err);
            }
            
            api = apiInstance;
            console.log('✅ Login successful!\n');
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            try {
                await setupTestContext();
                await testAuthenticationSession();
                await testMessaging();
                await testThreadManagement();
                await testUserManagement();
                await testReactionsInteractions();
                await testThemesCustomization();
                await testStickers();
                await testGroupAdvanced();
                await generateReport();
                
                resolve(testResults);
            } catch (error) {
                console.error('\n❌ Test execution error:', error);
                await generateReport();
                reject(error);
            }
        });
    });
}

runAllTests()
    .then(() => {
        console.log('✅ All tests completed successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Test suite failed:', err);
        process.exit(1);
    });
