"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return function setThreadThemeMqtt(threadID, themeFBID, callback) {
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

    if (!ctx.mqttClient) {
      const error = new Error('Not connected to MQTT');
      utils.error("setThreadThemeMqtt", error.message);
      return cb(error);
    }

    ctx.wsReqNumber = (ctx.wsReqNumber || 0) + 1;
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
        app_id: ctx.appID || '772021112871879',
        payload: JSON.stringify({
          epoch_id: parseInt(utils.generateOfflineThreadingID()),
          tasks: [makeTask(label, queue, extra)],
          version_id: '24227364673632991',
        }),
        request_id: ctx.wsReqNumber,
        type: 3,
      };
    });

    try {
      let publishCount = 0;
      const totalMessages = messages.length;

      messages.forEach((msg, idx) => {
        ctx.mqttClient.publish(
          '/ls_req',
          JSON.stringify(msg),
          { qos: 1, retain: false },
          (err) => {
            if (err) {
              utils.error("setThreadThemeMqtt", err.message);
              return cb(err);
            }
            publishCount++;
            if (publishCount === totalMessages) {
              cb(null, {
                type: "thread_theme_update",
                threadID: threadID,
                themeID: themeFBID,
                senderID: ctx.userID,
                timestamp: Date.now()
              });
            }
          }
        );
      });
    } catch (err) {
      utils.error("setThreadThemeMqtt", err.message || err);
      cb(err);
    }

    return returnPromise;
  };
};
