"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (pollID, optionID, addVote = true) => {
    if (!pollID || optionID === undefined) {
      throw new Error('pollID and optionID are required');
    }

    const form = {
      poll_id: pollID,
      option_id: optionID,
      action: addVote ? 'ADD_VOTE' : 'REMOVE_VOTE'
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/messaging/group_polling/update_vote/?dpr=1",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw new Error(resData ? resData.error : 'Vote operation failed');
      }

      return {
        success: true,
        pollID,
        optionID,
        voted: addVote
      };
    } catch (error) {
      utils.error('votePoll', error);
      throw error;
    }
  };
};
