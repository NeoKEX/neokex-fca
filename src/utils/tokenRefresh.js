"use strict";

const utils = require('./index');

/**
 * Token Refresh Manager
 * Automatically refreshes fb_dtsg, lsd, and other tokens to prevent expiration
 */

class TokenRefreshManager {
    constructor() {
        this.refreshInterval = null;
        this.REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
        this.lastRefresh = Date.now();
    }

    /**
     * Start automatic token refresh
     * @param {Object} ctx - Application context
     * @param {Object} defaultFuncs - Default functions
     * @param {string} fbLink - Facebook link
     */
    startAutoRefresh(ctx, defaultFuncs, fbLink) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(async () => {
            try {
                await this.refreshTokens(ctx, defaultFuncs, fbLink);
                utils.log("TokenRefresh", "Tokens refreshed successfully");
            } catch (error) {
                utils.error("TokenRefresh", "Failed to refresh tokens:", error.message);
            }
        }, this.REFRESH_INTERVAL_MS);

        utils.log("TokenRefresh", "Auto-refresh enabled (every 24 hours)");
    }

    /**
     * Manually refresh tokens
     * @param {Object} ctx - Application context
     * @param {Object} defaultFuncs - Default functions
     * @param {string} fbLink - Facebook link
     * @returns {Promise<boolean>}
     */
    async refreshTokens(ctx, defaultFuncs, fbLink) {
        try {
            const resp = await utils.get(fbLink, ctx.jar, null, ctx.globalOptions, { noRef: true });
            
            const html = resp.body;
            if (!html) {
                throw new Error("Empty response from Facebook");
            }

            const dtsgMatch = html.match(/"DTSGInitialData",\[],{"token":"([^"]+)"/);
            if (dtsgMatch) {
                ctx.fb_dtsg = dtsgMatch[1];
                ctx.ttstamp = "2";
                for (let i = 0; i < ctx.fb_dtsg.length; i++) {
                    ctx.ttstamp += ctx.fb_dtsg.charCodeAt(i);
                }
            }

            const lsdMatch = html.match(/"LSD",\[],{"token":"([^"]+)"/);
            if (lsdMatch) {
                ctx.lsd = lsdMatch[1];
            }

            const jazoestMatch = html.match(/jazoest=(\d+)/);
            if (jazoestMatch) {
                ctx.jazoest = jazoestMatch[1];
            }

            const revisionMatch = html.match(/"client_revision":(\d+)/);
            if (revisionMatch) {
                ctx.__rev = revisionMatch[1];
            }

            this.lastRefresh = Date.now();
            return true;
        } catch (error) {
            utils.error("TokenRefresh", "Refresh failed:", error.message);
            return false;
        }
    }

    /**
     * Stop automatic token refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            utils.log("TokenRefresh", "Auto-refresh disabled");
        }
    }

    /**
     * Get time until next refresh
     * @returns {number} Milliseconds until next refresh
     */
    getTimeUntilNextRefresh() {
        if (!this.refreshInterval) return -1;
        return Math.max(0, this.REFRESH_INTERVAL_MS - (Date.now() - this.lastRefresh));
    }

    /**
     * Check if tokens need immediate refresh
     * @returns {boolean}
     */
    needsImmediateRefresh() {
        return (Date.now() - this.lastRefresh) >= this.REFRESH_INTERVAL_MS;
    }
}

module.exports = {
    TokenRefreshManager
};
