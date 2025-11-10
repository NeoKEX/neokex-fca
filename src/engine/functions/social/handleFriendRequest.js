"use strict";

module.exports = function (defaultFuncs, api, ctx) {
  return async function handleFriendRequest(userID, accept, callback) {
    if (typeof accept === "function") {
      callback = accept;
      accept = true;
    }

    if (api.friend && api.friend.accept) {
      if (accept !== false) {
        return api.friend.accept(userID, callback);
      } else {
        throw new Error("Reject friend request not yet implemented");
      }
    } else {
      throw new Error("friend.accept function not available");
    }
  };
};
