"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return async function createNewGroup(participantIDs, groupTitle, callback) {
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
      if (!participantIDs || !Array.isArray(participantIDs) || participantIDs.length === 0) {
        throw new Error("participantIDs must be a non-empty array");
      }

      const messageAndOTID = utils.generateOfflineThreadingID();
      const form = {
        client: "mercury",
        action_type: "ma-type:log-message",
        author: "fbid:" + ctx.userID,
        thread_id: "",
        author_email: "",
        coordinates: "",
        timestamp: Date.now(),
        timestamp_absolute: "Today",
        timestamp_relative: utils.generateTimestampRelative(),
        timestamp_time_passed: "0",
        is_unread: false,
        is_cleared: false,
        is_forward: false,
        is_filtered_content: false,
        is_filtered_content_bh: false,
        is_filtered_content_account: false,
        is_filtered_content_quasar: false,
        is_filtered_content_invalid_app: false,
        is_spoof_warning: false,
        source: "source:chat:web",
        "source_tags[0]": "source:chat",
        body: groupTitle || "",
        html_body: false,
        ui_push_phase: "V3",
        status: "0",
        offline_threading_id: messageAndOTID,
        message_id: messageAndOTID,
        threading_id: utils.generateThreadingID(ctx.clientID),
        "ephemeral_ttl_mode:": "0",
        manual_retry_cnt: "0",
        signatureID: utils.getSignatureID(),
        "replied_to_message_id": ""
      };

      participantIDs.forEach((id, i) => {
        form["specific_to_list[" + i + "]"] = "fbid:" + id;
      });
      form["specific_to_list[" + participantIDs.length + "]"] = "fbid:" + ctx.userID;
      form["client_thread_id"] = "root:" + messageAndOTID;

      if (groupTitle) {
        form["thread_name"] = groupTitle;
      }

      const resData = await defaultFuncs
        .post("https://www.facebook.com/messaging/send/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (resData.error) {
        throw new Error(resData.error);
      }

      const threadID = resData.payload && resData.payload.thread_id ? resData.payload.thread_id : resData.payload.threads[0];

      cb(null, {
        threadID: threadID,
        participantIDs: participantIDs,
        groupTitle: groupTitle || ""
      });
    } catch (err) {
      utils.error("createNewGroup", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
