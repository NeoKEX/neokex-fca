"use strict";

const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const FormData = require("form-data");
const { getHeaders } = require("./headers");
const { getType } = require("./constants");

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

let proxyConfig = {};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function adaptResponse(res) {
    const response = res.response || res;
    return {
        ...response,
        body: response.data,
        statusCode: response.status,
        request: {
            uri: new URL(response.config.url),
            headers: response.config.headers,
            method: response.config.method.toUpperCase(),
            form: response.config.data,
            formData: response.config.data
        },
    };
}

async function requestWithRetry(requestFunction, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await requestFunction();
            return adaptResponse(res);
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Request failed after ${retries} attempts:`, error.message);
                if (error.response) {
                    return adaptResponse(error.response);
                }
                throw error;
            }
            const backoffTime = Math.pow(2, i) * 1000;
            console.warn(`Request attempt ${i + 1} failed. Retrying in ${backoffTime}ms...`);
            await delay(backoffTime);
        }
    }
}

function setProxy(proxyUrl) {
    if (proxyUrl) {
        try {
            const parsedProxy = new URL(proxyUrl);
            proxyConfig = {
                proxy: {
                    host: parsedProxy.hostname,
                    port: parsedProxy.port,
                    protocol: parsedProxy.protocol.replace(":", ""),
                    auth: parsedProxy.username && parsedProxy.password ? {
                        username: parsedProxy.username,
                        password: parsedProxy.password,
                    } : undefined,
                },
            };
        } catch (e) {
            console.error("Invalid proxy URL. Please use a full URL format (e.g., http://user:pass@host:port).");
            proxyConfig = {};
        }
    } else {
        proxyConfig = {};
    }
}

function cleanGet(url) {
    const fn = () => client.get(url, { timeout: 60000, ...proxyConfig });
    return requestWithRetry(fn);
}

async function get(url, reqJar, qs, options, ctx, customHeader) {
    const config = {
        headers: getHeaders(url, options, ctx, customHeader),
        timeout: 60000,
        params: qs,
        ...proxyConfig,
        validateStatus: (status) => status >= 200 && status < 600,
    };
    return requestWithRetry(async () => await client.get(url, config));
}

async function post(url, reqJar, form, options, ctx, customHeader) {
    const headers = getHeaders(url, options, ctx, customHeader);
    let data = form;
    let contentType = headers['Content-Type'] || 'application/x-www-form-urlencoded';

    if (contentType.includes('json')) {
        data = JSON.stringify(form);
    } else {
        const transformedForm = new URLSearchParams();
        for (const key in form) {
            if (form.hasOwnProperty(key)) {
                let value = form[key];
                if (getType(value) === "Object") {
                    value = JSON.stringify(value);
                }
                transformedForm.append(key, value);
            }
        }
        data = transformedForm.toString();
    }
    
    headers['Content-Type'] = contentType;

    const config = {
        headers,
        timeout: 60000,
        ...proxyConfig,
        validateStatus: (status) => status >= 200 && status < 600,
    };
    return requestWithRetry(async () => await client.post(url, data, config));
}

async function postFormData(url, reqJar, form, qs, options, ctx) {
    const formData = new FormData();
    for (const key in form) {
        if (form.hasOwnProperty(key)) {
            formData.append(key, form[key]);
        }
    }

    const customHeader = { "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}` };

    const config = {
        headers: getHeaders(url, options, ctx, customHeader),
        timeout: 60000,
        params: qs,
        ...proxyConfig,
        validateStatus: (status) => status >= 200 && status < 600,
    };
    return requestWithRetry(async () => await client.post(url, formData, config));
}

module.exports = {
  cleanGet,
  get,
  post,
  postFormData,
  getJar: () => jar,
  setProxy,
};
