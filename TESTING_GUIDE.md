# 🧪 Testing Guide for NeoKEX-FCA

## ⚠️ Security First

**Never commit Facebook credentials to the repository!**

- The `attached_assets/` folder may contain test cookies - **rotate them after testing**
- Each contributor should use their own Facebook account for testing
- Do not share appState/cookies in public channels

---

## 📋 Test Files Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `test-all-api-functions.js` | Comprehensive functional test of all API methods | After code changes, before release |
| `test-all-doc-ids.js` | Validates all GraphQL doc_ids | When functions return unexpected errors |
| `test-thread-theme-functions.js` | Thread and theme specific tests | When working on conversation features |
| `debug-friends.js` | Diagnostic tool for friend.list debugging | Troubleshooting friend-related issues |

---

## 🚀 Quick Start

### 1. Prepare Your Test Cookies

You need a valid Facebook `appState` (cookies):

```bash
# Create the attached_assets directory if it doesn't exist
mkdir -p attached_assets

# Save your cookies to a file (see "Getting Cookies" section below)
# File should contain JSON array of cookie objects
```

### 2. Run Comprehensive Tests

```bash
# Test all API functions
node test-all-api-functions.js

# Test all GraphQL doc_ids
node test-all-doc-ids.js
```

---

## 🍪 Getting Your Facebook Cookies

### Method 1: Browser Extension (Recommended)

1. Install "EditThisCookie" or similar extension
2. Login to facebook.com
3. Export cookies as JSON
4. Save to `attached_assets/cookies.json`

### Method 2: Browser DevTools

1. Login to facebook.com
2. Open DevTools (F12) → Console
3. Run:
```javascript
console.log(JSON.stringify(
  document.cookie.split('; ').map(c => {
    const [name, value] = c.split('=');
    return {name, value, domain: '.facebook.com', path: '/'};
  }),
  null,
  2
));
```
4. Copy the output and save to a file

---

## 📊 Understanding Test Results

### test-all-api-functions.js

```
✅ Working: Function executed successfully
⏭️  Skipped: Intentionally skipped (would perform destructive action)
❌ Failed: Error occurred - needs investigation
```

### test-all-doc-ids.js

```
✅ Working: doc_id recognized by Facebook
⚠️  Unknown: Needs manual review with proper variables
❌ BROKEN: doc_id not found - needs replacement
```

**Note**: "Unknown response" or "needs variables" = doc_id is valid, just needs proper parameters

---

## 🔧 Troubleshooting

### "Login failed" or "Invalid cookies"

- Your cookies have expired - extract fresh ones
- Make sure cookies include `c_user`, `xs`, `datr`

### "0 friends" or "Empty results"

- Check if the doc_id is broken (run `test-all-doc-ids.js`)
- Extract new doc_id using `extract-doc-ids-guide.md`

### "Rate limit" errors

- Facebook is throttling requests
- Wait 5-10 minutes between test runs
- Use fewer API calls in tests

---

## 🔄 Manual vs Automated Testing

### Manual Testing (Recommended for Development)

```bash
# Run tests manually when needed
node test-all-api-functions.js
```

**Pros**: Full control, fresh cookies, accurate results  
**Cons**: Requires manual execution

### Automated Testing (Not Recommended)

⚠️ **Security Risk**: Automated tests would require committed credentials

- Do not set up CI/CD with stored cookies
- Do not automate tests in public repositories
- Manual testing on-demand is safer

---

## 📝 Updating Tests

When adding new API functions:

1. Add function test to `test-all-api-functions.js`
2. If it uses a new doc_id, document it in `FACEBOOK_DOC_IDS.md`
3. Test manually with real account
4. Update this guide if needed

---

## 🎯 Test Coverage Status

**Last Updated**: November 10, 2025

- **Total API Functions**: 74
- **Tested Functions**: 74
- **GraphQL doc_ids**: 31
- **Working doc_ids**: 30/31 (96.8%)
- **Broken doc_ids**: 1 (friend.list)

---

## 🔐 Best Practices

1. **Never commit cookies** - Add to `.gitignore`
2. **Rotate credentials** - Change Facebook password after extensive testing
3. **Use test accounts** - Don't test with your personal Facebook account
4. **Respect rate limits** - Add delays between API calls
5. **Document findings** - Update `FACEBOOK_DOC_IDS.md` when doc_ids change

---

## 📚 Related Documentation

- `extract-doc-ids-guide.md` - How to extract working doc_ids
- `FACEBOOK_DOC_IDS.md` - Reference of all doc_ids
- `extract-friend-list-doc-id.html` - Browser tool for extraction
- `replit.md` - Project architecture overview
