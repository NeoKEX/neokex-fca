"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function searchForThread(searchName, callback) {
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
      if (!searchName) throw new Error("searchName is required");

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "LSPlatformGraphQLLightspeedRequestQuery",
        variables: JSON.stringify({
          search_query: searchName,
          result_limit: 10,
          messenger_commerce: true,
          include_games: true,
          internal_bot: false,
          vc_endpoint: false
        }),
        server_timestamps: true,
        doc_id: "1746741182112617"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData) {
        throw new Error("No response data received");
      }

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      const threads = [];
      if (resData.data && resData.data.entities_named && resData.data.entities_named.search_results) {
        const results = resData.data.entities_named.search_results.edges || [];
        results.forEach(edge => {
          if (edge.node) {
            const node = edge.node;
            threads.push({
              threadID: node.id,
              name: node.name,
              snippet: edge.subtext || "",
              type: node.category_type,
              profilePicture: node.profile_picture?.uri,
              isVerified: node.is_verified,
              url: node.url
            });
          }
        });
      }

      cb(null, threads);
    } catch (err) {
      utils.error("searchForThread", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
