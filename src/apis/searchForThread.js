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

    // Store original callback if provided
    const originalCallback = callback;
    
    // Always use a wrapped callback that settles the promise
    callback = (err, result) => {
      if (originalCallback) {
        originalCallback(err, result);
      }
      if (err) return rejectFunc(err);
      resolveFunc(result);
    };

    if (!searchQuery || typeof searchQuery !== 'string') {
      const error = { error: "searchForThread: searchQuery parameter must be a non-empty string" };
      utils.error("searchForThread", error);
      callback(error);
      return returnPromise;
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
        const error = { 
          error: "Account checkpoint required - searchForThread is restricted until verification",
          details: "Please verify your account on facebook.com. This function requires additional permissions."
        };
        callback(error);
        return returnPromise;
      }

      if (res.error) {
        throw res;
      }

      // Support both legacy payload.threads (object map) and newer payload.mercury_payload.threads (array)
      let threadsData = res.payload?.mercury_payload?.threads || res.payload?.threads;
      
      if (!threadsData) {
        callback({ 
          error: `Could not find thread "${searchQuery}".`,
          details: "The thread may not exist or access may be restricted."
        });
        return returnPromise;
      }

      // Convert legacy object format to array if needed
      if (!Array.isArray(threadsData)) {
        threadsData = Object.values(threadsData);
      }

      const threads = threadsData.map(utils.formatThread);
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
