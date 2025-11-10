# ws3-fca Doc_IDs and Endpoints Extraction

**Date:** November 10, 2025
**Source:** ws3-fca@latest (npm package)

## Summary

ws3-fca uses **TWO different approaches**:
1. **Ajax Endpoints** (older, more stable) - NO doc_id needed
2. **GraphQL with doc_id** (newer, can break when Facebook updates)

## 📋 Functions Using Ajax Endpoints (More Stable!)

These functions DON'T use doc_id - they use direct Ajax endpoints:

| Function | Endpoint | Notes |
|----------|----------|-------|
| **getFriendsList** | `/chat/user_info_all` | ✅ More reliable than GraphQL |
| **deleteThread** | `/ajax/mercury/delete_thread.php` | ✅ Direct Ajax |
| **muteThread** | `/ajax/mercury/change_mute_thread.php` | ✅ Direct Ajax |
| **changeArchivedStatus** (archiveThread) | `/ajax/mercury/change_archived_status.php` | ✅ Direct Ajax |
| **getThreadPictures** | `/ajax/messaging/attachments/sharedphotos.php` | ✅ Direct Ajax |
| **changeAdminStatus** | `/messaging/save_admins/?dpr=1` | ✅ Direct Ajax |
| **handleMessageRequest** | `/ajax/mercury/move_thread.php` | ✅ Direct Ajax |
| **changeBlockedStatus** | `/messaging/block_messages/` or `/messaging/unblock_messages/` | ✅ Direct Ajax |
| **unfriend** | `/ajax/profile/removefriendconfirm.php` | ✅ Direct Ajax |

## 🔢 Functions Using GraphQL doc_id

These use GraphQL and have working doc_ids:

| Function | doc_id | Friendly Name | Status |
|----------|--------|---------------|--------|
| **changeBio** | `2725043627607610` | ProfileCometSetBioMutation | ✅ Working |
| **comment** | `6993516810709754` | - | ✅ Working |
| **follow** | `25472099855769847` | CometUserFollowMutation | ✅ Working |
| **setMessageReaction** | `1491398900900362` | - | ✅ Working |
| **setPostReaction** | `4769042373179384` | CometUFIFeedbackReactMutation | ✅ Working |
| **getThreadInfo** | `3449967031715030` | - | ✅ Working |
| **getThreadList** | `3426149104143726` | - | ✅ Working |
| **getThreadHistory** | `1498317363570230` | - | ✅ Working |
| **searchStickers** | `4642836929159953` | - | ✅ Working |

## ❌ Functions NOT in ws3-fca

These functions don't exist in ws3-fca:

- **searchMessages** - NOT FOUND in ws3-fca
- **getBlockedUsers** - NOT FOUND in ws3-fca  
- **share** - NOT FOUND (only shareContact and shareLink exist)

## 📝 Recommendation

**BEST STRATEGY:** Replace GraphQL doc_id functions with Ajax endpoint approach where possible!

### Why Ajax is Better:
1. ✅ **More stable** - endpoints change less frequently
2. ✅ **Simpler** - no doc_id to track
3. ✅ **Fewer dependencies** - doesn't rely on GraphQL schema
4. ✅ **Proven** - ws3-fca has 648 users and is actively maintained

### Implementation Priority:
1. **HIGH PRIORITY** - Replace with Ajax endpoints:
   - getFriendsList ⭐ (user has 51 friends but getting 0)
   - archiveThread
   - muteThread
   - deleteThread
   - getThreadPictures

2. **MEDIUM PRIORITY** - Update doc_ids:
   - changeBio: `2725043627607610`
   - setPostReaction: `4769042373179384`
   - unfriend: Use Ajax `/ajax/profile/removefriendconfirm.php`

3. **LOW PRIORITY / NOT AVAILABLE**:
   - searchMessages - Find alternative or mark as unavailable
   - getBlockedUsers - Find alternative or mark as unavailable
   - share - Use shareLink or shareContact instead
