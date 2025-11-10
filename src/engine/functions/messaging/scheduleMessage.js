"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  const scheduledMessages = new Map();
  let scheduleIdCounter = 0;

  return {
    schedule: (message, threadID, scheduledTime, replyToMessage) => {
      utils.warn('scheduleMessage', 'WARNING: Scheduled messages are stored in-memory only. They will be lost if the process restarts. For production use, consider implementing your own persistence layer.');
      const scheduleId = `schedule_${++scheduleIdCounter}_${Date.now()}`;
      const delay = scheduledTime - Date.now();

      if (delay <= 0) {
        throw new Error('Scheduled time must be in the future');
      }

      const timeout = setTimeout(async () => {
        try {
          await api.sendMessage(message, threadID, replyToMessage);
          scheduledMessages.delete(scheduleId);
        } catch (error) {
          utils.error('scheduleMessage', `Failed to send scheduled message ${scheduleId}:`, error);
          scheduledMessages.delete(scheduleId);
        }
      }, delay);

      scheduledMessages.set(scheduleId, {
        timeout,
        message,
        threadID,
        scheduledTime,
        replyToMessage,
        createdAt: Date.now()
      });

      return {
        scheduleId,
        scheduledTime,
        cancel: () => {
          const scheduled = scheduledMessages.get(scheduleId);
          if (scheduled) {
            clearTimeout(scheduled.timeout);
            scheduledMessages.delete(scheduleId);
            return true;
          }
          return false;
        }
      };
    },

    list: () => {
      return Array.from(scheduledMessages.entries()).map(([id, data]) => ({
        scheduleId: id,
        threadID: data.threadID,
        scheduledTime: data.scheduledTime,
        createdAt: data.createdAt,
        message: typeof data.message === 'string' ? data.message : data.message.body || '[Complex Message]'
      }));
    },

    cancel: (scheduleId) => {
      const scheduled = scheduledMessages.get(scheduleId);
      if (scheduled) {
        clearTimeout(scheduled.timeout);
        scheduledMessages.delete(scheduleId);
        return true;
      }
      return false;
    },

    cancelAll: () => {
      const count = scheduledMessages.size;
      scheduledMessages.forEach((data) => clearTimeout(data.timeout));
      scheduledMessages.clear();
      return count;
    }
  };
};
