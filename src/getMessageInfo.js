"use strict";

const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function getMessageInfo(threadID, messageID, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, data) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }

    if (!threadID || !messageID) {
      return callback({ error: "getMessageInfo: need threadID and messageID" });
    }

    const form = {
      av: ctx.globalOptions.pageID,
      queries: JSON.stringify({
        o0: {
          doc_id: "1768656253222505",
          query_params: {
            thread_and_message_id: {
              thread_id: threadID,
              message_id: messageID,
            },
          },
        },
      }),
    };

    defaultFuncs
      .post("https://www.facebook.com/api/graphqlbatch/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData[resData.length - 1].error_results > 0) {
          throw resData[0].o0.errors;
        }

        if (resData[resData.length - 1].successful_results === 0) {
          throw {
            error: "getMessageInfo: there was no successful_results",
            res: resData,
          };
        }

        const messageData = resData[0].o0.data.message;
        
        if (!messageData) {
          return callback(new Error("Message not found"));
        }

        const messageInfo = {
          messageID: messageID,
          threadID: threadID,
          senderID: messageData.message_sender ? messageData.message_sender.id : null,
          body: messageData.message && messageData.message.text ? messageData.message.text : null,
          timestamp: messageData.timestamp_precise,
          attachments: messageData.blob_attachments 
            ? messageData.blob_attachments.map(att => {
                try {
                  const formatted = utils._formatAttachment(att);
                  return formatted;
                } catch (ex) {
                  return {
                    ...att,
                    error: ex,
                    type: "unknown",
                  };
                }
              })
            : messageData.extensible_attachment && Object.keys(messageData.extensible_attachment).length > 0
              ? [{
                  type: "share",
                  ID: messageData.extensible_attachment.legacy_attachment_id,
                  url: messageData.extensible_attachment.story_attachment.url,
                  title: messageData.extensible_attachment.story_attachment.title_with_entities.text,
                  description: messageData.extensible_attachment.story_attachment.description.text,
                  source: messageData.extensible_attachment.story_attachment.source,
                  image: ((messageData.extensible_attachment.story_attachment.media || {}).image || {}).uri,
                  width: ((messageData.extensible_attachment.story_attachment.media || {}).image || {}).width,
                  height: ((messageData.extensible_attachment.story_attachment.media || {}).image || {}).height,
                  playable: (messageData.extensible_attachment.story_attachment.media || {}).is_playable || false,
                  duration: (messageData.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,
                }]
              : [],
          reactions: messageData.message_reactions 
            ? messageData.message_reactions.map(r => ({
                userID: r.user.id,
                reaction: r.reaction,
              }))
            : [],
          mentions: messageData.message && messageData.message.ranges 
            ? messageData.message.ranges.map(range => ({
                userID: range.entity ? range.entity.id : null,
                text: messageData.message.text.substring(
                  range.offset,
                  range.offset + range.length
                ),
                offset: range.offset,
                length: range.length,
              }))
            : [],
          replyTo: messageData.replied_to_message 
            ? {
                messageID: messageData.replied_to_message.message_id,
                senderID: messageData.replied_to_message.message_sender 
                  ? messageData.replied_to_message.message_sender.id 
                  : null,
                snippet: messageData.replied_to_message.snippet,
              }
            : null,
          __typename: messageData.__typename,
        };

        callback(null, messageInfo);
      })
      .catch(function (err) {
        utils.error("getMessageInfo", err);
        return callback(err);
      });

    return returnPromise;
  };
};
