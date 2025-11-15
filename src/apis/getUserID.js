"use strict";

const utils = require('../utils');

function formatData(data) {
  return {
    userID: utils.formatID(data.uid.toString()),
    photoUrl: data.photo,
    indexRank: data.index_rank,
    name: data.text,
    isVerified: data.is_verified,
    profileUrl: data.path,
    category: data.category,
    score: data.score,
    type: data.type
  };
}

module.exports = (defaultFuncs, api, ctx) => {
  return async function getUserID(name, callback) {
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
        value: name.toLowerCase(),
        viewer: ctx.userID,
        rsp: "search",
        context: "search",
        path: "/home.php",
        request_id: ctx.clientID || utils.getGUID()
      };

      const res = await defaultFuncs.get("https://www.facebook.com/ajax/typeahead/search.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (res.error) {
        throw res;
      }

      const data = res.payload.entries;
      callback(null, data.map(formatData));
    } catch (err) {
      utils.error("getUserID", err);
      callback(err);
    }

    return returnPromise;
  };
};
