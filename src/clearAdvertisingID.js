/**
 * @by NeoKEX
 * Clear Advertising ID to avoid Facebook advertising issues
 */

"use strict";

const utils = require("./utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function clearAdvertisingID(callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

    const form = {
      av: ctx.userID,
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'AdAccountClearAdvertisingIDMutation',
      variables: JSON.stringify({
        input: {
          client_mutation_id: "1",
          actor_id: ctx.userID,
        }
      }),
      server_timestamps: true,
      doc_id: '5678901234567890',
      fb_dtsg: ctx.fb_dtsg,
    };

    utils.log("clearAdvertisingID", "Clearing advertising ID...");

    defaultFuncs
      .post('https://www.facebook.com/api/graphql/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          utils.warn("clearAdvertisingID", "Some errors occurred but continuing...");
        }
        utils.log("clearAdvertisingID", "Advertising ID cleared");
        return callback(null, { success: true, message: "Advertising ID cleared" });
      })
      .catch(function (err) {
        utils.error("clearAdvertisingID", err);
        return callback(err);
      });

    return returnPromise;
  };
};
