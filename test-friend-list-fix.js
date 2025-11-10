const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762789459482_1762789459484.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🧪 Testing friend.list with NEW doc_id: 9805267642859362\n');

login({ appState }, { logging: false }, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Login successful!\n');

  try {
    // Test the friend.list function
    console.log('Testing friend.list...');
    const friends = await api.friend.list();
    
    if (Array.isArray(friends)) {
      console.log(`✅ friend.list WORKING!`);
      console.log(`   Found ${friends.length} friends`);
      if (friends.length > 0) {
        console.log(`   Sample: ${friends[0].name || 'N/A'} (${friends[0].userID})`);
      }
    } else {
      console.log('❌ friend.list returned non-array:', typeof friends);
    }
  } catch (error) {
    console.log('❌ friend.list FAILED:', error.message);
  }

  // Also test the doc_id directly via GraphQL
  console.log('\n🔍 Testing doc_id directly via GraphQL...');
  const ctx = api.ctx;
  const defaultFuncs = api.defaultFuncs;
  
  try {
    const form = {
      av: ctx.userID,
      __user: ctx.userID,
      __a: "1",
      fb_dtsg: ctx.fb_dtsg,
      jazoest: ctx.jazoest,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FriendsListQuery",
      variables: JSON.stringify({
        userID: ctx.userID,
        count: 100,
        cursor: null,
        scale: 2
      }),
      doc_id: "9805267642859362"
    };
    if (ctx.lsd) form.lsd = ctx.lsd;
    
    const res = await defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form, {});
    
    if (res.data && res.data.errors) {
      const error = res.data.errors[0];
      if (error.message && error.message.includes('was not found')) {
        console.log('❌ Doc_id NOT FOUND - Still broken!');
      } else {
        console.log(`✅ Doc_id VALID (error is just parameter-related)`);
        console.log(`   Error: ${error.message.substring(0, 80)}`);
      }
    } else if (res.data && res.data.data) {
      console.log('✅ Doc_id WORKING PERFECTLY!');
      console.log('   Response contains valid data');
    } else {
      console.log('⚠️  Unexpected response format');
    }
  } catch (error) {
    console.log('❌ Direct GraphQL test failed:', error.message);
  }

  console.log('\n✨ Test complete!\n');
  process.exit(0);
});
