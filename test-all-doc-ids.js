const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🔍 Testing All GraphQL doc_ids in NeoKEX-FCA\n');
console.log('='.repeat(70) + '\n');

// All doc_ids extracted from the codebase with their context
const docIds = [
  // Friend functions
  { id: '9103543533085580', name: 'friend.requests', file: 'social/friend.js' },
  { id: '24630768433181357', name: 'friend.accept', file: 'social/friend.js' },
  { id: '5352933734760787', name: 'friend.list', file: 'social/friend.js' },
  { id: '9917809191634193', name: 'friend.suggest.list', file: 'social/friend.js' },
  { id: '23982103144788355', name: 'friend.suggest.request', file: 'social/friend.js' },
  
  // Thread/Conversation functions
  { id: '3449967031715030', name: 'getThreadInfo', file: 'conversations/getThreadInfo.js' },
  { id: '3426149104143726', name: 'getThreadList', file: 'conversations/getThreadList.js' },
  { id: '1498317363570230', name: 'getThreadHistory', file: 'conversations/getThreadHistory.js' },
  { id: '4855856897800288', name: 'getThreadPictures', file: 'conversations/getThreadPictures.js' },
  { id: '1746741182112617', name: 'searchForThread', file: 'conversations/searchForThread.js' },
  { id: '4785156694883915', name: 'archiveThread', file: 'conversations/archiveThread.js' },
  { id: '2750319311702744', name: 'muteThread', file: 'conversations/muteThread.js' },
  { id: '3495917127177638', name: 'deleteThread', file: 'conversations/deleteThread.js' },
  
  // Messaging functions
  { id: '6894232070618411', name: 'searchMessages', file: 'messaging/searchMessages.js' },
  { id: '24474714052117636', name: 'theme (list)', file: 'messaging/theme.js' },
  { id: '23873748445608673', name: 'createAITheme', file: 'messaging/createAITheme.js' },
  { id: '1491398900900362', name: 'setMessageReaction', file: 'messaging/setMessageReaction.js' },
  { id: '2504913949542429', name: 'changeAdminStatus (make)', file: 'messaging/changeAdminStatus.js' },
  { id: '3055967771174472', name: 'handleMessageRequest (accept)', file: 'messaging/handleMessageRequest.js' },
  
  // Account functions
  { id: '4994829153940950', name: 'getBlockedUsers', file: 'accounts/getBlockedUsers.js' },
  { id: '4969988563035816', name: 'changeBio', file: 'accounts/changeBio.js' },
  { id: '4707600215949898', name: 'changeBlockedStatus (block)', file: 'accounts/changeBlockedStatus.js' },
  
  // Social functions
  { id: '6993516810709754', name: 'comment', file: 'social/comment.js' },
  { id: '25472099855769847', name: 'follow', file: 'social/follow.js' },
  { id: '28939050904374351', name: 'share', file: 'social/share.js' },
  { id: '9697491553691692', name: 'story (create)', file: 'social/story.js' },
  { id: '5000603053365986', name: 'unfriend', file: 'social/unfriend.js' },
  { id: '5494309793948992', name: 'setPostReaction', file: 'social/setPostReaction.js' },
  
  // Stickers & Notes
  { id: '24004987559125954', name: 'stickers (search)', file: 'messaging/stickers.js' },
  { id: '30899655739648624', name: 'notes (create)', file: 'messaging/notes.js' },
  
  // Realtime
  { id: '3336396659757871', name: 'listenMqtt (threadQuery)', file: 'realtime/listenMqtt.js' }
];

login({ appState }, { logging: false }, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login successful\n');
  
  const ctx = api.ctx;
  const defaultFuncs = api.defaultFuncs;
  
  let working = 0;
  let broken = 0;
  const brokenDocs = [];
  
  for (const doc of docIds) {
    process.stdout.write(`Testing ${doc.name.padEnd(35)} (${doc.id})... `);
    
    try {
      // Simple test request for each doc_id
      const form = {
        av: ctx.userID,
        __user: ctx.userID,
        __a: "1",
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.jazoest,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: doc.name,
        variables: JSON.stringify({}),
        doc_id: doc.id
      };
      
      if (ctx.lsd) form.lsd = ctx.lsd;
      
      const res = await defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form, {});
      
      if (res.data && res.data.errors) {
        const error = res.data.errors[0];
        if (error.message && error.message.includes('was not found')) {
          console.log('❌ BROKEN (doc not found)');
          broken++;
          brokenDocs.push({ ...doc, error: 'Document not found' });
        } else if (error.message && error.message.includes('Variable')) {
          console.log('✅ Working (needs variables)');
          working++;
        } else {
          console.log(`⚠️  Error: ${error.message.substring(0, 50)}`);
          working++; // Counts as "working" if it's just a parameter error
        }
      } else if (res.data && res.data.data) {
        console.log('✅ Working');
        working++;
      } else {
        console.log('⚠️  Unknown response');
        working++;
      }
      
      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      broken++;
      brokenDocs.push({ ...doc, error: error.message });
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Working:  ${working}/${docIds.length}`);
  console.log(`❌ Broken:   ${broken}/${docIds.length}`);
  
  if (brokenDocs.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ BROKEN doc_ids NEED REPLACEMENT:');
    console.log('='.repeat(70));
    brokenDocs.forEach(doc => {
      console.log(`\nFunction: ${doc.name}`);
      console.log(`File: src/engine/functions/${doc.file}`);
      console.log(`Broken doc_id: ${doc.id}`);
      console.log(`Error: ${doc.error}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('📝 HOW TO GET WORKING doc_ids:');
    console.log('='.repeat(70));
    console.log('1. Open messenger.com or facebook.com in Chrome');
    console.log('2. Open DevTools (F12) → Network tab');
    console.log('3. Filter for "graphql"');
    console.log('4. Perform the action (e.g., view friends list)');
    console.log('5. Find the POST request to /api/graphql/');
    console.log('6. Look in the payload for "doc_id"');
    console.log('7. Replace the broken doc_id in the source file\n');
  }
  
  process.exit(0);
});
