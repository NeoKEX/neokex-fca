"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function searchMessages(query, threadID, limit, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof limit === 'function') {
      callback = limit;
      limit = 20;
    }

    if (!callback) {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

    limit = limit || 20;

    const form = {
      doc_id: "2848240308572736",
      variables: JSON.stringify({
        query: query,
        threadID: threadID,
        limit: limit,
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData;
        }

        const messages = [];
        
        if (resData.data && resData.data.message_search && resData.data.message_search.messages) {
          resData.data.message_search.messages.nodes.forEach(function (msg) {
            if (msg) {
              messages.push({
                messageID: msg.message_id,
                senderID: msg.message_sender ? msg.message_sender.id : null,
                threadID: threadID,
                body: msg.message ? msg.message.text : null,
                timestamp: msg.timestamp_precise,
                snippet: msg.snippet,
              });
            }
          });
        }

        callback(null, messages);
      })
      .catch(function (err) {
        utils.error("searchMessages", err);
        return callback(err);
      });

    return returnPromise;
  };
};
