"use strict";

const utils = require('../utils');

module.exports = (defaultFuncs, api, ctx) => {
  return async function searchForThread(searchQuery, callback) {
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
        value: searchQuery.toLowerCase(),
        viewer: ctx.userID,
        rsp: "search",
        context: "search",
        path: "/home.php",
        request_id: ctx.clientID || utils.getGUID()
      };

      const res = await defaultFuncs.get(
        "https://www.facebook.com/ajax/typeahead/search.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (res.error) {
        throw res;
      }

      const threads = res.payload.entries.filter(entry => entry.type === "thread");
      callback(null, threads);
    } catch (err) {
      utils.error("searchForThread", err);
      callback(err);
    }

    return returnPromise;
  };
};
