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
        this.failureCount = 0;
        this.MAX_FAILURES = 3;
        this.onSessionExpiry = null;
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
     * Manually refresh tokens with retry logic
     * @param {Object} ctx - Application context
     * @param {Object} defaultFuncs - Default functions
     * @param {string} fbLink - Facebook link
     * @param {number} retryCount - Current retry attempt (internal use)
     * @returns {Promise<boolean>}
     */
    async refreshTokens(ctx, defaultFuncs, fbLink, retryCount = 0) {
        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [2000, 5000, 10000];
        
        try {
            const resp = await utils.get(fbLink, ctx.jar, null, ctx.globalOptions, { noRef: true });
            
            const html = resp.body;
            if (!html) {
                throw new Error("Empty response from Facebook");
            }

            if (html.includes("login") || html.includes("checkpoint")) {
                throw new Error("Session expired or checkpoint required");
            }

            const dtsgMatch = html.match(/"DTSGInitialData",\[],{"token":"([^"]+)"/);
            if (dtsgMatch) {
                ctx.fb_dtsg = dtsgMatch[1];
                ctx.ttstamp = "2";
                for (let i = 0; i < ctx.fb_dtsg.length; i++) {
                    ctx.ttstamp += ctx.fb_dtsg.charCodeAt(i);
                }
            } else {
                throw new Error("Failed to extract fb_dtsg token");
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
            this.failureCount = 0;
            return true;
        } catch (error) {
            this.failureCount++;
            utils.error("TokenRefresh", `Refresh failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error.message);
            
            if (this.failureCount >= this.MAX_FAILURES) {
                utils.error("TokenRefresh", `Maximum failures (${this.MAX_FAILURES}) reached. Session may be expired.`);
                if (this.onSessionExpiry && typeof this.onSessionExpiry === 'function') {
                    this.onSessionExpiry(error);
                }
                return false;
            }
            
            if (retryCount < MAX_RETRIES) {
                const delay = RETRY_DELAYS[retryCount];
                utils.log("TokenRefresh", `Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return await this.refreshTokens(ctx, defaultFuncs, fbLink, retryCount + 1);
            }
            
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

    /**
     * Set callback for session expiry detection
     * @param {Function} callback - Callback function to trigger on session expiry
     */
    setSessionExpiryCallback(callback) {
        this.onSessionExpiry = callback;
    }

    /**
     * Reset failure count (useful after successful re-login)
     */
    resetFailureCount() {
        this.failureCount = 0;
    }

    /**
     * Get current failure count
     * @returns {number}
     */
    getFailureCount() {
        return this.failureCount;
    }
}

module.exports = {
    TokenRefreshManager
};
