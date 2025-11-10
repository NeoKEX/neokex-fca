"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function deleteThread(threadID, callback) {
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

      const threadArray = Array.isArray(threadID) ? threadID : [threadID];
      const form = {
        client: "mercury"
      };

      for (let i = 0; i < threadArray.length; i++) {
        form[`ids[${i}]`] = threadArray[i];
      }

      const resData = await defaultFuncs
        .post("https://www.facebook.com/ajax/mercury/delete_thread.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(JSON.stringify(resData.error));
      }

      cb(null, { threadID: threadID });
    } catch (err) {
      utils.error("deleteThread", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
