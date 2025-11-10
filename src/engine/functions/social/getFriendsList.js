"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getFriendsList(userID, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof userID === 'function') {
      callback = userID;
      userID = ctx.userID;
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      const targetUserID = userID || ctx.userID;

      const form = {
        fb_api_req_friendly_name: "FriendingCometFriendsListPaginationQuery",
        variables: JSON.stringify({
          userID: targetUserID,
          count: 50,
          scale: 1
        }),
        doc_id: "7127709577291210"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error("friend.list failed: " + (resData.error || "Unknown error"));
      }

      if (!resData.data || !resData.data.user || !resData.data.user.friends) {
        cb(null, []);
        return returnPromise;
      }

      const friends = resData.data.user.friends.edges.map(edge => ({
        userID: edge.node.id,
        name: edge.node.name,
        firstName: edge.node.firstName,
        vanity: edge.node.url ? edge.node.url.split('/').pop() : null,
        profileUrl: edge.node.url,
        gender: edge.node.gender,
        isFriend: true,
        mutualFriends: edge.node.mutual_friends ? edge.node.mutual_friends.count : 0
      }));

      cb(null, friends);
    } catch (err) {
      utils.error("getFriendsList", err.message || err);
      cb(new Error("friend.list failed: " + (err.message || err)));
    }

    return returnPromise;
  };
};
