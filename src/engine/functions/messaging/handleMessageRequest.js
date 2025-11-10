"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function handleMessageRequest(threadID, accept, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof accept === "function") {
      callback = accept;
      accept = true;
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!threadID) throw new Error("threadID is required");

      const shouldAccept = accept !== false;
      const threadArray = Array.isArray(threadID) ? threadID : [threadID];
      
      const form = {
        client: "mercury"
      };

      const messageBox = shouldAccept ? "inbox" : "other";
      for (let i = 0; i < threadArray.length; i++) {
        form[`${messageBox}[${i}]`] = threadArray[i];
      }

      const resData = await defaultFuncs
        .post("https://www.facebook.com/ajax/mercury/move_thread.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw resData;
      }

      cb(null, {
        threadID: threadID,
        accepted: shouldAccept
      });
    } catch (err) {
      utils.error("handleMessageRequest", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
