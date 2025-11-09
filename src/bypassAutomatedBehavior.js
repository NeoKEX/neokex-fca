/**
 * @by NeoKEX
 * Bypass Facebook Automated Behavior Detection
 * Helps avoid restrictions when using the bot
 */

"use strict";

const utils = require("./utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function bypassAutomatedBehavior(callback) {
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

    const bypassForm = {
      av: ctx.userID,
      fb_api_caller_class: 'RelayModern',
      fb_api_req_friendly_name: 'FBScrapingWarningMutation',
      variables: '{}',
      server_timestamps: true,
      doc_id: '6339492849481770',
      fb_dtsg: ctx.fb_dtsg,
      jazoest: ctx.jazoest || '22810',
    };

    utils.log("bypassAutomatedBehavior", "Attempting to bypass automated behavior detection...");

    defaultFuncs
      .post('https://www.facebook.com/api/graphql/', ctx.jar, bypassForm)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData.errors;
        }
        utils.log("bypassAutomatedBehavior", "Bypass successful");
        return callback(null, { success: true, message: "Automated behavior bypass completed" });
      })
      .catch(function (err) {
        utils.error("bypassAutomatedBehavior", err);
        return callback(err);
      });

    return returnPromise;
  };
};
