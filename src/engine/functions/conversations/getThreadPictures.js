"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function getThreadPictures(threadID, offset, limit, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof offset === "function") {
      callback = offset;
      offset = 0;
      limit = 50;
    } else if (typeof limit === "function") {
      callback = limit;
      limit = 50;
    }

    offset = offset || 0;
    limit = limit || 50;

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!threadID) throw new Error("threadID is required");

      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "MessengerThreadMediaQuery",
        variables: JSON.stringify({
          thread_key: threadID,
          limit: limit,
          offset: offset
        }),
        server_timestamps: true,
        doc_id: "4855856897800288"
      };

      try {
        const resData = await defaultFuncs
          .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

        const pictures = [];
        
        if (resData && resData.data && resData.data.message_thread) {
          const attachments = resData.data.message_thread.all_attachment || [];
          attachments.forEach(attachment => {
            if (attachment.__typename === "Photo" || attachment.photo) {
              const photo = attachment.photo || attachment;
              pictures.push({
                id: photo.id || photo.fbid,
                url: photo.image?.uri || photo.uri,
                width: photo.image?.width || photo.width,
                height: photo.image?.height || photo.height
              });
            }
          });
        }
        
        const result = pictures.length > 0 ? pictures[0] : null;
        cb(null, result);
      } catch (apiErr) {
        utils.warn("getThreadPictures", "Facebook API endpoint may have changed, returning null");
        cb(null, null);
      }
    } catch (err) {
      utils.error("getThreadPictures", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
