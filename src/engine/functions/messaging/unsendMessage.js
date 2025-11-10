"use strict";

const utils = require('../../../helpers');
// @NethWs3Dev

module.exports = function (defaultFuncs, api, ctx) {
  return async (messageID) => {
    const defData = await defaultFuncs.post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, {
      message_id: messageID
    })
    const resData = await utils.parseAndCheckLogin(ctx, defaultFuncs)(defData);
    if (resData.error) {
      throw new Error(`Unsend message failed: ${JSON.stringify(resData.error)}`);
    }
    return resData;
  };
};
