"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function votePoll(pollID, optionID, threadID, callback) {
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
      doc_id: "5903223929735825",
      variables: JSON.stringify({
        input: {
          poll_id: pollID,
          poll_question_option_id: optionID,
          actor_id: ctx.userID,
          client_mutation_id: Math.round(Math.random() * 1e19).toString(),
        },
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData;
        }

        callback(null, {
          success: true,
          pollID: pollID,
          optionID: optionID,
          threadID: threadID,
        });
      })
      .catch(function (err) {
        utils.error("votePoll", err);
        return callback(err);
      });

    return returnPromise;
  };
};
