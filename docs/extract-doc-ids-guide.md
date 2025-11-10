# 📝 Guide: Extract Working Facebook GraphQL doc_ids

## ⚠️ Security Notice

**Never commit your Facebook cookies/appState to the repository!** The cookies in `attached_assets/` are for testing only and should be rotated after use. Each user should supply their own cookies for testing.

## 🔍 Only 1 Broken doc_id Found

**Broken Function**: `friend.list` in `src/engine/functions/social/friend.js`  
**Broken doc_id**: `5352933734760787`  
**Error**: "The GraphQL document with ID 5352933734760787 was not found"

---

## 🔧 How to Extract Working doc_ids from Facebook

### Method 1: Browser DevTools (Recommended)

1. **Open Facebook in Chrome/Firefox**
   - Go to https://www.facebook.com
   - Make sure you're logged in

2. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

3. **Go to Network Tab**
   - Click the "Network" tab in DevTools
   - Clear existing logs (trash icon)

4. **Filter for GraphQL**
   - In the filter box, type: `graphql`
   - This will show only GraphQL requests

5. **Perform the Action**
   - For **friend.list**: Click on "Friends" in the left sidebar
   - Wait for the friends list to load

6. **Find the Request**
   - Look for POST requests to `/api/graphql/`
   - The name might be "graphql" or have a number

7. **Extract the doc_id**
   - Click on the request
   - Go to the "Payload" or "Request" tab
   - Look for `doc_id: "XXXXXXXXXXXXX"`
   - Copy the number

8. **Verify the Query Name**
   - Also look for `fb_api_req_friendly_name`
   - It should be something like `FriendsListQuery` or `CometFriendsListQuery`

---

## 📋 Common Query Names to Look For

| Function | Expected Query Name | Current doc_id (status) |
|----------|-------------------|------------------------|
| friend.list | FriendsListQuery / CometFriendsListQuery | 5352933734760787 ❌ |
| friend.requests | FriendingCometRootContentQuery | 9103543533085580 ✅ |
| getThreadList | MessengerGraphQLThreadlistFetcher | 3426149104143726 ✅ |
| getThreadInfo | MessengerGraphQLThreadFetcher | 3449967031715030 ✅ |
| searchMessages | MWChatMessageSearchQuery | 6894232070618411 ✅ |

---

## 🔄 How to Replace a Broken doc_id

Once you have the new doc_id:

1. **Open the source file**:
   ```bash
   nano src/engine/functions/social/friend.js
   ```

2. **Find the old doc_id** (line 154):
   ```javascript
   doc_id: "5352933734760787"
   ```

3. **Replace with new doc_id**:
   ```javascript
   doc_id: "PASTE_NEW_DOC_ID_HERE"
   ```

4. **Save and test**:
   ```bash
   node test-all-doc-ids.js
   ```

---

## 🎯 Quick Fix for friend.list

If you extract a new doc_id from Facebook:

```bash
# Edit the file
nano src/engine/functions/social/friend.js

# Go to line 154 and replace:
# OLD: doc_id: "5352933734760787"
# NEW: doc_id: "YOUR_NEW_DOC_ID"

# Test
node test-all-api-functions.js
```

---

## 💡 Alternative: Use Browser Console

You can also extract doc_ids using the browser console:

```javascript
// Open facebook.com/friends
// Open console (F12 → Console tab)
// Paste this code:

// Intercept fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  const options = args[1];
  
  if (url.includes('/api/graphql/') && options && options.body) {
    const body = options.body;
    const docIdMatch = body.match(/doc_id[":]+(\d+)/);
    const friendlyNameMatch = body.match(/fb_api_req_friendly_name[":]+([^"&]+)/);
    
    if (docIdMatch) {
      console.log('📌 doc_id:', docIdMatch[1]);
    }
    if (friendlyNameMatch) {
      console.log('📝 Query name:', friendlyNameMatch[1]);
    }
  }
  
  return originalFetch.apply(this, args);
};

console.log('✅ Interceptor installed. Perform actions on Facebook...');
```

Now perform actions like viewing friends, and the console will log the doc_ids!

---

## ✅ After Replacing

Run the comprehensive test again:

```bash
node test-all-api-functions.js
```

The `getFriendsList` function should now return your actual friends count!
