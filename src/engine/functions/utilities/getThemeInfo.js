"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getThemeInfo(threadID, callback) {
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

      const threadInfo = await api.getThreadInfo(threadID);
      
      if (!threadInfo) {
        throw new Error("Could not get thread info");
      }

      cb(null, {
        threadID: threadID,
        themeID: threadInfo.themeID,
        emoji: threadInfo.emoji,
        color: threadInfo.color
      });
    } catch (err) {
      utils.error("getThemeInfo", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
