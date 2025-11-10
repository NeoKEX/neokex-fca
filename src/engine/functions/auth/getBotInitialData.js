"use strict";

const utils = require("../../../helpers");
// @NethWs3Dev

module.exports = (defaultFuncs, api, ctx) => {
  return async (callback) => {
  let resolveFunc = () => {};
  let rejectFunc = () => {};
  const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
  });
  if (!callback) {
      callback = (err, data) => {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
  }
  utils.log("Fetching account info...");
  api.httpGet(`https://www.facebook.com/profile.php?id=${ctx.userID}`, null, {
      customUserAgent: utils.windowsUserAgent
  }, (err, data) => {
  
      if (err) {
        return callback(err);
      }
      
      const profileMatch = data.body.match(/"CurrentUserInitialData",\[\],\{(.*?)\},(.*?)\]/);
      if (profileMatch && profileMatch[1]){
        try {
          const accountJson = JSON.parse(`{${profileMatch[1]}}`);
          accountJson.name = accountJson.NAME;
          accountJson.uid = accountJson.USER_ID;
          delete accountJson.NAME;
          delete accountJson.USER_ID;
          return callback(null, {
            ...accountJson
          });
        } catch (parseErr) {
          return callback(parseErr);
        }
      } else {
        return callback(new Error("Could not parse account data. Maybe there's a limitation due to spam requests. You can try again later."));
      }
  }, true);
  return returnPromise;
  };
};
 
 