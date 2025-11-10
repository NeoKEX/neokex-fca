"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function handleMessageRequest(threadID, accept, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof accept === "function") {
      callback = accept;
      accept = true;
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!threadID) throw new Error("threadID is required");

      const shouldAccept = accept !== false;
      
      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: shouldAccept ? "MessengerThreadlistAcceptThreadMutation" : "MessengerThreadlistDeleteThreadMutation",
        variables: JSON.stringify({
          input: {
            client_mutation_id: utils.getGUID(),
            actor_id: ctx.userID,
            thread_id: threadID
          }
        }),
        server_timestamps: true,
        doc_id: shouldAccept ? "3055967771174472" : "3055967771274472"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, {
        threadID: threadID,
        accepted: shouldAccept
      });
    } catch (err) {
      utils.error("handleMessageRequest", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
