"use strict";

/**
 * Adaptive Rate Limiting Manager
 * Prevents overwhelming Facebook servers and manages request cooldowns
 */

class RateLimiter {
    constructor() {
        this.threadCooldowns = new Map();
        this.endpointCooldowns = new Map();
        this.requestCounts = new Map();
        this.errorCache = new Map();
        this.ERROR_CACHE_TTL = 300000; // 5 minutes
        this.COOLDOWN_DURATION = 60000; // 60 seconds
        this.MAX_REQUESTS_PER_MINUTE = 60;
        this.MAX_CONCURRENT_REQUESTS = 10;
        this.activeRequests = 0;
    }

    /**
     * Check if a thread is on cooldown
     * @param {string} threadID - Thread identifier
     * @returns {boolean}
     */
    isThreadOnCooldown(threadID) {
        const cooldownEnd = this.threadCooldowns.get(threadID);
        if (!cooldownEnd) return false;
        
        const now = Date.now();
        if (now >= cooldownEnd) {
            this.threadCooldowns.delete(threadID);
            return false;
        }
        return true;
    }

    /**
     * Put a thread on cooldown
     * @param {string} threadID - Thread identifier
     * @param {number} duration - Cooldown duration in milliseconds
     */
    setThreadCooldown(threadID, duration = null) {
        const cooldownDuration = duration || this.COOLDOWN_DURATION;
        this.threadCooldowns.set(threadID, Date.now() + cooldownDuration);
    }

    /**
     * Check if an endpoint is on cooldown
     * @param {string} endpoint - Endpoint identifier
     * @returns {boolean}
     */
    isEndpointOnCooldown(endpoint) {
        const cooldownEnd = this.endpointCooldowns.get(endpoint);
        if (!cooldownEnd) return false;
        
        const now = Date.now();
        if (now >= cooldownEnd) {
            this.endpointCooldowns.delete(endpoint);
            return false;
        }
        return true;
    }

    /**
     * Put an endpoint on cooldown
     * @param {string} endpoint - Endpoint identifier
     * @param {number} duration - Cooldown duration in milliseconds
     */
    setEndpointCooldown(endpoint, duration = null) {
        const cooldownDuration = duration || this.COOLDOWN_DURATION;
        this.endpointCooldowns.set(endpoint, Date.now() + cooldownDuration);
    }

    /**
     * Check if an error should be suppressed from logging
     * @param {string} key - Error cache key
     * @returns {boolean}
     */
    shouldSuppressError(key) {
        const cachedTime = this.errorCache.get(key);
        if (!cachedTime) {
            this.errorCache.set(key, Date.now());
            return false;
        }
        
        if (Date.now() - cachedTime > this.ERROR_CACHE_TTL) {
            this.errorCache.set(key, Date.now());
            return false;
        }
        return true;
    }

    /**
     * Adaptive delay based on error type and retry count
     * @param {number} retryCount - Current retry attempt
     * @param {number} errorCode - Facebook error code
     * @returns {number} Delay in milliseconds
     */
    getAdaptiveDelay(retryCount, errorCode = null) {
        const baseDelays = [2000, 5000, 10000];
        
        if (errorCode === 1545012 || errorCode === 1675004) {
            return baseDelays[Math.min(retryCount, baseDelays.length - 1)] * 1.5;
        }
        
        return baseDelays[Math.min(retryCount, baseDelays.length - 1)];
    }

    /**
     * Check if can make request based on rate limiting
     * @returns {Promise<void>}
     */
    async checkRateLimit() {
        while (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.activeRequests++;
        
        setTimeout(() => {
            this.activeRequests = Math.max(0, this.activeRequests - 1);
        }, 1000);
    }

    /**
     * Clear expired entries from cache
     */
    cleanup() {
        const now = Date.now();
        
        for (const [key, time] of this.errorCache.entries()) {
            if (now - time > this.ERROR_CACHE_TTL) {
                this.errorCache.delete(key);
            }
        }
        
        for (const [key, time] of this.threadCooldowns.entries()) {
            if (now >= time) {
                this.threadCooldowns.delete(key);
            }
        }
        
        for (const [key, time] of this.endpointCooldowns.entries()) {
            if (now >= time) {
                this.endpointCooldowns.delete(key);
            }
        }
    }

    /**
     * Get cooldown remaining time for thread
     * @param {string} threadID - Thread identifier
     * @returns {number} Remaining milliseconds
     */
    getCooldownRemaining(threadID) {
        const cooldownEnd = this.threadCooldowns.get(threadID);
        if (!cooldownEnd) return 0;
        return Math.max(0, cooldownEnd - Date.now());
    }

    /**
     * Get cooldown remaining time for endpoint
     * @param {string} endpoint - Endpoint identifier
     * @returns {number} Remaining milliseconds
     */
    getEndpointCooldownRemaining(endpoint) {
        const cooldownEnd = this.endpointCooldowns.get(endpoint);
        if (!cooldownEnd) return 0;
        return Math.max(0, cooldownEnd - Date.now());
    }
}

const globalRateLimiter = new RateLimiter();

setInterval(() => globalRateLimiter.cleanup(), 60000);

module.exports = {
    RateLimiter,
    globalRateLimiter
};
