"use strict";

const network = require("./network");
const headers = require("./headers");
const clients = require("./clients");
const constants = require("./constants");
const formatters = require("./processors"); 
const userAgents = require("./user-agents");
const cheerio = require("cheerio");
const util = require("util");

async function json(url, jar, qs, options, ctx, customHeader) {
  try {
    const res = await network.get(url, jar, qs, options, ctx, customHeader);
    const body = res.body;
    const $ = cheerio.load(body);
    const scripts = $('script[type="application/json"]');

    if (scripts.length === 0) {
      constants.warn(`No <script type="application/json"> tags found on ${url}`);
      return [];
    }

    const allJsonData = [];
    scripts.each((index, element) => {
      try {
        const jsonContent = $(element).html();
        if (jsonContent) {
          allJsonData.push(JSON.parse(jsonContent));
        }
      } catch (e) {
        constants.warn(`Could not parse JSON from script #${index + 1} on ${url}`);
      }
    });

    return allJsonData;
  } catch (error) {
    constants.error(`Error in utils.json fetching from ${url}:`, error);
    throw error;
  }
}

function makeDefaults(html, userID, ctx) {
  let reqCounter = 1;
  const revision = constants.getFrom(html, 'revision":', ",");

  function mergeWithDefaults(obj) {
    const newObj = {
      av: userID,
      __user: userID,
      __req: (reqCounter++).toString(36),
      __rev: revision,
      __a: 1,
      ...(ctx && {
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.jazoest,
      }),
    };

    if (!obj) return newObj;

    for (const prop in obj) {
      if (obj.hasOwnProperty(prop) && !newObj[prop]) {
        newObj[prop] = obj[prop];
      }
    }

    return newObj;
  }

  return {
    get: (url, jar, qs, ctxx, customHeader = {}) =>
      network.get(url, jar, mergeWithDefaults(qs), ctx.globalOptions, ctxx || ctx, customHeader),

    post: (url, jar, form, ctxx, customHeader = {}) =>
      network.post(url, jar, mergeWithDefaults(form), ctx.globalOptions, ctxx || ctx, customHeader),

    postFormData: (url, jar, form, qs, ctxx) =>
      network.postFormData(
        url,
        jar,
        mergeWithDefaults(form),
        mergeWithDefaults(qs),
        ctx.globalOptions,
        ctxx || ctx
      ),
  };
}

module.exports = {
  ...network,
  ...headers,
  ...clients,
  ...constants,
  ...formatters,
  ...userAgents,
  json,
  makeDefaults,
  promisify: (func) => util.promisify(func),
  delay: (ms) => new Promise(r => setTimeout(r, ms))
};
