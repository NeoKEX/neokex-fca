# Overview

NeoKEX-FCA is an advanced Facebook Chat API library for Node.js that provides comprehensive messaging capabilities, real-time event handling, and extensive Facebook Messenger automation features. The library wraps Facebook's unofficial APIs to enable chatbot development, message automation, and social media interactions.

The project is designed as a modern, TypeScript-supported alternative to traditional Facebook Chat API implementations, with enhanced features including multi-format cookie support, MQTT-based real-time messaging, advanced thread management, and social media operations.

**Current Status (November 10, 2025):** v3.0.1 - Ready for npm publication. All critical bugs fixed and verified by architect review. New API functions added (getUnreadCount, scheduleMessage, getAttachmentMetadata). Singleton state eliminated, proper error handling implemented. Package properly configured with .npmignore, files field, and comprehensive documentation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Architecture Pattern

The library follows a **modular function-based architecture** with clear separation of concerns:

1. **Client Layer** (`src/core/client.js`) - Entry point that orchestrates login and API initialization
2. **Orchestrator Layer** (`src/core/orchestrator/`) - Handles login flow, API building, and configuration
3. **Engine Layer** (`src/engine/functions/`) - Contains all API function implementations organized by category
4. **Helper Layer** (`src/helpers/`) - Shared utilities for network requests, parsing, and data formatting

**Design Rationale**: This layered approach allows for easy function discovery, testing, and maintenance. Each API function is self-contained and can be developed independently.

## Authentication & Session Management

**Cookie-Based Authentication**: The library uses Facebook cookies (appState) rather than username/password login to avoid triggering Facebook's security measures.

**Multi-Format Cookie Support**: Accepts 6+ formats including:
- Arrays of cookie objects
- Semicolon/comma/newline-separated strings
- JSON strings
- Plain objects

**Rationale**: Facebook actively blocks automated logins. Cookie-based authentication is more reliable and supports users extracting cookies from their browser sessions.

## Real-Time Communication

**MQTT Protocol**: Uses MQTT over WebSocket for real-time message listening (`src/engine/functions/realtime/listenMqtt.js`)

**Dual Protocol Support**:
- MQTT for message events
- WebSocket (Lightspeed) for real-time notifications (`src/engine/functions/realtime/listenSpeed.js`)
- Additional WebSocket for general realtime events (`src/engine/functions/realtime/realtime.js`)

**Auto-Reconnection**: Implements exponential backoff and automatic reconnection with randomized timing to avoid detection patterns.

**Rationale**: MQTT provides lower latency than HTTP polling and is the native protocol Facebook Messenger uses. Multiple connection types ensure comprehensive event coverage.

## Network Layer

**HTTP Client**: Uses Axios with cookie jar support (`axios-cookiejar-support`)

**Request Strategy**:
- Automatic retry logic with exponential backoff (up to 5 attempts)
- Cookie persistence across requests
- Dynamic user agent generation (Windows, Mac, Linux variants)
- Proxy support via HTTPS proxy agent

**Header Management**: Generates realistic browser headers including sec-ch-ua headers to mimic genuine browser requests (`src/helpers/headers.js`)

**Rationale**: Facebook employs sophisticated bot detection. The library mimics real browser behavior through authentic headers, user agents, and request patterns.

## Message Processing

**Delta Parsing**: Converts Facebook's internal delta format to user-friendly event objects (`src/helpers/processors/data/formatDelta.js`)

**Event Types Handled**:
- Messages (text, attachments, stickers)
- Thread events (name changes, member additions/removals)
- Typing indicators
- Read receipts
- Reactions

**Attachment Handling**: Supports photos, videos, files, animated images, voice clips, and stickers with URL resolution.

**Rationale**: Facebook's raw event format is complex and varies by event type. Standardizing to a consistent format simplifies bot development.

## Function Organization

Functions are categorized into logical groups:

