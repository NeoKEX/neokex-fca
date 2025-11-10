"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return function stopListening(callback) {
    try {
      if (ctx.mqttClient) {
        ctx.mqttClient.end(false, () => {
          ctx.mqttClient = null;
          if (callback) callback(null);
        });
      } else {
        if (callback) callback(new Error("MQTT client is not connected"));
      }
    } catch (err) {
      utils.error("stopListening", err.message || err);
      if (callback) callback(err);
    }
  };
};
