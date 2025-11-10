"use_strict";
/**
* @author RFS-ADRENO
* @rewrittenBy Isai Ivanov
*/
//fixed march 30
const utils = require('../../../helpers');

function canBeCalled(func) {
    try {
        Reflect.apply(func, null, []);
        return true;
    } catch (error) {
        return false;
    }
}

/**
* A function for editing bot's messages.
* @param {string} text - The text with which the bot will edit its messages.
* @param {string} messageID - The message ID of the message the bot will edit.
* @param {Object} callback - Callback for the function.
*/

module.exports = function (defaultFuncs, api, ctx) {
    return function editMessage(text, messageID, callback) {
        let userCallback = null;
        
        if (typeof messageID === 'function') {
            callback = messageID;
            messageID = null;
        }
        
        if (callback && typeof callback === 'function') {
            userCallback = callback;
        }

        return new Promise((resolve, reject) => {
            const handleResult = (err, result) => {
                if (userCallback) {
                    userCallback(err, result);
                    // Always resolve for callback mode to prevent unhandled rejection
                    resolve(result);
                } else {
                    // Only reject for promise mode
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            };

            if (!text) {
                const err = new Error('Text is required for editing a message.');
                return handleResult(err);
            }
            
            if (!messageID) {
                const err = new Error('Message ID is required for editing a message.');
                return handleResult(err);
            }

            if (!ctx.mqttClient) {
                const err = new Error('editMessage requires MQTT connection. Call api.listenMqtt() first.');
                return handleResult(err);
            }

            ctx.wsReqNumber += 1;
            ctx.wsTaskNumber += 1;

            const queryPayload = {
                message_id: messageID,
                text
            };

            const query = {
                failure_count: null,
                label: '742',
                payload: JSON.stringify(queryPayload),
                queue_name: 'edit_message',
                task_id: ctx.wsTaskNumber
            };

            const context = {
                app_id: '2220391788200892',
                payload: {
                    data_trace_id: null,
                    epoch_id: parseInt(utils.generateOfflineThreadingID()),
                    tasks: [query],
                    version_id: '6903494529735864'
                },
                request_id: ctx.wsReqNumber,
                type: 3
            };

            context.payload = JSON.stringify(context.payload);

            ctx.reqCallbacks[ctx.wsReqNumber] = (err, result) => {
                handleResult(err, result);
            };

            ctx.mqttClient.publish('/ls_req', JSON.stringify(context), {
                qos: 1, retain: false
            }, (publishErr) => {
                if (publishErr) {
                    handleResult(publishErr);
                }
            });
        });
    };
};

