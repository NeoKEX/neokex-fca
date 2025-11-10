"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID, archive = true) => {
    if (!threadID) {
      throw new Error('threadID is required');
    }

    const threadArray = Array.isArray(threadID) ? threadID : [threadID];
    const form = {};

    for (let i = 0; i < threadArray.length; i++) {
      form[`ids[${threadArray[i]}]`] = archive;
    }

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/ajax/mercury/change_archived_status.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(JSON.stringify(resData.error));
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
