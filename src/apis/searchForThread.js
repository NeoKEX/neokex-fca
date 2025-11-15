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
        client: "web_messenger",
        query: searchQuery,
        offset: 0,
        limit: 21,
        index: "fbid"
      };

      const res = await defaultFuncs.post(
        "https://www.facebook.com/ajax/mercury/search_threads.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (res.error) {
        throw res;
      }

      if (!res.payload.mercury_payload || !res.payload.mercury_payload.threads) {
        return callback({ error: `Could not find thread "${searchQuery}".` });
      }

      const threads = res.payload.mercury_payload.threads.map(utils.formatThread);
      callback(null, threads);
    } catch (err) {
      utils.error("searchForThread", err);
      callback(err);
    }

    return returnPromise;
  };
};
