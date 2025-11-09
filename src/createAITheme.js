/**
 * @by Allou Mohamed & NeoKEX
 * Advanced AI Theme Generation with Facebook GraphQL API
 */

"use strict";

const utils = require("./utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function createAITheme(prompt, callback) {
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

    const form = {
      av: ctx.i_userID || ctx.userID,
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
      ]),
      fb_dtsg: ctx.fb_dtsg
    };

    defaultFuncs
      .post("https://web.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.errors) {
          throw resData.errors;
        }
        if (!resData.data || !resData.data.xfb_generate_ai_themes_from_prompt) {
          throw new Error("Invalid response from Facebook API");
        }
        return callback(null, resData.data.xfb_generate_ai_themes_from_prompt.themes);
      })
      .catch(function (err) {
        utils.error("createAITheme", err);
        return callback(err);
      });

    return returnPromise;
  };
};
