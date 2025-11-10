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

      if (!resData) {
        cb(null, null);
        return returnPromise;
      }

      if (resData.error) {
        throw resData;
      }

      if (!resData.payload || !resData.payload.imagesData || !Array.isArray(resData.payload.imagesData)) {
        cb(null, null);
        return returnPromise;
      }

      const imagePromises = resData.payload.imagesData.map(async (image) => {
        try {
          const imageForm = {
            thread_id: threadID,
            image_id: image.fbid
          };
          const imageRes = await defaultFuncs
            .post("https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php", ctx.jar, imageForm)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

          if (!imageRes || imageRes.error) {
            return null;
          }

          if (!imageRes.jsmods || !imageRes.jsmods.require || 
              !imageRes.jsmods.require[0] || !imageRes.jsmods.require[0][3] ||
              !imageRes.jsmods.require[0][3][1]) {
            return null;
          }

          const queryMetadata = imageRes.jsmods.require[0][3][1].query_metadata;
          const queryResults = imageRes.jsmods.require[0][3][1].query_results;
          
          if (!queryMetadata || !queryMetadata.query_path || !queryMetadata.query_path[0] ||
              !queryResults) {
            return null;
          }

          const queryThreadID = queryMetadata.query_path[0].message_thread;
          if (!queryThreadID || !queryResults[queryThreadID] || 
              !queryResults[queryThreadID].message_images ||
              !queryResults[queryThreadID].message_images.edges ||
              !queryResults[queryThreadID].message_images.edges[0]) {
            return null;
          }

          const imageData = queryResults[queryThreadID].message_images.edges[0].node.image2;
          return imageData || null;
        } catch (err) {
          return null;
        }
      });

      const images = await Promise.all(imagePromises);
      const filteredImages = images.filter(img => img !== null);
      cb(null, filteredImages.length > 0 ? filteredImages : null);
    } catch (err) {
      utils.error("getThreadPictures", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
