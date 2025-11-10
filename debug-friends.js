const { login } = require('./lib/index');
const fs = require('fs');
const util = require('util');

const cookiesPath = './attached_assets/Pasted--name-ps-l-value-1-domain-facebook-com-ho-1762783778639_1762783778642.txt';
const appState = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));

login({ appState }, { logging: false }, async (err, api) => {
  if (err) {
    console.error('Login failed:', err);
    process.exit(1);
  }

  console.log('Debugging friend.list function...\n');
  
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
      scale: 2
    }),
    doc_id: "5352933734760787"
  };
  if (ctx.lsd) form.lsd = ctx.lsd;
  
  try {
    const res = await defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form, {});
    
    console.log('Response status:', res.status);
    console.log('Response data keys:', Object.keys(res.data || {}));
    
    if (res.data && res.data.errors) {
      console.log('\n❌ GraphQL Errors:', JSON.stringify(res.data.errors, null, 2));
    }
    
    if (res.data && res.data.data) {
      console.log('\nResponse data.data keys:', Object.keys(res.data.data));
      
      if (res.data.data.user) {
        console.log('User object keys:', Object.keys(res.data.data.user));
        
        if (res.data.data.user.friends) {
          console.log('Friends object keys:', Object.keys(res.data.data.user.friends));
          console.log('Friends edges length:', res.data.data.user.friends.edges?.length || 0);
          
          if (res.data.data.user.friends.edges && res.data.data.user.friends.edges.length > 0) {
            console.log('\nFirst friend sample:', util.inspect(res.data.data.user.friends.edges[0], { depth: 3, colors: true }));
          }
        } else {
          console.log('\n⚠️ No friends property in user object');
          console.log('Full user object:', util.inspect(res.data.data.user, { depth: 2, colors: true }));
        }
      } else {
        console.log('\n⚠️  No user property in data.data');
        console.log('Full data.data:', util.inspect(res.data.data, { depth: 2, colors: true }));
      }
    } else {
      console.log('\n⚠️  No data.data in response');
      console.log('Full response:', util.inspect(res.data, { depth: 2, colors: true }));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
});