- **messaging/** - Send, edit, delete, forward, search messages
- **conversations/** - Thread management, archiving, muting, polls
- **accounts/** - User info, blocked users, profile data
- **social/** - Comments, likes, posts, shares
- **auth/** - Login, logout, session management
- **network/** - HTTP operations, custom requests
- **realtime/** - Event listeners, MQTT connections

**Rationale**: Category-based organization makes the API discoverable and maintainable as features grow.

## Advanced Features

**Bulk Operations**: Send messages to multiple threads with configurable delays to avoid rate limiting

**Poll Management**: Create and vote on polls in group conversations

**Thread Operations**: Archive, mute, search messages within threads

**Media Downloads**: Download attachments from messages

**Message Reactions**: Set emoji reactions via MQTT

**Sticker API**: Search, list, and send stickers from Facebook's sticker packs

**Rationale**: These features extend beyond basic messaging to provide comprehensive Messenger automation capabilities that weren't available in traditional FCA implementations.

## TypeScript Support

Includes comprehensive type definitions (`lib/types/index.d.ts`) for:
- API methods
- Event objects
- Configuration options
- Message formats

**Rationale**: Type safety improves developer experience and catches errors at compile time.

## Error Handling Strategy

**Graceful Degradation**: Functions return error objects rather than throwing exceptions where appropriate (e.g., `gcmember`, `gcrule`)

**Retry Logic**: Network requests automatically retry on 5xx errors

**Detailed Logging**: Uses chalk for colorful console output with different log levels (error, warn, log)

**Rationale**: Facebook's APIs can be unreliable. Robust error handling prevents bot crashes and provides useful debugging information.

# Recent Changes (v3.0.1 - November 10, 2025)

## Critical Bug Fixes

1. **sendMessage.js** - Fixed ReferenceError when attachment upload fails (resData undefined in error handling)
2. **sendMessage.js** - Fixed missing return value in getUrl function for URL attachments
3. **client.js** - Eliminated singleton state to prevent cross-user session leakage in concurrent logins

## New API Functions

1. **getUnreadCount** (`src/engine/functions/conversations/getUnreadCount.js`) - Get unread message counts for specific threads or all threads
2. **scheduleMessage** (`src/engine/functions/messaging/scheduleMessage.js`) - Schedule messages to be sent at specific times (in-memory with persistence warning)
3. **getAttachmentMetadata** (`src/engine/functions/utilities/getAttachmentMetadata.js`) - Get metadata about attachments without downloading them

## NPM Publishing Preparation

1. Created `.npmignore` to exclude test files, demos, and sensitive data
2. Added `files` field to package.json for explicit package content control
3. Removed test files and sensitive data (cookies.json, test-*.js, final-demo.js - 1471 lines deleted)
4. Enhanced TypeScript definitions for new API functions
5. Updated README with comprehensive documentation and examples
6. Updated CHANGELOG to reflect all changes in v3.0.1

# External Dependencies

## Core Dependencies

- **axios** (^1.9.0) - HTTP client for API requests
- **axios-cookiejar-support** (^4.0.7) - Cookie persistence across requests
- **tough-cookie** - Cookie jar implementation
- **mqtt** - MQTT client for real-time messaging
- **websocket-stream** - WebSocket streams for realtime connections
- **undici** - Modern HTTP client with WebSocket support

## Parsing & Data Processing

- **cheerio** (^0.22.0) - HTML parsing for extracting script tags containing JSON data
- **deepdash** (^5.3.9) - Deep object manipulation utilities
- **lodash** - General utility functions
- **jsonpath-plus** - JSON querying for complex data extraction

## Network & Proxy

- **https-proxy-agent** - HTTP/HTTPS proxy support
- **form-data** (^4.0.3) - Multipart form data for file uploads

## Utilities

- **chalk** (^3.0.0) - Terminal string styling for logs
- **gradient-string** (^1.1.0) - Gradient text for branding
- **freeport** (^1.0.5) - Find available ports
- **express** (^4.19.2) - Potentially for webhook endpoints (not actively used in core)

## Type Definitions

- **@types/tinycolor2** - TypeScript definitions for color manipulation

**Note**: The library does not currently use a database (Postgres, MongoDB, etc.), but the architecture would support adding database integration for message logging, session persistence, or user management in future versions.