"use strict";

const { randomUserAgent } = require("./user-agents");

const LOCALE_PROFILES = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9,en-US;q=0.8',
    'en-US,en;q=0.9,es;q=0.8',
    'en-US,en;q=0.9,fr;q=0.8',
    'en-CA,en;q=0.9,fr;q=0.8',
    'en-AU,en;q=0.9,en-GB;q=0.8'
];

const TIMEZONE_OFFSETS = [-480, -420, -360, -300, -240, -180, -120, 0, 60, 120, 180, 240, 300, 360, 480, 540, 600];

function getRandomLocale() {
    return LOCALE_PROFILES[Math.floor(Math.random() * LOCALE_PROFILES.length)];
}

function getRandomTimezone() {
    return TIMEZONE_OFFSETS[Math.floor(Math.random() * TIMEZONE_OFFSETS.length)];
}

/**
 * Generates a comprehensive and realistic set of headers for requests to Facebook.
 * @param {string} url - The target URL.
 * @param {object} options - Global options from context.
 * @param {object} ctx - The application context (containing fb_dtsg, lsd, etc.).
 * @param {object} customHeader - Any extra headers to merge.
 * @param {string} requestType - Type of request: 'xhr' for GraphQL/AJAX or 'navigate' for page navigation
 * @returns {object} A complete headers object.
 */
function getHeaders(url, options, ctx, customHeader, requestType = 'navigate') {
    let userAgent, secChUa, secChUaFullVersionList, secChUaPlatform, secChUaPlatformVersion;
    
    if (options && options.cachedUserAgent) {
        userAgent = options.cachedUserAgent;
        secChUa = options.cachedSecChUa;
        secChUaFullVersionList = options.cachedSecChUaFullVersionList;
        secChUaPlatform = options.cachedSecChUaPlatform;
        secChUaPlatformVersion = options.cachedSecChUaPlatformVersion;
    } else {
        const generated = randomUserAgent();
        userAgent = generated.userAgent;
        secChUa = generated.secChUa;
        secChUaFullVersionList = generated.secChUaFullVersionList;
        secChUaPlatform = generated.secChUaPlatform;
        secChUaPlatformVersion = generated.secChUaPlatformVersion;
    }

    const host = new URL(url).hostname;
    const referer = `https://${host}/`;

    const isXhr = requestType === 'xhr';

    const locales = options?.cachedLocale || getRandomLocale();
    const timezone = options?.cachedTimezone || getRandomTimezone();

    const headers = {
        'Accept': isXhr ? '*/*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': locales,
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Dpr': '1',
        'Host': host,
        'Referer': referer,
        'Sec-Ch-Prefers-Color-Scheme': 'light',
        'Sec-Ch-Ua': secChUa,
        'Sec-Ch-Ua-Full-Version-List': secChUaFullVersionList,
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Model': '""',
        'Sec-Ch-Ua-Platform': secChUaPlatform,
        'Sec-Ch-Ua-Platform-Version': secChUaPlatformVersion,
        'Sec-Fetch-Dest': isXhr ? 'empty' : 'document',
        'Sec-Fetch-Mode': isXhr ? 'cors' : 'navigate',
        'Sec-Fetch-Site': isXhr ? 'same-origin' : 'none',
        'User-Agent': userAgent,
        'Viewport-Width': '1920',
        'X-FB-Timezone-Offset': String(timezone * 60)
    };

    if (isXhr) {
        headers['Origin'] = `https://${host}`;
    } else {
        headers['Sec-Fetch-User'] = '?1';
        headers['Upgrade-Insecure-Requests'] = '1';
    }

    if (ctx) {
        if (ctx.lsd || ctx.fb_dtsg) {
            headers['X-Fb-Lsd'] = ctx.lsd || ctx.fb_dtsg;
        }
        if (ctx.region) {
            headers['X-MSGR-Region'] = ctx.region;
        }
        if (ctx.master) {
            const { __spin_r, __spin_b, __spin_t } = ctx.master;
            if (__spin_r) headers['X-Fb-Spin-R'] = String(__spin_r);
            if (__spin_b) headers['X-Fb-Spin-B'] = String(__spin_b);
            if (__spin_t) headers['X-Fb-Spin-T'] = String(__spin_t);
        }
    }
    

    if (customHeader) {
        Object.assign(headers, customHeader);
        if (customHeader.noRef) {
            delete headers.Referer;
        }
    }

    return headers;
}

const meta = (prop) => new RegExp(`<meta property="${prop}" content="([^"]*)"`);

module.exports = {
    getHeaders,
    meta,
    getRandomLocale,
    getRandomTimezone
};