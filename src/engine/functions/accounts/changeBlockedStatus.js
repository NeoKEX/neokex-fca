"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeBlockedStatus(userID, block, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof block === "function") {
      callback = block;
      block = true;
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!userID) throw new Error("userID is required");

      const shouldBlock = block !== false;
      
      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: shouldBlock ? "FriendingCometBlockUserMutation" : "FriendingCometUnblockUserMutation",
        variables: JSON.stringify({
          input: {
            client_mutation_id: utils.getGUID(),
            actor_id: ctx.userID,
            user_id: userID
          }
        }),
        server_timestamps: true,
        doc_id: shouldBlock ? "4707600215949898" : "4707600216049898"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, {
        userID: userID,
        blocked: shouldBlock
      });
    } catch (err) {
      utils.error("changeBlockedStatus", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
