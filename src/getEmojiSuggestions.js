"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function getEmojiSuggestions(text, callback) {
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

    if (!text || text.trim().length === 0) {
      return callback(null, []);
    }

    const form = {
      doc_id: "5238742219523543",
      variables: JSON.stringify({
        query: text,
        limit: 10,
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData;
        }

        const suggestions = [];
        
        if (resData.data && resData.data.emoji_search && resData.data.emoji_search.results) {
          resData.data.emoji_search.results.forEach(function (emoji) {
            if (emoji) {
              suggestions.push({
                emoji: emoji.emoji,
                name: emoji.name,
                keywords: emoji.keywords || [],
              });
            }
          });
        }

        callback(null, suggestions);
      })
      .catch(function (err) {
        utils.error("getEmojiSuggestions", err);
        return callback(err);
      });

    return returnPromise;
  };
};
