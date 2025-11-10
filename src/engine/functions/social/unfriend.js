"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function unfriend(userID, callback) {
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
      if (!userID) throw new Error("userID is required");

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "FriendingCometUnfriendMutation",
        variables: JSON.stringify({
          input: {
            client_mutation_id: utils.getGUID(),
            actor_id: ctx.userID,
            friend_id: userID
          }
        }),
        server_timestamps: true,
        doc_id: "5000603053365986"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, { userID: userID });
    } catch (err) {
      utils.error("unfriend", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
