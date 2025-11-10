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

      let form = {
        thread_id: threadID,
        offset: offset,
        limit: limit
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw resData;
      }

      const imagePromises = resData.payload.imagesData.map(async (image) => {
        const imageForm = {
          thread_id: threadID,
          image_id: image.fbid
        };
        const imageRes = await defaultFuncs
          .post("https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php", ctx.jar, imageForm)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

        if (imageRes.error) {
          throw imageRes;
        }

        const queryThreadID = imageRes.jsmods.require[0][3][1].query_metadata.query_path[0].message_thread;
        const imageData = imageRes.jsmods.require[0][3][1].query_results[queryThreadID].message_images.edges[0].node.image2;
        return imageData;
      });

      const images = await Promise.all(imagePromises);
      cb(null, images);
    } catch (err) {
      utils.error("getThreadPictures", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
