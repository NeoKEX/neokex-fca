"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function searchForThread(searchName, callback) {
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
      if (!searchName) throw new Error("searchName is required");

      const form = {
        search_query: searchName,
        limit: 10
      };

      const resData = await defaultFuncs
        .get("https://www.facebook.com/ajax/mercury/search_snippets.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(resData.error);
      }

      const threads = [];
      if (resData.payload && resData.payload.search_snippets) {
        for (const id in resData.payload.search_snippets) {
          const snippet = resData.payload.search_snippets[id];
          threads.push({
            threadID: snippet.thread_id || id,
            name: snippet.name || snippet.snippet,
            snippet: snippet.snippet,
            type: snippet.type
          });
        }
      }

      cb(null, threads);
    } catch (err) {
      utils.error("searchForThread", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
