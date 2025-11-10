const { login } = require('./lib/index');
const fs = require('fs');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762789459482_1762789459484.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

console.log('🔍 Detailed friend.list Test\n');

login({ appState }, { logging: true }, async (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  const uid = api.getCurrentUserID();
  console.log('✅ Logged in as:', uid);
  console.log('\n--- Testing friend.list function ---\n');
  
  try {
    // Test with current user ID
    console.log('Testing with current user ID:', uid);
    const friends1 = await api.friend.list(uid);
    console.log(`Result 1: ${friends1.length} friends`);
    if (friends1.length > 0) {
      console.log('Sample:', friends1.slice(0, 3));
    }
    
    // Test without parameters (should default to current user)
    console.log('\nTesting without parameters:');
    const friends2 = await api.friend.list();
    console.log(`Result 2: ${friends2.length} friends`);
    if (friends2.length > 0) {
      console.log('Sample:', friends2.slice(0, 3));
    }
    
    // Direct GraphQL test with different variables
    console.log('\n--- Direct GraphQL Test ---\n');
    const ctx = api.ctx;
    const defaultFuncs = api.defaultFuncs;
    
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
        scale: 3
      }),
      doc_id: "9805267642859362"
    };
    if (ctx.lsd) form.lsd = ctx.lsd;
    
    const res = await defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form, {});
    
    console.log('Response keys:', Object.keys(res));
    console.log('Data keys:', res.data ? Object.keys(res.data) : 'No data');
    
    if (res.data && res.data.errors) {
      console.log('\n❌ Errors:', JSON.stringify(res.data.errors, null, 2));
    }
    
    if (res.data && res.data.data) {
      console.log('\n✅ Response data structure:');
      console.log(JSON.stringify(res.data.data, null, 2).substring(0, 1000));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
  
  process.exit(0);
});
