"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeBio(bio, publish, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof publish === "function") {
      callback = publish;
      publish = false;
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (bio === undefined || bio === null) throw new Error("bio is required");

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "ProfileCometSetBioMutation",
        variables: JSON.stringify({
          input: {
            bio: bio,
            publish_bio_feed_story: publish || false,
            actor_id: ctx.userID,
            client_mutation_id: utils.getGUID()
          }
        }),
        server_timestamps: true,
        doc_id: "2725043627607610"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, { bio: bio });
    } catch (err) {
      utils.error("changeBio", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
