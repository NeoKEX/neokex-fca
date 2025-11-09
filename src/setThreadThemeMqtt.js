/**
 * @by Allou Mohamed & NeoKEX
 * Set Thread Theme using MQTT
 */

"use strict";

const utils = require("./utils");

module.exports = function (defaultFuncs, api, ctx) {
  return function setThreadThemeMqtt(threadID, themeFBID, callback) {
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

    if (!ctx.mqttClient) {
      const error = new Error("Not connected to MQTT");
      utils.error("setThreadThemeMqtt", error);
      return callback(error);
    }

    try {
      ctx.wsReqNumber += 1;
      let baseTaskNumber = ++ctx.wsTaskNumber;

      const makeTask = (label, queueName, extraPayload = {}) => ({
        failure_count: null,
        label: String(label),
        payload: JSON.stringify({
          thread_key: threadID,
          theme_fbid: themeFBID,
          sync_group: 1,
          ...extraPayload,
        }),
        queue_name: typeof queueName === 'string' ? queueName : JSON.stringify(queueName),
        task_id: baseTaskNumber++,
      });

      const messages = [
        {
          label: 1013,
          queue: ['ai_generated_theme', String(threadID)],
        },
        {
          label: 1037,
          queue: ['msgr_custom_thread_theme', String(threadID)],
        },
        {
          label: 1028,
          queue: ['thread_theme_writer', String(threadID)],
        },
        {
          label: 43,
          queue: 'thread_theme',
          extra: { source: null, payload: null },
        },
      ].map(({ label, queue, extra }) => {
        ctx.wsReqNumber += 1;
        return {
          app_id: '772021112871879',
          payload: JSON.stringify({
            epoch_id: parseInt(utils.generateMessageID()),
            tasks: [makeTask(label, queue, extra)],
            version_id: '24227364673632991',
          }),
          request_id: ctx.wsReqNumber,
          type: 3,
        };
      });

      let publishedCount = 0;
      messages.forEach((msg, idx) => {
        ctx.mqttClient.publish(
          '/ls_req',
          JSON.stringify(msg),
          { qos: 1, retain: false },
          (err) => {
            if (err && idx === 0) {
              return callback(err);
            }
            publishedCount++;
            if (publishedCount === messages.length) {
              callback(null, { success: true, threadID, themeFBID });
            }
          }
        );
      });
    } catch (err) {
      utils.error("setThreadThemeMqtt", err);
      return callback(err);
    }

    return returnPromise;
  };
};
