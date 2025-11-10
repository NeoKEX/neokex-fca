"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeAvatar(image, caption, callback) {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof caption === "function") {
      callback = caption;
      caption = "";
    }

    const cb = callback || ((err, data) => {
      if (err) return rejectFunc(err);
      resolveFunc(data);
    });

    try {
      if (!image) throw new Error("image is required");
      
      if (!utils.isReadableStream(image)) {
        throw new Error("Image should be a readable stream");
      }

      const uploadResponse = await defaultFuncs.postFormData(
        "https://www.facebook.com/profile/picture/upload/",
        ctx.jar,
        { profile_id: ctx.userID, photo: image, caption: caption || "" },
        {}
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (uploadResponse.error || !uploadResponse.payload) {
        throw new Error("Failed to upload avatar");
      }

      cb(null, {
        userID: ctx.userID,
        imageID: uploadResponse.payload.fbid
      });
    } catch (err) {
      utils.error("changeAvatar", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
