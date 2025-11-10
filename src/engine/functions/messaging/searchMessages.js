"use strict";

const utils = require('../../../helpers');

module.exports = (defaultFuncs, api, ctx) => {
  return async (query, threadID, limit = 20) => {
    throw new Error(
      'searchMessages is currently unavailable. ' +
      'Facebook removed the message search API endpoint. ' +
      'No stable alternative has been found in ws3-fca or other libraries. ' +
      'This feature may return in future updates if a working endpoint is discovered.'
    );
  };
};
