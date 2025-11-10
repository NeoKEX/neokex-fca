"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID) => {
    if (threadID && (typeof threadID !== 'string' && typeof threadID !== 'number')) {
      throw new Error('ThreadID must be a string or number');
    }

    if (threadID) {
      const threadInfo = await api.getThreadInfo(threadID);
      return {
        threadID: threadInfo.threadID,
        threadName: threadInfo.name || threadInfo.threadName,
        unreadCount: threadInfo.unreadCount || 0
      };
    } else {
      const threads = await api.getThreadList(50, null, []);
      if (!Array.isArray(threads)) {
        throw new Error('Failed to retrieve thread list');
      }
      
      const unreadThreads = threads.filter(thread => {
        const count = parseInt(thread.unreadCount) || 0;
        return count > 0;
      });
      
      const totalUnread = threads.reduce((sum, thread) => {
        const count = parseInt(thread.unreadCount) || 0;
        return sum + count;
      }, 0);
      
      return {
        totalUnreadCount: totalUnread,
        unreadThreadsCount: unreadThreads.length,
        threads: unreadThreads.map(thread => ({
          threadID: thread.threadID,
          threadName: thread.name || thread.threadName,
          unreadCount: parseInt(thread.unreadCount) || 0
        }))
      };
    }
  };
};
