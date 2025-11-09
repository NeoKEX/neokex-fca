"use strict";

const utils = require("../utils");

const THEME_MAP = {
  default: null,
  blue: "196241301102133",
  purple: "271607034185782",
  pink: "205936620454039",
  orange: "370940413392601",
  green: "2873642906081474",
  red: "2136751179887052",
  yellow: "174636906462322",
  teal: "417639218648241",
  love: "169463077092846",
  gradient_blue_purple: "275041734441112",
  gradient_purple_pink: "732092925045029",
  gradient_red_orange: "2058653964378557",
  sunshine: "523051464804306",
  ocean: "2873642906081474",
  berry: "2533652183614000",
  citrus: "370940413392601",
  candy: "205936620454039",
};

module.exports = function (defaultFuncs, api, ctx) {
  return function setTheme(themeOrID, threadID, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc();
      };
    }

    let themeID = themeOrID;
    
    if (typeof themeOrID === 'string' && THEME_MAP.hasOwnProperty(themeOrID.toLowerCase())) {
      themeID = THEME_MAP[themeOrID.toLowerCase()];
    }

    const form = {
      dpr: 1,
      queries: JSON.stringify({
        o0: {
          doc_id: "1727493033983591",
          query_params: {
            data: {
              actor_id: ctx.userID,
              client_mutation_id: "0",
              source: "SETTINGS",
              theme_id: themeID,
              thread_id: threadID,
            },
          },
        },
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData[resData.length - 1].error_results > 0) {
          throw new utils.CustomError(resData[0].o0.errors);
        }

        return callback();
      })
      .catch(function (err) {
        utils.error("setTheme", err);
        return callback(err);
      });

    return returnPromise;
  };
};
