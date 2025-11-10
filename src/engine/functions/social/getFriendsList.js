"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return async function getFriendsList(userID, callback) {
    if (api.friend && api.friend.list) {
      return api.friend.list(userID || ctx.userID, callback);
    } else {
      throw new Error("friend.list function not available");
    }
  };
};
