"use strict";

const utils = require('../../../helpers');
const axios = require('axios');

module.exports = (defaultFuncs, api, ctx) => {
  return async (attachmentUrl) => {
    if (!attachmentUrl || typeof attachmentUrl !== 'string') {
      throw new Error('Attachment URL must be a valid string');
    }

    try {
      const response = await axios.head(attachmentUrl, {
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: (status) => status < 400
      });

      const contentType = response.headers['content-type'] || 'unknown';
      const contentLength = parseInt(response.headers['content-length'] || '0', 10);
      const lastModified = response.headers['last-modified'] || null;
      const etag = response.headers['etag'] || null;

      const typeCategory = contentType.split('/')[0];
      let mediaType = 'unknown';
      
      if (typeCategory === 'image') {
        mediaType = 'photo';
      } else if (typeCategory === 'video') {
        mediaType = 'video';
      } else if (typeCategory === 'audio') {
        mediaType = 'audio';
      } else if (contentType.includes('pdf') || contentType.includes('document')) {
        mediaType = 'file';
      } else {
        mediaType = 'file';
      }

      const fileExtension = attachmentUrl.split('.').pop().split('?')[0].toLowerCase();
      
      return {
        url: attachmentUrl,
        mediaType,
        contentType,
        fileSize: contentLength,
        fileSizeFormatted: formatFileSize(contentLength),
        fileExtension,
        lastModified: lastModified ? new Date(lastModified).toISOString() : null,
        etag,
        isAccessible: true
      };
    } catch (error) {
      if (error.response) {
        return {
          url: attachmentUrl,
          isAccessible: false,
          error: `HTTP ${error.response.status}: ${error.response.statusText}`,
          statusCode: error.response.status
        };
      } else if (error.code === 'ECONNABORTED') {
        return {
          url: attachmentUrl,
          isAccessible: false,
          error: 'Request timeout - attachment may be too large or unavailable'
        };
      } else {
        return {
          url: attachmentUrl,
          isAccessible: false,
          error: error.message
        };
      }
    }
  };
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
