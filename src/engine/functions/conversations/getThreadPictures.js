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
        thread_id: threadID,
        offset: offset,
        limit: limit
      };

      const resData = await defaultFuncs
        .get("https://www.facebook.com/ajax/mercury/attachments.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(resData.error);
      }

      const pictures = [];
      if (resData.payload && resData.payload.attachments) {
        resData.payload.attachments.forEach(attachment => {
          if (attachment.photo) {
            pictures.push({
              id: attachment.photo.fbid,
              uri: attachment.photo.uri,
              width: attachment.photo.width,
              height: attachment.photo.height
            });
          }
        });
      }

      cb(null, pictures);
    } catch (err) {
      utils.error("getThreadPictures", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
