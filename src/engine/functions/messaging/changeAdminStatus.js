"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeAdminStatus(threadID, adminIDs, adminStatus, callback) {
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
      if (!adminIDs) throw new Error("adminIDs is required");
      
      const adminIDsArray = Array.isArray(adminIDs) ? adminIDs : [adminIDs];
      const makeAdmin = adminStatus !== false;

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: makeAdmin ? "MessengerThreadAddAdminMutation" : "MessengerThreadRemoveAdminMutation",
        variables: JSON.stringify({
          input: {
            client_mutation_id: utils.getGUID(),
            actor_id: ctx.userID,
            thread_key: threadID,
            admin_ids: adminIDsArray
          }
        }),
        server_timestamps: true,
        doc_id: makeAdmin ? "2504913949542429" : "2504913949542430",
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, {
        threadID: threadID,
        adminIDs: adminIDsArray,
        adminStatus: makeAdmin
      });
    } catch (err) {
      utils.error("changeAdminStatus", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
