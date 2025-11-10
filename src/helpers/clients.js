"use strict";

const { makeParsable, log, warn } = require("./constants");

function formatCookie(arr, url) {
  return arr[0] + "=" + arr[1] + "; Path=" + arr[3] + "; Domain=" + url + ".com";
}

function parseAndCheckLogin(ctx, http, retryCount = 0) {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return async (data) => {
    if (data.statusCode >= 500 && data.statusCode < 600) {
      if (retryCount >= 5) {
        const err = new Error("Request retry failed. Check the `res` and `statusCode` property on this error.");
        err.statusCode = data.statusCode;
        err.res = data.body;
        err.error = "Request retry failed. Check the `res` and `statusCode` property on this error.";
        throw err;
      }

      retryCount++;
      const retryTime = Math.floor(Math.random() * 5000);
      const url = data.request.uri.protocol + "//" + data.request.uri.hostname + data.request.uri.pathname;

      await delay(retryTime);

      const contentType = data.request.headers["content-type"] || data.request.headers["Content-Type"] || "";
      const isMultipart = contentType.split(";")[0] === "multipart/form-data";
      
      if (isMultipart) {
        const newData = await http.postFormData(
          url,
          ctx.jar,
          data.request.formData,
          data.request.qs,
          ctx.globalOptions,
          ctx
        );
        return await parseAndCheckLogin(ctx, http, retryCount)(newData);
      } else {
        const newData = await http.post(
          url,
          ctx.jar,
          data.request.form,
          ctx.globalOptions,
          ctx
        );
        return await parseAndCheckLogin(ctx, http, retryCount)(newData);
      }
    }

    if (data.statusCode === 404) return;

    if (data.statusCode !== 200) {
      throw new Error("parseAndCheckLogin got status code: " + data.statusCode + ". Bailing out of trying to parse response.");
    }

    let res = null;

    if (typeof data.body === 'object' && data.body !== null) {
      res = data.body;
    } else if (typeof data.body === 'string') {
      try {
        res = JSON.parse(makeParsable(data.body));
      } catch (e) {
        const err = new Error("JSON.parse error. Check the `detail` property on this error.");
        err.error = "JSON.parse error. Check the `detail` property on this error.";
        err.detail = e;
        err.res = data.body;
        throw err;
      }
    } else {
      throw new Error("Unknown response body type: " + typeof data.body);
    }

    if (res.redirect && data.request.method === "GET") {
      const redirectRes = await http.get(res.redirect, ctx.jar);
      return await parseAndCheckLogin(ctx, http)(redirectRes);
    }

    if (res.jsmods && res.jsmods.require && Array.isArray(res.jsmods.require[0]) && res.jsmods.require[0][0] === "Cookie") {
      res.jsmods.require[0][3][0] = res.jsmods.require[0][3][0].replace("_js_", "");
      const requireCookie = res.jsmods.require[0][3];
      ctx.jar.setCookie(formatCookie(requireCookie, "facebook"), "https://www.facebook.com");
      ctx.jar.setCookie(formatCookie(requireCookie, "messenger"), "https://www.messenger.com");
    }

    if (res.jsmods && Array.isArray(res.jsmods.require)) {
      const arr = res.jsmods.require;
      for (const i in arr) {
        if (arr[i][0] === "DTSG" && arr[i][1] === "setToken") {
          ctx.fb_dtsg = arr[i][3][0];
          ctx.ttstamp = "2";
          for (let j = 0; j < ctx.fb_dtsg.length; j++) {
            ctx.ttstamp += ctx.fb_dtsg.charCodeAt(j);
          }
        }
      }
    }

    if (res.error === 1357001) {
      const err = new Error("Facebook blocked the login");
      err.error = "Not logged in.";
      throw err;
    }

    return res;
  };
}

function saveCookies(jar) {
  return function (res) {
    const cookies = res.headers["set-cookie"] || [];
    cookies.forEach(function (c) {
      if (c.indexOf(".facebook.com") > -1) {
        jar.setCookie(c, "https://www.facebook.com");
      }
      const c2 = c.replace(/domain=\.facebook\.com/, "domain=.messenger.com");
      jar.setCookie(c2, "https://www.messenger.com");
    });
    return res;
  };
}

function getAccessFromBusiness(jar, Options) {
  return async function (res) {
    const html = res ? res.body : null;
    const { get } = require("./network");
    try {
        const businessRes = await get("https://business.facebook.com/content_management", jar, null, Options, null, { noRef: true });
        const token = /"accessToken":"([^.]+)","clientID":/g.exec(businessRes.body)[1];
        return [html, token];
    } catch (e) {
        return [html, null];
    }
  };
}

function getAppState(jar) {
  return jar
    .getCookiesSync("https://www.facebook.com")
    .concat(jar.getCookiesSync("https://www.messenger.com"));
}

module.exports = {
  parseAndCheckLogin,
  saveCookies,
  getAccessFromBusiness,
  getAppState,
};
