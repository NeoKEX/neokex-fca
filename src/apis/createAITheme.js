/**
 * @by Allou Mohamed
 * do not remove the author name to get more updates
 */

"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function createAITheme(prompt, callback) {
    const form = {
      av: ctx.i_userID || ctx.userID,
      __user: ctx.i_userID || ctx.userID,
      __a: "1",
      __req: "1",
      __hs: ctx.__hs || "19742.HYP:comet_pkg.2.1..2.1",
      dpr: "1",
      __ccg: "EXCELLENT",
      __rev: ctx.__rev || "1017526459",
      __s: ctx.__s || ":hbexez:79z5zq",
      __hsi: ctx.__hsi || "7448759542765711111",
      __dyn: ctx.__dyn || "",
      __csr: ctx.__csr || "",
      __comet_req: "15",
      fb_dtsg: ctx.fb_dtsg,
      jazoest: ctx.jazoest,
      lsd: ctx.lsd,
      qpl_active_flow_ids: "25308101,25309433,521482085",
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "useGenerateAIThemeMutation",
      variables: JSON.stringify({
        input: {
          client_mutation_id: "1",
          actor_id: ctx.i_userID || ctx.userID,
          bypass_cache: true,
          caller: "MESSENGER",
          num_themes: 1,
          prompt: prompt
        }
      }),
      server_timestamps: true,
      doc_id: "23873748445608673",
      fb_api_analytics_tags: JSON.stringify([
        "qpl_active_flow_ids=25308101,25309433,521482085"
      ])
    };

    const customHeaders = {
      "x-fb-friendly-name": "useGenerateAIThemeMutation",
      "x-fb-lsd": ctx.lsd
    };

    const promise = defaultFuncs
      .post("https://web.facebook.com/api/graphql/", ctx.jar, form, null, customHeaders)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.errors) {
          throw resData.errors;
        }
        return resData.data.xfb_generate_ai_themes_from_prompt.themes;
      });

    if (callback) {
      promise.then(data => callback(null, data)).catch(err => {
        utils.error("createAITheme", err.message || err);
        callback(err);
      });
      return;
    }

    return promise.catch(err => {
      utils.error("createAITheme", err.message || err);
      throw err;
    });
  };
};
