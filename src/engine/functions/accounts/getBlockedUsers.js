"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async () => {
    try {
      const resData = await defaultFuncs.get(
        "https://www.facebook.com/settings/?tab=blocking",
        ctx.jar,
        {},
        ctx
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw new Error('Failed to retrieve blocked users');
      }

      const blockedUsers = [];
      const blocklistMatch = resData.body?.match(/blocked_user_ids":\[([^\]]+)\]/);
      
      if (blocklistMatch && blocklistMatch[1]) {
        const userIDs = blocklistMatch[1].split(',').map(id => id.trim().replace(/"/g, ''));
        blockedUsers.push(...userIDs);
      }

      return blockedUsers;
    } catch (error) {
      utils.error('getBlockedUsers', error);
      throw error;
    }
  };
};
