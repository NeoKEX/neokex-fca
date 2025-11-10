"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (threadID, question, options) => {
    if (!threadID || !question || !Array.isArray(options) || options.length < 2) {
      throw new Error('threadID, question, and at least 2 options are required');
    }

    const form = {
      target_id: threadID,
      question_text: question,
      options: JSON.stringify(options.map((opt, index) => ({
        text: opt,
        option_id: index
      })))
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/messaging/group_polling/create_poll/?dpr=1",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw new Error(resData ? resData.error : 'Poll creation failed');
      }

      return {
        success: true,
        pollID: resData.payload?.poll_id,
        threadID,
        question,
        options
      };
    } catch (error) {
      utils.error('createPoll', error);
      throw error;
    }
  };
};
