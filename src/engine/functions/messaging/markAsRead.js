"use strict";
// @ChoruOfficial
const utils = require('../../../helpers');

/**
 * @param {Object} defaultFuncs
 * @param {Object} api
 * @param {Object} ctx
 */
module.exports = function (defaultFuncs, api, ctx) {
  /**
   * Marks a thread as read.
   * @param {string} threadID - The ID of the thread to mark as read.
   * @param {boolean} [read=true] - Whether to mark as read (true) or unread (false). Defaults to true.
   * @param {Function} [callback] - The callback function.
   * @returns {Promise<null|Error>} A Promise that resolves with null on success, or rejects with an Error.
   */
  return async function markAsRead(threadID, read, callback) {
    let userCallback = null;
    
    if (
      utils.getType(read) === "Function" ||
      utils.getType(read) === "AsyncFunction"
    ) {
      userCallback = read;
      read = true;
    } else if (callback) {
      userCallback = callback;
    }
    
    if (read == undefined) {
      read = true;
    }

    const form = {};

    if (typeof ctx.globalOptions.pageID !== "undefined") {
      form["source"] = "PagesManagerMessagesInterface";
      form["request_user_id"] = ctx.globalOptions.pageID;
      form["ids[" + threadID + "]"] = read;
      form["watermarkTimestamp"] = new Date().getTime();
      form["shouldSendReadReceipt"] = true;
      form["commerce_last_message_type"] = "";

      let resData;
      try {
        resData = await defaultFuncs
          .post(
            "https://www.facebook.com/ajax/mercury/change_read_status.php",
            ctx.jar,
            form,
          )
          .then(utils.saveCookies(ctx.jar))
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs));
      } catch (e) {
        if (userCallback) {
          userCallback(e);
          return;
        }
        throw e;
      }

      if (resData.error) {
        const err = resData.error;
        utils.error("markAsRead", err);
        if (userCallback) {
          userCallback(err);
          return;
        }
        throw err;
      }

      if (userCallback) {
        userCallback(null);
      }
      return null;
    } else {
      form["ids[" + threadID + "]"] = read;
      form["watermarkTimestamp"] = new Date().getTime();
      form["shouldSendReadReceipt"] = true;

      try {
        if (ctx.mqttClient) {
          const err = await new Promise((r) =>
            ctx.mqttClient.publish(
              "/mark_thread",
              JSON.stringify({
                threadID,
                mark: "read",
                state: read,
              }),
              { qos: 1, retain: false },
              r,
            ),
          );
          if (err) throw err;
          if (userCallback) {
            userCallback(null);
          }
          return null;
        } else {
          const resData = await defaultFuncs
            .post(
              "https://www.facebook.com/ajax/mercury/change_read_status.php",
              ctx.jar,
              form,
            )
            .then(utils.saveCookies(ctx.jar))
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

          if (resData.error) {
            const err = resData.error;
            utils.error("markAsRead", err);
            if (userCallback) {
              userCallback(err);
              return;
            }
            throw err;
          }

          if (userCallback) {
            userCallback(null);
          }
          return null;
        }
      } catch (e) {
        if (userCallback) {
          userCallback(e);
          return;
        }
        throw e;
      }
    }
  };
};
