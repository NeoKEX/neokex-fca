"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getUID(url, callback) {
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
      if (!url) {
        const currentUserID = api.getCurrentUserID();
        cb(null, currentUserID);
        return returnPromise;
      }

      const form = {
        url: url
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/ajax/bulk_route_definitions/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error || !resData.payload) {
        throw new Error("Failed to get UID from URL");
      }

      const userID = resData.payload.profile_id || resData.payload.id;
      cb(null, userID);
    } catch (err) {
      utils.error("getUID", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
