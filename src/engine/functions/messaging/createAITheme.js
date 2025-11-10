"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return function createAITheme(prompt, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

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

    const promise = defaultFuncs
      .post("https://web.facebook.com/api/graphql/", ctx.jar, form)
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
      return returnPromise;
    }

    return promise.catch(err => {
      utils.error("createAITheme", err.message || err);
      throw err;
    });
  };
};
