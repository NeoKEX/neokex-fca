"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return async function removeUserFromGroup(userID, threadID, callback) {
    if (api.gcmember) {
      return api.gcmember("remove", userID, threadID, callback);
    } else {
      throw new Error("gcmember function not available");
    }
  };
};
