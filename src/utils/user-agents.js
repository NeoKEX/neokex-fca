"use strict";
const { getRandom } = require("./constants");

const BROWSER_DATA = {
    windows: {
        platform: "Windows NT 10.0; Win64; x64",
        chromeVersions: ["131.0.6778.86", "130.0.6723.92", "129.0.6668.101", "128.0.6613.120", "127.0.6533.120", "126.0.6478.127"],
        edgeVersions: ["131.0.2903.51", "130.0.2849.68", "129.0.2792.89"],
        platformVersion: '"15.0.0"'
    },
    mac: {
        platform: "Macintosh; Intel Mac OS X 10_15_7",
        chromeVersions: ["131.0.6778.86", "130.0.6723.92", "129.0.6668.101", "128.0.6613.120", "127.0.6533.120", "126.0.6478.127"],
        edgeVersions: ["131.0.2903.51", "130.0.2849.68", "129.0.2792.89"],
        platformVersion: '"14.7.0"'
    },
    linux: {
        platform: "X11; Linux x86_64",
        chromeVersions: ["131.0.6778.86", "130.0.6723.92", "129.0.6668.101", "128.0.6613.120", "127.0.6533.120"],
        edgeVersions: ["131.0.2903.51", "130.0.2849.68"],
        platformVersion: '""'
    }
};

const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/**
 * Generates a realistic, randomized User-Agent string and related Sec-CH headers.
 * Supports Chrome and Edge browsers across Windows, macOS, and Linux.
 * @returns {{userAgent: string, secChUa: string, secChUaFullVersionList: string, secChUaPlatform: string, secChUaPlatformVersion: string, browser: string}}
 */
function randomUserAgent() {
    const os = getRandom(Object.keys(BROWSER_DATA));
    const data = BROWSER_DATA[os];
    
    const useEdge = Math.random() > 0.7 && data.edgeVersions;
    const versions = useEdge ? data.edgeVersions : data.chromeVersions;
    const version = getRandom(versions);
    const majorVersion = version.split('.')[0];
    const browserName = useEdge ? 'Microsoft Edge' : 'Google Chrome';
    const browserIdentifier = useEdge ? 'Edg' : 'Chrome';

    const userAgent = useEdge 
        ? `Mozilla/5.0 (${data.platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 Edg/${version}`
        : `Mozilla/5.0 (${data.platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
    
    const greeseValue = Math.random() > 0.5 ? '99' : '8';
    const brands = useEdge ? [
        `"Chromium";v="${majorVersion}"`,
        `"Not(A:Brand";v="${greeseValue}"`,
        `"${browserName}";v="${majorVersion}"`
    ] : [
        `"${browserName}";v="${majorVersion}"`,
        `"Not;A=Brand";v="${greeseValue}"`,
        `"Chromium";v="${majorVersion}"`
    ];
    
    const secChUa = brands.join(', ');
    const secChUaFullVersionList = brands.map(b => {
        const match = b.match(/v="(\d+)"/);
        if (match && match[1] === majorVersion) {
            return b.replace(`v="${majorVersion}"`, `v="${version}"`);
        }
        return b;
    }).join(', ');

    const platformName = os === 'windows' ? 'Windows' : os === 'mac' ? 'macOS' : 'Linux';

    return {
        userAgent,
        secChUa,
        secChUaFullVersionList,
        secChUaPlatform: `"${platformName}"`,
        secChUaPlatformVersion: data.platformVersion,
        browser: browserName
    };
}

module.exports = {
    defaultUserAgent,
    windowsUserAgent: defaultUserAgent,
    randomUserAgent,
};