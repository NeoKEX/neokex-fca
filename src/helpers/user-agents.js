"use strict";
const { getRandom } = require("./constants");

const BROWSER_DATA = {
    windows: {
        platform: "Windows NT 10.0; Win64; x64",
        chromeVersions: ["126.0.0.0", "125.0.0.0", "124.0.0.0", "127.0.0.0"],
        platformVersion: '"15.0.0"'
    },
    mac: {
        platform: "Macintosh; Intel Mac OS X 10_15_7",
        chromeVersions: ["126.0.0.0", "125.0.0.0", "124.0.0.0", "127.0.0.0"],
        platformVersion: '"15.7.9"'
    },
    linux: {
        platform: "X11; Linux x86_64",
        chromeVersions: ["126.0.0.0", "125.0.0.0", "124.0.0.0"],
        platformVersion: '"6.5.0"'
    }
};

const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function randomUserAgent() {
    const os = getRandom(Object.keys(BROWSER_DATA));
    const data = BROWSER_DATA[os];
    const version = getRandom(data.chromeVersions);
    const majorVersion = version.split('.')[0];

    const userAgent = `Mozilla/5.0 (${data.platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
    
    const brands = [
        `"Not/A)Brand";v="8"`,
        `"Chromium";v="${majorVersion}"`,
        `"Google Chrome";v="${majorVersion}"`
    ];
    const secChUa = brands.join(', ');
    const secChUaFullVersionList = brands.map((b, i) => b.replace(/"$/, `.0.0.0"`)).join(', ');

    let platformName = "Windows";
    if (os === 'mac') platformName = "macOS";
    if (os === 'linux') platformName = "Linux";

    return {
        userAgent,
        secChUa,
        secChUaFullVersionList,
        secChUaPlatform: `"${platformName}"`,
        secChUaPlatformVersion: data.platformVersion
    };
}

module.exports = {
    defaultUserAgent,
    windowsUserAgent: defaultUserAgent,
    randomUserAgent,
};
