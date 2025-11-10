"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function changeAdminStatus(threadID, adminIDs, adminStatus, callback) {
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
      if (!adminIDs) throw new Error("adminIDs is required");
      
      const adminIDsArray = Array.isArray(adminIDs) ? adminIDs : [adminIDs];
      const makeAdmin = adminStatus !== false;

      const form = {
        thread_fbid: threadID
      };

      let i = 0;
      for (const adminID of adminIDsArray) {
        form[`admin_ids[${i++}]`] = adminID;
      }
      form["add"] = makeAdmin;

      const resData = await defaultFuncs
        .post("https://www.facebook.com/messaging/save_admins/?dpr=1", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        switch (resData.error) {
          case 1976004:
            throw new Error("Cannot alter admin status: you are not an admin.");
          case 1357031:
            throw new Error("Cannot alter admin status: this thread is not a group chat.");
          default:
            throw new Error("Cannot alter admin status: unknown error.");
        }
      }

      cb(null, {
        threadID: threadID,
        adminIDs: adminIDsArray,
        adminStatus: makeAdmin
      });
    } catch (err) {
      utils.error("changeAdminStatus", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
