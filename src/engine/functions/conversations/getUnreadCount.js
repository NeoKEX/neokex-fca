"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID) => {
    if (threadID && (typeof threadID !== 'string' && typeof threadID !== 'number')) {
      throw new Error('ThreadID must be a string or number');
    }

    if (threadID) {
      const threadInfo = await api.getThreadInfo(threadID);
      return threadInfo.unreadCount || 0;
    } else {
      const threads = await api.getThreadList(20, null, []);
      const totalUnread = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
      return totalUnread;
    }
  };
};
