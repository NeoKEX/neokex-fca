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

    if (!searchQuery || typeof searchQuery !== 'string') {
      const error = { error: "searchForThread: searchQuery parameter must be a non-empty string" };
      utils.error("searchForThread", error);
      return callback(error);
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

      if (!res) {
        throw { 
          error: "searchForThread: No response received. This may be due to Facebook account checkpoint or security restrictions.",
          details: "Please verify your account on facebook.com"
        };
      }

      if (res.error) {
        throw res;
      }

      if (!res.payload || !res.payload.mercury_payload || !res.payload.mercury_payload.threads) {
        return callback({ 
          error: `Could not find thread "${searchQuery}".`,
          details: "The thread may not exist or access may be restricted."
        });
      }

      const threads = res.payload.mercury_payload.threads.map(utils.formatThread);
      callback(null, threads);
    } catch (err) {
      if (err.error && typeof err.error === 'string' && err.error.includes('checkpoint')) {
        err.friendlyMessage = "Account checkpoint required - searchForThread is restricted until verification";
      }
      utils.error("searchForThread", err);
      callback(err);
    }

    return returnPromise;
  };
};
