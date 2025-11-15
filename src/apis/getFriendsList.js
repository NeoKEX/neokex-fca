"use strict";

const utils = require('../utils');

module.exports = (defaultFuncs, api, ctx) => {
  return async function getFriendsList(callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = (err, result) => {
        if (err) return rejectFunc(err);
        resolveFunc(result);
      };
    }

    try {
      const form = {
        viewer: ctx.userID
      };

      const res = await defaultFuncs.get(
        "https://www.facebook.com/ajax/typeahead/first_degree.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (res.error) {
        throw res;
      }

      const friends = res.payload.entries.map(entry => ({
        userID: utils.formatID(entry.uid.toString()),
        name: entry.text,
        firstName: entry.first_name,
        vanity: entry.vanity,
        type: entry.type,
        photoUrl: entry.photo,
        profileUrl: entry.path,
        isVerified: entry.is_verified || false,
        isFriend: true
      }));

      callback(null, friends);
    } catch (err) {
      utils.error("getFriendsList", err);
      callback(err);
    }

    return returnPromise;
  };
};
