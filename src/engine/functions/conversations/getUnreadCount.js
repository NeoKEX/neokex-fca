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
        unreadCount: threadInfo.unreadCount,
        threadName: threadInfo.threadName || 'Direct Message'
      };
    } else {
      const threads = await api.getThreadList(20, null, []);
      const totalUnread = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
      const unreadThreads = threads.filter(t => t.unreadCount > 0).map(t => ({
        threadID: t.threadID,
        threadName: t.name || 'Direct Message',
        unreadCount: t.unreadCount
      }));
      
      return {
        totalUnreadCount: totalUnread,
        unreadThreadsCount: unreadThreads.length,
        threads: unreadThreads
      };
    }
  };
};
