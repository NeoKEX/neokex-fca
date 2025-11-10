"use strict";

const utils = require('../../../helpers');

module.exports = function (defaultFuncs, api, ctx) {
  return function getEmojiUrl(emojiChar, size) {
    size = size || 64;
    
    const codePoint = emojiChar.codePointAt(0).toString(16);
    const emojiUrl = `https://cdn.staticaly.com/emoji/twitter/${codePoint}.svg`;
    
    return emojiUrl;
  };
};
