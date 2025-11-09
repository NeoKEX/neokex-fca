"use strict";

const cron = require("node-cron");

class SessionGuardian {
  constructor(api, ctx, defaultFuncs, options = {}) {
    this.api = api;
    this.ctx = ctx;
    this.defaultFuncs = defaultFuncs;
    this.enabled = options.antiLogout !== false;
    this.keepAliveInterval = options.keepAliveInterval || 5;
    this.autoRefreshToken = options.autoRefreshToken !== false;
    this.cronJob = null;
    this.lastKeepAlive = 0;
    this.keepAliveCount = 0;
    this.logger = options.logger;
  }

  start() {
    if (!this.enabled) {
      return;
    }

    this.cronJob = cron.schedule(`*/${this.keepAliveInterval} * * * *`, async () => {
      await this.performKeepAlive();
    });

    if (this.logger) {
      this.logger.log(`SessionGuardian started - Keep-alive every ${this.keepAliveInterval} minutes`);
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    if (this.logger) {
      this.logger.log('SessionGuardian stopped');
    }
  }

  async performKeepAlive() {
    if (!this.enabled || !this.ctx || !this.ctx.loggedIn) {
      return;
    }

    try {
      this.lastKeepAlive = Date.now();
      this.keepAliveCount++;

      await this.sendPresencePing();

      if (this.autoRefreshToken && this.keepAliveCount % 6 === 0) {
        await this.refreshTokens();
      }

      if (this.logger && this.logger.debug) {
        this.logger.debug(`Keep-alive #${this.keepAliveCount} successful`);
      }
    } catch (error) {
      if (this.logger && this.logger.error) {
        this.logger.error('Keep-alive failed:', error.message);
      }
    }
  }

  async sendPresencePing() {
    if (!this.ctx || !this.defaultFuncs) {
      return;
    }

    try {
      const form = {
        av: this.ctx.userID,
        fb_api_caller_class: 'RelayModern',
        fb_api_req_friendly_name: 'PresencePing',
        variables: JSON.stringify({
          input: {
            actor_id: this.ctx.userID,
            client_mutation_id: Math.round(Math.random() * 1e19).toString(),
          },
        }),
        doc_id: '4574518382645705',
      };

      await this.defaultFuncs.post(
        'https://www.facebook.com/api/graphql/',
        this.ctx.jar,
        form,
        this.ctx.globalOptions
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshTokens() {
    if (!this.api || !this.api.refreshFb_dtsg) {
      return;
    }

    try {
      const newTokens = await this.api.refreshFb_dtsg();
      
      if (newTokens && newTokens.fb_dtsg) {
        this.ctx.fb_dtsg = newTokens.fb_dtsg;
        this.ctx.jazoest = newTokens.jazoest;

        if (this.logger && this.logger.log) {
          this.logger.log('Session tokens refreshed successfully');
        }

        return true;
      }
    } catch (error) {
      if (this.logger && this.logger.warn) {
        this.logger.warn('Token refresh failed:', error.message);
      }
      return false;
    }
  }

  async detectAndHandleCheckpoint() {
    if (!this.ctx || !this.defaultFuncs) {
      return false;
    }

    try {
      const response = await this.defaultFuncs.get(
        'https://www.facebook.com/',
        this.ctx.jar,
        null,
        this.ctx.globalOptions
      );

      if (response && response.request && response.request.uri) {
        const url = response.request.uri.href;
        
        if (url.includes('/checkpoint/')) {
          if (this.logger && this.logger.warn) {
            this.logger.warn('Checkpoint detected - attempting recovery');
          }

          await this.attemptCheckpointRecovery();
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async attemptCheckpointRecovery() {
    try {
      const bypassForm = {
        av: this.ctx.userID,
        fb_api_caller_class: 'RelayModern',
        fb_api_req_friendly_name: 'FBScrapingWarningMutation',
        variables: '{}',
        server_timestamps: true,
        doc_id: 6339492849481770,
        fb_dtsg: this.ctx.fb_dtsg,
        jazoest: this.ctx.jazoest,
      };

      await this.defaultFuncs.post(
        'https://www.facebook.com/api/graphql/',
        this.ctx.jar,
        bypassForm,
        this.ctx.globalOptions
      );

      await this.refreshTokens();

      return true;
    } catch (error) {
      return false;
    }
  }

  getStatus() {
    return {
      enabled: this.enabled,
      keepAliveInterval: this.keepAliveInterval,
      autoRefreshToken: this.autoRefreshToken,
      keepAliveCount: this.keepAliveCount,
      lastKeepAlive: this.lastKeepAlive,
      isRunning: this.cronJob !== null,
    };
  }

  updateInterval(minutes) {
    if (minutes < 1 || minutes > 60) {
      throw new Error('Keep-alive interval must be between 1 and 60 minutes');
    }

    this.keepAliveInterval = minutes;
    
    if (this.cronJob) {
      this.stop();
      this.start();
    }
  }
}

module.exports = SessionGuardian;
