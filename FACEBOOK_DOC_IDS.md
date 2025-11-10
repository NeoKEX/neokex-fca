# Facebook GraphQL doc_id Reference

This file tracks all GraphQL doc_ids used in NeoKEX-FCA.

> **Note**: Facebook changes these doc_ids frequently. If a function stops working, extract the new doc_id from Facebook using browser DevTools (see `extract-doc-ids-guide.md`).

## 🟢 Working doc_ids (Verified: Nov 10, 2025)

### Friend Functions
- **friend.requests**: `9103543533085580` (FriendingCometRootContentQuery)
- **friend.accept**: `24630768433181357` (FriendingCometFriendRequestConfirmMutation)
- **friend.suggest.list**: `9917809191634193` (FriendingCometPYMKPanelPaginationQuery)
- **friend.suggest.request**: `23982103144788355` (FriendingCometFriendRequestSendMutation)

### Thread/Conversation Functions
- **getThreadInfo**: `3449967031715030` (MessengerGraphQLThreadFetcher)
- **getThreadList**: `3426149104143726` (MessengerGraphQLThreadlistFetcher)
- **getThreadHistory**: `1498317363570230`
- **getThreadPictures**: `4855856897800288` (MessengerThreadMediaQuery)
- **searchForThread**: `1746741182112617`
- **archiveThread**: `4785156694883915` (MWChatArchiveStatusChangeMutation)
- **muteThread**: `2750319311702744` (MWChatMuteSettingsMutation)
- **deleteThread**: `3495917127177638` (MessagingThreadDeleteMutation)

### Messaging Functions
- **searchMessages**: `6894232070618411` (MWChatMessageSearchQuery)
- **theme**: `24474714052117636` (MWPThreadThemeQuery_AllThemesQuery)
- **createAITheme**: `23873748445608673` (useGenerateAIThemeMutation)
- **setMessageReaction**: `1491398900900362`
- **changeAdminStatus**: `2504913949542429` / `2504913949542430`
- **handleMessageRequest**: `3055967771174472` / `3055967771274472`

### Account Functions
- **getBlockedUsers**: `4994829153940950`
- **changeBio**: `4969988563035816`
- **changeBlockedStatus**: `4707600215949898` / `4707600216049898`

### Social Functions
- **comment**: `6993516810709754`
- **follow**: `25472099855769847`
- **share**: `28939050904374351`
- **story**: `9697491553691692` / `24226878183562473`
- **unfriend**: `5000603053365986`
- **setPostReaction**: `5494309793948992`

### Stickers & Notes
- **stickers.search**: `24004987559125954`
- **notes.create**: `30899655739648624`

### Realtime
- **listenMqtt.threadQuery**: `3336396659757871`

---

## 🔴 Broken doc_ids (Need Replacement)

### Friend Functions
- **friend.list**: ~~`5352933734760787`~~ ❌ **BROKEN**
  - Error: "The GraphQL document with ID was not found"
  - Query name: FriendsListQuery / CometFriendsListQuery
  - File: `src/engine/functions/social/friend.js` (line 154)
  - **Action Required**: Extract new doc_id from facebook.com/friends

---

## 📝 How to Update This File

When you replace a doc_id:

1. Extract the new doc_id from Facebook (see `extract-doc-ids-guide.md`)
2. Update the source file
3. Test with `node test-all-doc-ids.js`
4. If working, move it from "Broken" to "Working" section
5. Add today's date to the "Working" section header
6. Commit the changes

---

## 🔄 Last Updated

- **Date**: November 10, 2025
- **Tested**: 31 doc_ids
- **Working**: 30/31
- **Broken**: 1/31
- **Test Command**: `node test-all-doc-ids.js`
