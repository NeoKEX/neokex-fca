"use strict";

const utils = require('../../../helpers');
const fs = require('fs');
const path = require('path');

module.exports = (defaultFuncs, api, ctx) => {
  return async (attachmentURL, savePath = null) => {
    if (!attachmentURL) {
      throw new Error('attachmentURL is required');
    }

    try {
      const response = await utils.cleanGet(attachmentURL);
      
      if (!response || response.statusCode !== 200) {
        throw new Error('Failed to download attachment');
      }

      if (savePath) {
        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(savePath, response.body);
        return {
          success: true,
          path: savePath,
          size: response.body.length
        };
      } else {
        return {
          success: true,
          data: response.body,
          size: response.body.length
        };
      }
    } catch (error) {
      utils.error('downloadAttachment', error);
      throw error;
    }
  };
};
