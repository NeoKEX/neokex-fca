"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function refreshFb_dtsg(callback) {
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
      const resp = await utils.get("https://www.facebook.com/", ctx.jar, null, ctx.globalOptions, { noRef: true });
      
      const html = resp.body;
      const dtsg = utils.getFrom(html, '"token":"', '"');
      const jazoest = `2${Array.from(dtsg).reduce((a, b) => a + b.charCodeAt(0), '')}`;

      if (dtsg) {
        ctx.fb_dtsg = dtsg;
        ctx.jazoest = jazoest;
        cb(null, { fb_dtsg: dtsg, jazoest: jazoest });
      } else {
        throw new Error("Failed to extract fb_dtsg from response");
      }
    } catch (err) {
      utils.error("refreshFb_dtsg", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
