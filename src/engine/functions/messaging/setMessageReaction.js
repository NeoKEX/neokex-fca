"use strict";

const utils = require('../../../helpers');
// @NethWs3Dev

module.exports = function (defaultFuncs, api, ctx) {
  return async (reaction, messageID, callback) => {
    let _callback;
    let useCallback = false;
    
    if (typeof messageID === 'function') {
      callback = messageID;
      messageID = null;
    }
    
    if (callback && typeof callback === 'function') {
      _callback = callback;
      useCallback = true;
    }

    try {
      if (!reaction && reaction !== "") {
        const err = new Error("Please enter a valid emoji.");
        if (useCallback) {
          _callback(err);
          return;
        }
        throw err;
      }
      
      if (!messageID) {
        const err = new Error("Please provide a message ID.");
        if (useCallback) {
          _callback(err);
          return;
        }
        throw err;
      }

      const form = {
        doc_id: "1491398900900362",
        variables: JSON.stringify({
          data: {
            client_mutation_id: ctx.clientMutationId++,
            actor_id: ctx.userID,
            action: reaction === "" ? "REMOVE_REACTION" : "ADD_REACTION",
            message_id: messageID,
            reaction
          }
        }),
        dpr: 1
      };

      const defData = await defaultFuncs.post(
        "https://www.facebook.com/webgraphql/mutation/",
        ctx.jar,
        form
      );
      
      const resData = await utils.parseAndCheckLogin(ctx, defaultFuncs)(defData);
      
      if (!resData || resData.error) {
        const err = new Error(resData?.error || "setMessageReaction failed.");
        if (useCallback) {
          _callback(err);
          return;
        }
        throw err;
      }

      if (useCallback) {
        _callback(null);
      }
      return null;
    } catch (err) {
      if (useCallback) {
        _callback(err);
        return;
      }
      throw err;
    }
  };
};
