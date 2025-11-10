"use strict";

const utils = require('../../helpers');

async function buildAPI(html, jar, netData, globalOptions, fbLinkFunc, errorRetrievingMsg) {
    let userID;
    const cookies = jar.getCookiesSync(fbLinkFunc());
    const primaryProfile = cookies.find((val) => val.cookieString().startsWith("c_user="));
    const secondaryProfile = cookies.find((val) => val.cookieString().startsWith("i_user="));
    if (!primaryProfile && !secondaryProfile) {
        throw new Error(errorRetrievingMsg);
    }
    userID = secondaryProfile?.cookieString().split("=")[1] || primaryProfile.cookieString().split("=")[1];

    const findConfig = (key) => {
        for (const scriptData of netData) {
            if (scriptData.require) {
                for (const req of scriptData.require) {
                    if (Array.isArray(req) && req[0] === key && req[2]) {
                        return req[2];
                    }
                    if (Array.isArray(req) && req[3] && req[3][0] && req[3][0].__bbox && req[3][0].__bbox.define) {
                        for (const def of req[3][0].__bbox.define) {
                            if (Array.isArray(def) && def[0].endsWith(key) && def[2]) {
                                return def[2];
                            }
                        }
                    }
                }
            }
        }
        return null;
    };

    const dtsgData = findConfig("DTSGInitialData");
    let dtsg = dtsgData ? dtsgData.token : utils.getFrom(html, '"token":"', '"');
    
    // Additional fallback: try to find in __bbox.payload.global_scope or DTSGInitData
    if (!dtsg || dtsg === '') {
        for (const scriptData of netData) {
            if (scriptData.__bbox && scriptData.__bbox.payload && scriptData.__bbox.payload.global_scope) {
                const globalScope = scriptData.__bbox.payload.global_scope;
                if (globalScope.fb_dtsg) {
                    dtsg = globalScope.fb_dtsg;
                    break;
                }
            }
            // Try DTSGInitData as well
            if (scriptData.define) {
                for (const def of scriptData.define) {
                    if (Array.isArray(def) && (def[0] === 'DTSGInitData' || def[0].endsWith('DTSGInitData')) && def[1] && def[1].token) {
                        dtsg = def[1].token;
                        break;
                    }
                }
            }
            if (dtsg) break;
        }
    }
    
    // Final fallback: try multiple HTML patterns
    if (!dtsg || dtsg === '') {
        dtsg = utils.getFrom(html, '"DTSGInitialData",{"token":"', '"') ||
               utils.getFrom(html, '"DTSG":{"token":"', '"') ||
               utils.getFrom(html, 'DTSGInitialData",[],{"token":"', '"') ||
               utils.getFrom(html, '"token":"', '"');
    }
    
    const dtsgResult = { fb_dtsg: dtsg, jazoest: dtsg ? `2${Array.from(dtsg).reduce((a, b) => a + b.charCodeAt(0), '')}` : undefined };
    
    // Extract lsd token for additional endpoints
    const lsd = utils.getFrom(html, '["LSD",[],{"token":"', '"') ||
                utils.getFrom(html, '"LSD",\\[\\],{"token":"', '"') ||
                utils.getFrom(html, 'LSD",\\[\\],{"token":"', '"');
    
    // Warn if DTSG extraction failed
    if (!dtsg || dtsg === '') {
        utils.warn("buildAPI", "Failed to extract fb_dtsg from initial HTML. Will attempt refresh after login.");
    } else {
        utils.log("buildAPI", "Successfully extracted fb_dtsg token");
    }

    const clientIDData = findConfig("MqttWebDeviceID");
    const clientID = clientIDData ? clientIDData.clientID : undefined;

    const mqttConfigData = findConfig("MqttWebConfig");
    const mqttAppID = mqttConfigData ? mqttConfigData.appID : undefined;

    const currentUserData = findConfig("CurrentUserInitialData");
    const userAppID = currentUserData ? currentUserData.APP_ID : undefined;

    let primaryAppID = userAppID || mqttAppID;

    let mqttEndpoint = mqttConfigData ? mqttConfigData.endpoint : undefined;

    let region = mqttEndpoint ? new URL(mqttEndpoint).searchParams.get("region")?.toUpperCase() : undefined;
    const irisSeqIDMatch = html.match(/irisSeqID:"(.+?)"/);
    const irisSeqID = irisSeqIDMatch ? irisSeqIDMatch[1] : null;
    if (globalOptions.bypassRegion && mqttEndpoint) {
        const currentEndpoint = new URL(mqttEndpoint);
        currentEndpoint.searchParams.set('region', globalOptions.bypassRegion.toLowerCase());
        mqttEndpoint = currentEndpoint.toString();
        region = globalOptions.bypassRegion.toUpperCase();
    }

    const ctx = {
        userID,
        jar,
        clientID,
        appID: primaryAppID, 
        mqttAppID: mqttAppID, 
        userAppID: userAppID, 
        globalOptions,
        loggedIn: true,
        access_token: "NONE",
        clientMutationId: 0,
        mqttClient: undefined,
        lastSeqId: irisSeqID,
        syncToken: undefined,
        mqttEndpoint,
        wsReqNumber: 0,
        wsTaskNumber: 0,
        reqCallbacks: {},
        callback_Task: {},
        region,
        firstListen: true,
        lsd: lsd,
        ...dtsgResult,
    };
    const defaultFuncs = utils.makeDefaults(html, userID, ctx);

    return [ctx, defaultFuncs, {}];
}

module.exports = buildAPI;
