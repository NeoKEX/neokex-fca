"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async () => {
    try {
      const form = {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "ProfileCometBlocklistsQuery",
        variables: JSON.stringify({}),
        server_timestamps: true,
        doc_id: "4994829153940950"
      };

      const resData = await defaultFuncs
        .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs));

      if (!resData || resData.error) {
        utils.warn('getBlockedUsers', 'GraphQL query failed, trying fallback method');
        
        const fallbackData = await defaultFuncs.get(
          "https://www.facebook.com/settings/?tab=blocking",
          ctx.jar,
          {},
          ctx
        ).then(utils.parseAndCheckLogin(ctx, defaultFuncs));

        const blockedUsers = [];
        const patterns = [
          /blocked_user_ids":\[([^\]]+)\]/,
          /"blocked_profile_ids":\[([^\]]+)\]/,
          /"profile_id":"(\d+)"/g
        ];

        for (const pattern of patterns) {
          const matches = fallbackData.body?.matchAll ? 
            [...fallbackData.body.matchAll(pattern)] : 
            [fallbackData.body?.match(pattern)].filter(Boolean);
          
          if (matches && matches.length > 0) {
            matches.forEach(match => {
              if (match[1]) {
                const ids = match[1].split(',').map(id => id.trim().replace(/"/g, ''));
                blockedUsers.push(...ids);
              }
            });
          }
        }

        return [...new Set(blockedUsers)];
      }

      const blockedUsers = [];
      if (resData.data?.viewer?.blocked_profiles?.edges) {
        resData.data.viewer.blocked_profiles.edges.forEach(edge => {
          if (edge?.node?.id) {
            blockedUsers.push(edge.node.id);
          }
        });
      }

      return blockedUsers;
    } catch (error) {
      utils.error('getBlockedUsers', error);
      return [];
    }
  };
};
