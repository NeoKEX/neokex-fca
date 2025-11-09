"use strict";

const userAgents = require("../../lib/utils/helpers/user-agents");

class AntiDetectionManager {
  constructor(options = {}) {
    this.enabled = options.antiDetection !== false;
    this.randomizeUserAgent = options.randomUserAgent || false;
    this.requestJitter = options.requestJitter !== false;
    this.headerVariability = options.headerVariability !== false;
    this.currentUserAgent = null;
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }

  getUserAgent() {
    if (!this.enabled) {
      return userAgents.defaultUserAgent;
    }

    if (this.randomizeUserAgent && !this.currentUserAgent) {
      this.currentUserAgent = this.selectRealisticUserAgent();
    }

    return this.currentUserAgent || userAgents.defaultUserAgent;
  }

  selectRealisticUserAgent() {
    const realisticAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    return realisticAgents[Math.floor(Math.random() * realisticAgents.length)];
  }

  getVariableHeaders(baseHeaders) {
    if (!this.enabled || !this.headerVariability) {
      return baseHeaders;
    }

    const headers = { ...baseHeaders };

    const acceptLanguages = [
      'en-US,en;q=0.9',
      'en-US,en;q=0.9,es;q=0.8',
      'en-GB,en;q=0.9,en-US;q=0.8',
    ];

    const acceptEncodings = [
      'gzip, deflate, br',
      'gzip, deflate, br, zstd',
    ];

    headers['Accept-Language'] = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)];
    headers['Accept-Encoding'] = acceptEncodings[Math.floor(Math.random() * acceptEncodings.length)];

    if (Math.random() > 0.5) {
      headers['DNT'] = '1';
    }

    headers['Sec-Fetch-Dest'] = 'document';
    headers['Sec-Fetch-Mode'] = 'navigate';
    headers['Sec-Fetch-Site'] = 'none';
    headers['Sec-Fetch-User'] = '?1';
    headers['Upgrade-Insecure-Requests'] = '1';

    return headers;
  }

  async applyRequestDelay() {
    if (!this.enabled || !this.requestJitter) {
      return;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    const minDelay = 100;
    const maxDelay = 500;
    const baseDelay = 200;

    if (timeSinceLastRequest < minDelay) {
      const jitter = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
      const delay = Math.max(0, baseDelay - timeSinceLastRequest + jitter);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  detectAutomatedBehaviorWarning(response) {
    if (!response || !response.body) {
      return false;
    }

    const warningPatterns = [
      'automated behavior',
      'suspicious activity',
      'unusual activity',
      'security check',
      'verify your identity',
      'checkpoint',
      '/checkpoint/',
      '1501092823525282',
      '828281030927956',
      '601051028565049',
    ];

    const body = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
    const lowerBody = body.toLowerCase();

    return warningPatterns.some(pattern => lowerBody.includes(pattern.toLowerCase()));
  }

  async handleAutomatedBehaviorDetection(ctx, defaultFuncs) {
    if (!this.enabled) {
      return false;
    }

    try {
      const bypassForm = {
        av: ctx.userID,
        fb_api_caller_class: 'RelayModern',
        fb_api_req_friendly_name: 'FBScrapingWarningMutation',
        variables: '{}',
        server_timestamps: true,
        doc_id: 6339492849481770,
        fb_dtsg: ctx.fb_dtsg,
        jazoest: ctx.jazoest,
      };

      await defaultFuncs.post(
        'https://www.facebook.com/api/graphql/',
        ctx.jar,
        bypassForm,
        ctx.globalOptions
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  getRecommendedOptions() {
    return {
      antiDetection: true,
      randomUserAgent: true,
      requestJitter: true,
      headerVariability: true,
    };
  }

  getStatus() {
    return {
      enabled: this.enabled,
      randomizeUserAgent: this.randomizeUserAgent,
      requestJitter: this.requestJitter,
      headerVariability: this.headerVariability,
      requestCount: this.requestCount,
      currentUserAgent: this.currentUserAgent,
    };
  }
}

module.exports = AntiDetectionManager;
