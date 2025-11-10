"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return async function getTheme(threadID, callback) {
    if (api.theme) {
      return api.theme("list", threadID, callback);
    } else {
      throw new Error("theme function not available");
    }
  };
};
