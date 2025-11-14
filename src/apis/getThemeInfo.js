"use strict";

const utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getThemeInfo(threadID, callback) {
    if (!threadID) {
      const error = new Error("threadID is required");
      if (callback) return callback(error);
      throw error;
    }

    let resolveFunc, rejectFunc;
    const promise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      
      if (!threadInfo || threadInfo.length === 0) {
        throw new Error("Could not retrieve thread info");
      }

      const info = Array.isArray(threadInfo) ? threadInfo[0] : threadInfo;
      
      const themeInfo = {
        threadID: threadID,
        threadName: info.threadName || info.name || '',
        color: info.color || null,
        emoji: info.emoji || '👍',
        theme_id: info.theme_id || info.themeID || null,
        theme_color: info.theme_color || info.color || null,
        gradient_colors: info.gradient_colors || null,
        is_default: !info.color && !info.theme_id
      };

      if (callback) {
        callback(null, themeInfo);
      } else {
        resolveFunc(themeInfo);
      }
    } catch (err) {
      utils.error("getThemeInfo", err);
      if (callback) {
        callback(err);
      } else {
        rejectFunc(err);
      }
    }

    return promise;
  };
};
