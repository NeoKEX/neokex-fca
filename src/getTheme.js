"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function getTheme(threadID, callback) {
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
      queries: JSON.stringify({
        o0: {
          doc_id: "3449967031715030",
          query_params: {
            id: threadID,
            message_limit: 0,
            load_messages: false,
            load_read_receipts: false,
            before: null,
          },
        },
      }),
      batch_name: "MessengerGraphQLThreadFetcher",
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.error) {
          throw resData;
        }

        const threadData = resData[0].o0.data.message_thread;
        
        if (!threadData) {
          throw new Error("Thread not found");
        }

        const themeInfo = {
          threadID: threadID,
          theme: threadData.thread_theme,
          color: threadData.customization_info && 
                 threadData.customization_info.outgoing_bubble_color
            ? threadData.customization_info.outgoing_bubble_color.slice(2)
            : null,
          emoji: threadData.customization_info
            ? threadData.customization_info.emoji
            : null,
          gradient: threadData.customization_info &&
                   threadData.customization_info.gradient_colors
            ? threadData.customization_info.gradient_colors
            : null,
          themeID: threadData.thread_theme ? threadData.thread_theme.id : null,
          themeName: threadData.thread_theme ? threadData.thread_theme.name : null,
          themeColors: threadData.thread_theme && threadData.thread_theme.theme_color
            ? threadData.thread_theme.theme_color
            : null,
          backgroundColor: threadData.thread_theme && threadData.thread_theme.background_color
            ? threadData.thread_theme.background_color
            : null,
          titleBarColor: threadData.thread_theme && threadData.thread_theme.title_bar_background_color
            ? threadData.thread_theme.title_bar_background_color
            : null,
          accessibilityLabel: threadData.thread_theme && threadData.thread_theme.accessibility_label
            ? threadData.thread_theme.accessibility_label
            : null,
        };

        callback(null, themeInfo);
      })
      .catch(function (err) {
        utils.error("getTheme", err);
        return callback(err);
      });

    return returnPromise;
  };
};
