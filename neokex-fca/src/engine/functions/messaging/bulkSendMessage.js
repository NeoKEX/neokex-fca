"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (message, threadIDs, delay = 1000) => {
    if (!message || !Array.isArray(threadIDs) || threadIDs.length === 0) {
      throw new Error('message and threadIDs array are required');
    }

    const results = [];
    for (const threadID of threadIDs) {
      try {
        const result = await api.sendMessage(message, threadID);
        results.push({
          threadID,
          success: true,
          messageID: result.messageID,
          timestamp: result.timestamp
        });
        
        if (delay > 0 && threadID !== threadIDs[threadIDs.length - 1]) {
          await utils.delay(delay);
        }
      } catch (error) {
        results.push({
          threadID,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  };
};
