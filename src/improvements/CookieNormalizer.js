"use strict";

class CookieNormalizer {
  static REQUIRED_KEYS = ['c_user', 'xs'];
  
  static normalize(cookieInput) {
    if (!cookieInput) {
      throw new Error('Cookie input is required');
    }

    let cookies = [];

    if (Array.isArray(cookieInput)) {
      cookies = this.parseArrayFormat(cookieInput);
    } else if (typeof cookieInput === 'string') {
      cookies = this.detectAndParseString(cookieInput);
    } else if (typeof cookieInput === 'object') {
      cookies = this.parseObjectFormat(cookieInput);
    } else {
      throw new Error('Unsupported cookie format');
    }

    this.validateCookies(cookies);
    return this.deduplicateCookies(cookies);
  }

  static parseArrayFormat(cookieArray) {
    return cookieArray.map(cookie => {
      if (typeof cookie === 'string') {
        return this.parseSingleCookieString(cookie);
      }
      
      return {
        key: cookie.key || cookie.name,
        value: cookie.value,
        domain: cookie.domain || '.facebook.com',
        path: cookie.path || '/',
        expires: cookie.expires || cookie.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() / 1000,
        secure: cookie.secure !== false,
        httpOnly: cookie.httpOnly !== false,
      };
    });
  }

  static parseObjectFormat(cookieObj) {
    return Object.entries(cookieObj).map(([key, value]) => ({
      key: key,
      value: typeof value === 'object' ? value.value : value,
      domain: '.facebook.com',
      path: '/',
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() / 1000,
      secure: true,
      httpOnly: true,
    }));
  }

  static detectAndParseString(cookieString) {
    cookieString = cookieString.trim();

    if (cookieString.startsWith('[') || cookieString.startsWith('{')) {
      try {
        const parsed = JSON.parse(cookieString);
        return this.normalize(parsed);
      } catch (e) {
        throw new Error('Invalid JSON cookie format');
      }
    }

    if (this.isNetscapeFormat(cookieString)) {
      return this.parseNetscapeFormat(cookieString);
    }

    if (cookieString.includes('=') && (cookieString.includes(';') || cookieString.includes('\n'))) {
      return this.parseMultipleCookieString(cookieString);
    }

    throw new Error('Unable to detect cookie format');
  }

  static isNetscapeFormat(str) {
    const lines = str.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    if (lines.length === 0) return false;
    
    const firstLine = lines[0].split('\t');
    return firstLine.length >= 6;
  }

  static parseNetscapeFormat(netscapeString) {
    const lines = netscapeString.split('\n');
    const cookies = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const parts = trimmed.split('\t');
      
      if (parts.length >= 7) {
        cookies.push({
          key: parts[5],
          value: parts[6],
          domain: parts[0],
          path: parts[2],
          expires: parseInt(parts[4]),
          secure: parts[3] === 'TRUE',
          httpOnly: true,
        });
      }
    }

    return cookies;
  }

  static parseMultipleCookieString(cookieString) {
    const cookies = [];
    
    const separators = ['\n', ';'];
    let cookiePairs = [cookieString];
    
    for (const sep of separators) {
      if (cookieString.includes(sep)) {
        cookiePairs = cookieString.split(sep);
        break;
      }
    }

    for (const pair of cookiePairs) {
      const cookie = this.parseSingleCookieString(pair.trim());
      if (cookie) {
        cookies.push(cookie);
      }
    }

    return cookies;
  }

  static parseSingleCookieString(cookieStr) {
    cookieStr = cookieStr.trim();
    
    const attributes = cookieStr.split(';').map(s => s.trim());
    const [keyValue, ...flags] = attributes;
    
    if (!keyValue || !keyValue.includes('=')) {
      return null;
    }

    const [key, ...valueParts] = keyValue.split('=');
    const value = valueParts.join('=');

    const cookie = {
      key: key.trim(),
      value: value.trim(),
      domain: '.facebook.com',
      path: '/',
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).getTime() / 1000,
      secure: true,
      httpOnly: true,
    };

    for (const flag of flags) {
      const lowerFlag = flag.toLowerCase();
      
      if (lowerFlag.startsWith('domain=')) {
        cookie.domain = flag.split('=')[1].trim();
      } else if (lowerFlag.startsWith('path=')) {
        cookie.path = flag.split('=')[1].trim();
      } else if (lowerFlag.startsWith('expires=')) {
        cookie.expires = new Date(flag.split('=')[1].trim()).getTime() / 1000;
      } else if (lowerFlag === 'secure') {
        cookie.secure = true;
      } else if (lowerFlag === 'httponly') {
        cookie.httpOnly = true;
      }
    }

    return cookie;
  }

  static validateCookies(cookies) {
    if (!Array.isArray(cookies) || cookies.length === 0) {
      throw new Error('No valid cookies found');
    }

    const cookieKeys = cookies.map(c => c.key);
    const missingKeys = this.REQUIRED_KEYS.filter(k => !cookieKeys.includes(k));

    if (missingKeys.length > 0) {
      throw new Error(`Missing required cookies: ${missingKeys.join(', ')}`);
    }

    return true;
  }

  static deduplicateCookies(cookies) {
    const seen = new Map();
    
    for (const cookie of cookies.reverse()) {
      if (!seen.has(cookie.key)) {
        seen.set(cookie.key, cookie);
      }
    }

    return Array.from(seen.values()).reverse();
  }
}

module.exports = CookieNormalizer;
