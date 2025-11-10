"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function deleteThread(threadID, callback) {
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
      if (!threadID) throw new Error("threadID is required");

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "MessagingThreadDeleteMutation",
        variables: JSON.stringify({
          input: {
            client_mutation_id: utils.getGUID(),
            actor_id: ctx.userID,
            thread_id: threadID
          }
        }),
        server_timestamps: true,
        doc_id: "3495917127177638"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, { threadID: threadID });
    } catch (err) {
      utils.error("deleteThread", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
