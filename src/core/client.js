"use strict";

const utils = require("../helpers");
const setOptionsModel = require('./orchestrator/setOptions');
const buildAPIModel = require('./orchestrator/buildAPI');
const loginHelperModel = require('./orchestrator/loginHelper');

const fbLink = (ext) => ("https://www.facebook.com" + (ext ? '/' + ext : ''));
const ERROR_RETRIEVING = "Error retrieving userID. This can be caused by many factors, including being blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.";

async function login(credentials, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }
    if ('logging' in options) {
        utils.logOptions(options.logging);
    }
    const defaultOptions = {
        selfListen: false,
        listenEvents: true,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: false,
        autoMarkRead: true,
        autoReconnect: true,
        online: true,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0 Safari/537.36",
    };
    const sessionOptions = Object.assign({}, defaultOptions, options);

    await setOptionsModel(sessionOptions, options);

    loginHelperModel(
        credentials,
        sessionOptions,
        (loginError, loginApi) => {
            if (loginError) {
                return callback(loginError);
            }
            return callback(null, loginApi);
        },
        setOptionsModel,
        buildAPIModel,
        null,
        fbLink, 
        ERROR_RETRIEVING
    );
}

module.exports = {
    login
};
