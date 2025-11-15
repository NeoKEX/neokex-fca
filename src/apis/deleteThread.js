"use strict";

const utils = require('../utils');

module.exports = (defaultFuncs, api, ctx) => {
  return async function deleteThread(threadID, callback) {
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
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "MessengerThreadDeleteMutation",
        av: ctx.i_userID || ctx.userID,
        doc_id: "5661930250517471",
        variables: JSON.stringify({
          input: {
            thread_fbid: threadID,
            actor_id: ctx.i_userID || ctx.userID,
            client_mutation_id: Math.round(Math.random() * 1024).toString()
          }
        })
      };

      const res = await defaultFuncs.post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (res.errors) {
        throw res;
      }

      callback(null, { success: true });
    } catch (err) {
      utils.error("deleteThread", err);
      callback(err);
    }

    return returnPromise;
  };
};
