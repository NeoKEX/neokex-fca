"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (messageID, threadIDs) => {
    if (!messageID) {
      throw new Error('messageID is required');
    }

    if (!Array.isArray(threadIDs)) {
      threadIDs = [threadIDs];
    }

    const results = [];
    for (const threadID of threadIDs) {
      try {
        const form = {
          message_ids: [messageID],
          thread_ids: [threadID]
        };

        const resData = await defaultFuncs.post(
          "https://www.facebook.com/ajax/mercury/forward_messages.php",
          ctx.jar,
          form
        ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

        if (!resData || resData.error) {
          results.push({ threadID, success: false, error: resData ? resData.error : 'Forward failed' });
        } else {
          results.push({ threadID, success: true, messageID: resData.payload?.message_id });
        }
      } catch (error) {
        results.push({ threadID, success: false, error: error.message });
      }
    }

    return results;
  };
};
