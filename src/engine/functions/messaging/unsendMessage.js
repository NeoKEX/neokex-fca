"use strict";

const utils = require('../../../helpers');
// @NethWs3Dev

module.exports = function (defaultFuncs, api, ctx) {
  return async (messageID) => {
    if (!messageID) {
      throw new Error('messageID is required');
    }

    const defData = await defaultFuncs.post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, {
      message_id: messageID
    }).then(utils.saveCookies(ctx.jar))
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs));
    
    if (!defData) {
      throw new Error('No response from server');
    }
    
    if (defData.error) {
      throw new Error(`Unsend message failed: ${JSON.stringify(defData.error)}`);
    }
    
    return defData;
  };
};
