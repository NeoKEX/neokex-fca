"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID, archive = true) => {
    if (!threadID) {
      throw new Error('threadID is required');
    }

    const form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "MWChatArchiveStatusChangeMutation",
      variables: JSON.stringify({
        data: {
          actor_id: ctx.userID,
          thread_ids: [threadID],
          folder: archive ? "ARCHIVED" : "INBOX"
        }
      }),
      server_timestamps: true,
      doc_id: "4785156694883915"
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form,
        null,
        {
          "x-fb-friendly-name": "MWChatArchiveStatusChangeMutation",
          "x-fb-lsd": ctx.lsd
        }
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error || resData.errors) {
        const errorMsg = resData ? (resData.error || JSON.stringify(resData.errors)) : 'Archive operation failed';
        if (errorMsg.includes('document') && errorMsg.includes('not found')) {
          utils.warn('archiveThread', 'GraphQL doc_id outdated. Archive operation unavailable due to Facebook API changes.');
          return { success: false, threadID, archived: archive, error: 'API temporarily unavailable' };
        }
        throw new Error(errorMsg);
      }

      return {
        success: true,
        threadID,
        archived: archive
      };
    } catch (error) {
      utils.error('archiveThread', error);
      throw error;
    }
  };
};
