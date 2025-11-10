"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID, muteSeconds = -1) => {
    if (!threadID) {
      throw new Error('threadID is required');
    }

    const form = {
      thread_fbid: threadID,
      mute_settings: muteSeconds
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/ajax/mercury/change_mute_thread.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw new Error(resData ? resData.error : 'Mute operation failed');
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
