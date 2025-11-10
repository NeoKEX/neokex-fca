"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return async function addUserToGroup(userID, threadID, callback) {
    if (api.gcmember) {
      return api.gcmember("add", userID, threadID, callback);
    } else {
      throw new Error("gcmember function not available");
    }
  };
};
