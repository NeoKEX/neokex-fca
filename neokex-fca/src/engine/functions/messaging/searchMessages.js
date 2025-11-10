"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (query, threadID, limit = 20) => {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a non-empty string');
    }

    const form = {
      query: query,
      snippetSize: 100,
      limit: limit,
      ...(threadID && { threadID: threadID })
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/ajax/mercury/search_snippets.php",
        ctx.jar,
        form
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        throw new Error(resData ? resData.error : 'Search failed');
      }

      const results = resData.payload?.search_snippets || [];
      return results.map(snippet => ({
        messageID: snippet.message_id,
        threadID: snippet.thread_id,
        authorID: snippet.author_id,
        body: snippet.snippet,
        timestamp: snippet.timestamp,
        attachments: snippet.attachments || []
      }));
    } catch (error) {
      utils.error('searchMessages', error);
      throw error;
    }
  };
};
