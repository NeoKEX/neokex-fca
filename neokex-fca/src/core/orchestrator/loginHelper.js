"use strict";

const utils = require('../../helpers');
const axios = require("axios");
const path = require('path');
const fs = require('fs');
const qs = require("querystring");

async function loginHelper(credentials, globalOptions, callback, setOptionsFunc, buildAPIFunc, initialApi, fbLinkFunc, errorRetrievingMsg) {
    let ctx = null;
    let defaultFuncs = null;
    let api = initialApi;

    try {
        const jar = utils.getJar();
        utils.log("Initializing NeoKEX-FCA...");

        const appState = credentials.appState;

        if (appState) {
            let cookieStrings = [];
            if (Array.isArray(appState)) {
                cookieStrings = appState.map(c => [c.name || c.key, c.value].join('='));
            } else if (typeof appState === 'string') {
                if (appState.includes(';')) {
                    cookieStrings = appState.split(';').map(s => s.trim()).filter(Boolean);
                } else if (appState.includes(',')) {
                    cookieStrings = appState.split(',').map(s => s.trim()).filter(Boolean);
                } else if (/\r?\n/.test(appState)) {
                    cookieStrings = appState.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                } else if (appState.startsWith('[') || appState.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(appState);
                        if (Array.isArray(parsed)) {
                            cookieStrings = parsed.map(c => [c.name || c.key, c.value].join('='));
                        } else if (typeof parsed === 'object') {
                            cookieStrings = Object.entries(parsed).map(([key, value]) => `${key}=${value}`);
                        }
                    } catch (e) {
                        cookieStrings = [appState];
                    }
                } else {
                    cookieStrings = [appState];
                }
            } else if (typeof appState === 'object' && !Array.isArray(appState)) {
                cookieStrings = Object.entries(appState).map(([key, value]) => `${key}=${value}`);
            } else {
                throw new Error("Invalid appState format. Supported formats: array, string (semicolon/comma/newline-separated), JSON string, or object.");
            }

            cookieStrings.forEach(cookieString => {
                const domain = ".facebook.com";
                const expires = new Date().getTime() + 1000 * 60 * 60 * 24 * 365;
                const str = `${cookieString}; expires=${expires}; domain=${domain}; path=/;`;
                jar.setCookie(str, `https://${domain}`);
            });
        } else if (credentials.email && credentials.password) {
            const url = "https://api.facebook.com/method/auth.login";
            const params = {
                access_token: "350685531728|62f8ce9f74b12f84c123cc23437a4a32",
                format: "json",
                sdk_version: 2,
                email: credentials.email,
                locale: "en_US",
                password: credentials.password,
                generate_session_cookies: 1,
                sig: "c1c640010993db92e5afd11634ced864",
            }
            const query = qs.stringify(params);
            const xurl = `${url}?${query}`;
            try {
                const resp = await axios.get(xurl);
                if (resp.status !== 200) {
                    throw new Error("Wrong password / email");
                }
                let cstrs = resp.data["session_cookies"].map(c => `${c.name}=${c.value}`);
                cstrs.forEach(cstr => {
                  const domain = ".facebook.com";
                  const expires = new Date().getTime() + 1000 * 60 * 60 *24 * 365;
                  const str = `${cstr}; expires=${expires}; domain=${domain}; path=/;`;
                  jar.setCookie(str, `https://${domain}`);
                });
            } catch (e) {
                throw new Error("Wrong password / email");
            }
        } else {
                throw new Error("No cookie or credentials found. Please provide cookies or credentials.");
        }

        if (!api) {
            api = {
                setOptions: setOptionsFunc.bind(null, globalOptions),
                getAppState() {
                    const appState = utils.getAppState(jar);
                    if (!Array.isArray(appState)) return [];
                    const uniqueAppState = appState.filter((item, index, self) => self.findIndex((t) => t.key === item.key) === index);
                    return uniqueAppState.length > 0 ? uniqueAppState : appState;
                },
            };
        }

        const resp = await utils.get(fbLinkFunc(), jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
        const extractNetData = (html) => {
            const allScriptsData = [];
            const scriptRegex = /<script type="application\/json"[^>]*>(.*?)<\/script>/g;
            let match;
            while ((match = scriptRegex.exec(html)) !== null) {
                try {
                    allScriptsData.push(JSON.parse(match[1]));
                } catch (e) {
                    utils.error(`Failed to parse a JSON blob from HTML`, e.message);
                }
            }
            return allScriptsData;
        };

        const netData = extractNetData(resp.body);

        const [newCtx, newDefaultFuncs] = await buildAPIFunc(resp.body, jar, netData, globalOptions, fbLinkFunc, errorRetrievingMsg);
        ctx = newCtx;
        defaultFuncs = newDefaultFuncs;
        api.message = new Map();
        api.timestamp = {};
        
        const loadApiModules = () => {
            const apiPath = path.join(__dirname, '..', '..', 'engine', 'functions');
            const apiFolders = fs.readdirSync(apiPath)
                .filter(name => fs.lstatSync(path.join(apiPath, name)).isDirectory());

            apiFolders.forEach(folder => {
                const modulePath = path.join(apiPath, folder);
                fs.readdirSync(modulePath)
                    .filter(file => file.endsWith('.js'))
                    .forEach(file => {
                        const moduleName = path.basename(file, '.js');
                        const fullPath = path.join(modulePath, file);
                        try {
                            api[moduleName] = require(fullPath)(defaultFuncs, api, ctx);
                        } catch (e) {
                            utils.error(`Failed to load module ${moduleName} from ${folder}:`, e);
                        }
                    });
            });
            const listenPath = path.join(__dirname, '..', '..', 'engine', 'functions', 'realtime', 'listenMqtt.js');
            const realtimePath = path.join(__dirname, '..', '..', 'engine', 'functions', 'realtime', 'realtime.js');

            if (fs.existsSync(realtimePath)) {
                api['realtime'] = require(realtimePath)(defaultFuncs, api, ctx);
            }
            if (fs.existsSync(listenPath)) {
                api['listenMqtt'] = require(listenPath)(defaultFuncs, api, ctx);
            }
        };

        api.getCurrentUserID = () => ctx.userID;
        api.getOptions = (key) => key ? globalOptions[key] : globalOptions;
        loadApiModules();
        api.ctx = ctx;
        api.defaultFuncs = defaultFuncs;
        api.globalOptions = globalOptions;
        
        return callback(null, api);
    } catch (error) {
        utils.error("loginHelper", error.error || error);
        return callback(error);
    }
}

module.exports = loginHelper;
