"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function unfriend(userID, callback) {
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
      if (!userID) throw new Error("userID is required");

      const form = {
        uid: userID,
        unref: "bd_friends_tab",
        floc: "friends_tab",
        "nctr[_mod]": `pagelet_timeline_app_collection_${ctx.userID}:2356318349:2`
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/ajax/profile/removefriendconfirm.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw resData;
      }

      cb(null, { userID: userID });
    } catch (err) {
      utils.error("unfriend", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
