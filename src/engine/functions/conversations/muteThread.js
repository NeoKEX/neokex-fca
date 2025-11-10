"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID, muteSeconds = -1) => {
    if (!threadID) {
      throw new Error('threadID is required');
    }

    const form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "MWChatMuteSettingsMutation",
      variables: JSON.stringify({
        data: {
          actor_id: ctx.userID,
          thread_id: threadID,
          mute_settings: muteSeconds
        }
      }),
      server_timestamps: true,
      doc_id: "2750319311702744"
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form,
        null,
        {
          "x-fb-friendly-name": "MWChatMuteSettingsMutation",
          "x-fb-lsd": ctx.lsd
        }
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error || resData.errors) {
        const errorMsg = resData ? (resData.error || JSON.stringify(resData.errors)) : 'Mute operation failed';
        if (errorMsg.includes('document') && errorMsg.includes('not found')) {
          utils.warn('muteThread', 'GraphQL doc_id outdated. Mute operation unavailable due to Facebook API changes.');
          return { success: false, threadID, muteSeconds, error: 'API temporarily unavailable' };
        }
        throw new Error(errorMsg);
      }

      return {
        success: true,
        threadID,
        muteSeconds
      };
    } catch (error) {
      utils.error('muteThread', error);
      throw error;
    }
  };
};
