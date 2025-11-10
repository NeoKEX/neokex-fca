"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function setTitle(newTitle, threadID, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!threadID) throw new Error("threadID is required");
      
      const form = {
        thread_name: newTitle || "",
        thread_id: threadID
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/messaging/set_thread_name/?dpr=1", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(resData.error);
      }

      cb(null, {
        threadID: threadID,
        title: newTitle
      });
    } catch (err) {
      utils.error("setTitle", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
