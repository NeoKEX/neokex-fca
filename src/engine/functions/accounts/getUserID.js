"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getUserID(name, callback) {
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
      if (!name) throw new Error("name is required");

      const profileUrl = name.includes('facebook.com') ? name : `https://www.facebook.com/${name}`;
      
      const resp = await utils.get(profileUrl, ctx.jar, null, ctx.globalOptions);
      const html = resp.body;
      
      let userID = null;
      const patterns = [
        /"userID":"(\d+)"/,
        /"entity_id":"(\d+)"/,
        /profile_id=(\d+)/,
        /"profileID":"(\d+)"/
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          userID = match[1];
          break;
        }
      }

      if (!userID) {
        throw new Error("Could not extract user ID from profile");
      }

      const result = [{
        userID: userID,
        name: name,
        profileUrl: profileUrl
      }];

      cb(null, result);
    } catch (err) {
      utils.error("getUserID", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
