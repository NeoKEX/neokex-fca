"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function setPostReaction(postID, reactionType, callback) {
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
      if (!postID) throw new Error("postID is required");
      if (!reactionType) throw new Error("reactionType is required");

      const reactionMap = {
        'like': '1635855486666999',
        'love': '1678524932434102',
        'care': '613557422527858',
        'haha': '115940658764963',
        'wow': '478547315650144',
        'sad': '908563459236466',
        'angry': '444813342392137'
      };

      const reaction = reactionMap[reactionType.toLowerCase()] || reactionType;

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "CometUFIFeedbackReactMutation",
        variables: JSON.stringify({
          input: {
            client_mutation_id: utils.getGUID(),
            actor_id: ctx.userID,
            feedback_id: Buffer.from('feedback:' + postID).toString('base64'),
            feedback_reaction_id: reaction
          }
        }),
        server_timestamps: true,
        doc_id: "4769042373179384"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.errors) {
        throw new Error(JSON.stringify(resData.errors));
      }

      cb(null, {
        postID: postID,
        reactionType: reactionType
      });
    } catch (err) {
      utils.error("setPostReaction", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
