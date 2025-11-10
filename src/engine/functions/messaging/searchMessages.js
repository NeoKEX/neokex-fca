"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (query, threadID, limit = 20) => {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a non-empty string');
    }

    const form = {
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "MWChatMessageSearchQuery",
      variables: JSON.stringify({
        query: query,
        threadID: threadID || null,
        limit: limit
      }),
      server_timestamps: true,
      doc_id: "6894232070618411"
    };

    try {
      const resData = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form,
        null,
        {
          "x-fb-friendly-name": "MWChatMessageSearchQuery",
          "x-fb-lsd": ctx.lsd
        }
      ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error || resData.errors) {
        const errorMsg = resData ? (resData.error || JSON.stringify(resData.errors)) : 'Search failed';
        if (errorMsg.includes('document') && errorMsg.includes('not found')) {
          utils.warn('searchMessages', 'GraphQL doc_id outdated. Facebook frequently changes internal API identifiers.');
          return [];
        }
        throw new Error(errorMsg);
      }

      const edges = resData.data?.message_search?.search_results?.edges || [];
      return edges.map(edge => {
        const node = edge.node;
        return {
          messageID: node.message_id,
          threadID: node.thread_key,
          authorID: node.message_sender?.id,
          body: node.snippet || node.message?.text,
          timestamp: node.timestamp_ms,
          attachments: []
        };
      });
    } catch (error) {
      utils.error('searchMessages', error);
      throw error;
    }
  };
};
