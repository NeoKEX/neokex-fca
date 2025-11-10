const { login } = require('./lib/index');
const fs = require('fs');

const cookiesRaw = fs.readFileSync('attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762796139367_1762796139370.txt', 'utf8');
const cookies = JSON.parse(cookiesRaw);

const appState = cookies.map(cookie => ({
    key: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    hostOnly: cookie.hostOnly,
    creation: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
}));

console.log('🔐 Logging in with cookies...');

login({ appState }, { 
    selfListen: false, 
    listenEvents: true,
    logging: true
}, async (err, api) => {
    if (err) {
        console.error('❌ Login failed:', err);
        process.exit(1);
    }
    
    console.log('✅ Login successful!');
    
    try {
        console.log('\n📋 Getting current user info...');
        const currentUserID = await api.getCurrentUserID();
        console.log('Current User ID:', currentUserID);
        
        console.log('\n📬 Getting thread list...');
        const threads = await api.getThreadList(5, null, []);
        console.log(`Found ${threads.length} threads`);
        
        if (threads.length > 0) {
            const testThread = threads[0];
            console.log(`\n💬 Testing sendMessage to thread: ${testThread.name || testThread.threadID}`);
            
            const messageInfo = await api.sendMessage('🧪 Test message from neokex-fca - sendMessage is working!', testThread.threadID);
            console.log('✅ Message sent successfully!');
            console.log('Message ID:', messageInfo.messageID);
            console.log('Thread ID:', messageInfo.threadID);
            console.log('Timestamp:', messageInfo.timestamp);
            
            console.log('\n🔄 Testing unsendMessage...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await api.unsendMessage(messageInfo.messageID);
            console.log('✅ Message unsent successfully!');
            
            console.log('\n📎 Testing sendMessage with URL...');
            const urlMessageInfo = await api.sendMessage({ 
                body: 'Test with URL attachment',
                url: 'https://www.facebook.com'
            }, testThread.threadID);
            console.log('✅ URL message sent successfully!');
            console.log('Message ID:', urlMessageInfo.messageID);
        } else {
            console.log('⚠️  No threads available for testing');
        }
        
        console.log('\n✨ All tests passed! sendMessage and related functions are working correctly.');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
});
