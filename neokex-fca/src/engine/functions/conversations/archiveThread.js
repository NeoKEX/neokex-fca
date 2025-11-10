"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID, archive = true) => {
    if (!threadID) {
      throw new Error('threadID is required');
    }

    const form = {
      ids: [threadID],
      archive: archive ? 1 : 0
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/ajax/mercury/change_archived_status.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw new Error(resData ? resData.error : 'Archive operation failed');
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
