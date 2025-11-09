"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function getActiveStatus(userIDs, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

    if (!Array.isArray(userIDs)) {
      userIDs = [userIDs];
    }

    const form = {
      queries: JSON.stringify({
        o0: {
          doc_id: "8836890259664316",
          query_params: {
            0: {
              user_ids: userIDs,
            },
          },
        },
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.error || resData[0].error_results > 0) {
          throw resData;
        }

        const activeStatuses = {};
        const buddyList = resData[0] && resData[0].o0 && resData[0].o0.data 
          ? resData[0].o0.data.buddy_list 
          : null;
        
        if (buddyList && buddyList.availabilities) {
          Object.entries(buddyList.availabilities).forEach(function ([id, status]) {
            const isActive = status && status.a === 2;
            const lastActive = status && status.la ? status.la * 1000 : null;
            
            activeStatuses[id] = {
              userID: id,
              isActive: isActive,
              lastActive: lastActive,
              status: isActive ? 'active' : 'offline',
              lastActiveTime: lastActive ? new Date(lastActive).toISOString() : null,
            };
          });
        }

        userIDs.forEach(function (id) {
          if (!activeStatuses[id]) {
            activeStatuses[id] = {
              userID: id,
              isActive: false,
              lastActive: null,
              status: 'unknown',
              lastActiveTime: null,
            };
          }
        });

        callback(null, userIDs.length === 1 ? activeStatuses[userIDs[0]] : activeStatuses);
      })
      .catch(function (err) {
        utils.error("getActiveStatus", err);
        return callback(err);
      });

    return returnPromise;
  };
};
