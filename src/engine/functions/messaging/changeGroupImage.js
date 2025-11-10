"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeGroupImage(image, threadID, callback) {
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
      if (!threadID) throw new Error("threadID is required");
      if (!image) throw new Error("image is required");
      
      if (!utils.isReadableStream(image)) {
        throw new Error("Image should be a readable stream");
      }

      const uploadResponse = await defaultFuncs.postFormData(
        "https://upload.facebook.com/ajax/mercury/upload.php",
        ctx.jar,
        { profile_id: threadID, photo: image },
        {}
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (uploadResponse.error || !uploadResponse.payload) {
        throw new Error("Failed to upload image");
      }

      const imageID = uploadResponse.payload.fbid;

      const form = {
        thread_image_id: imageID,
        thread_id: threadID
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/messaging/set_thread_image/?dpr=1", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(resData.error);
      }

      cb(null, {
        threadID: threadID,
        imageID: imageID
      });
    } catch (err) {
      utils.error("changeGroupImage", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
