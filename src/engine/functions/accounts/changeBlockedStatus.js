"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeBlockedStatus(userID, block, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof block === "function") {
      callback = block;
      block = true;
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!userID) throw new Error("userID is required");

      const shouldBlock = block !== false;
      const endpoint = shouldBlock 
        ? "https://www.facebook.com/messaging/block_messages/" 
        : "https://www.facebook.com/messaging/unblock_messages/";
      
      const form = {
        fbid: userID
      };

      const resData = await defaultFuncs
        .post(endpoint, ctx.jar, form)
        .then(utils.saveCookies(ctx.jar))
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw resData;
      }

      cb(null, {
        userID: userID,
        blocked: shouldBlock
      });
    } catch (err) {
      utils.error("changeBlockedStatus", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
