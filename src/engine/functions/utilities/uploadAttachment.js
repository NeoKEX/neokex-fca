"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function uploadAttachment(attachment, callback) {
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
      if (!attachment) throw new Error("attachment is required");
      
      if (!utils.isReadableStream(attachment)) {
        throw new Error("Attachment should be a readable stream");
      }

      const uploadResponse = await defaultFuncs.postFormData(
        "https://upload.facebook.com/ajax/mercury/upload.php",
        ctx.jar,
        { upload_1024: attachment, voice_clip: "true" },
        {}
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (uploadResponse.error || !uploadResponse.payload) {
        throw new Error("Failed to upload attachment");
      }

      const metadata = uploadResponse.payload.metadata[0];
      cb(null, metadata);
    } catch (err) {
      utils.error("uploadAttachment", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
