# Overview

NeoKEX-FCA is an advanced Node.js library for the Facebook Chat API, designed for developing chatbots, automating messages, and managing social media interactions. It provides comprehensive messaging capabilities, real-time event handling, and extensive Facebook Messenger automation features by wrapping Facebook's unofficial APIs.

The project aims to be a modern, TypeScript-supported alternative, offering features like multi-format cookie support, MQTT-based real-time messaging, advanced thread management, and various social media operations. Its core purpose is to provide a stable, robust, and feature-rich foundation for developers building Facebook Messenger automation tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Architecture Pattern

The library employs a **modular function-based architecture** with distinct layers:
1.  **Client Layer**: Manages login and API initialization.
2.  **Orchestrator Layer**: Handles the login flow, API construction, and configuration.
3.  **Engine Layer**: Contains all API function implementations, categorized by type.
4.  **Helper Layer**: Provides shared utilities for network, parsing, and data formatting.
This layered design promotes modularity, testability, and maintainability.

## Authentication & Session Management

Authentication relies on **cookie-based session management** (appState) to enhance reliability and avoid Facebook's automated login blocks. It supports over six different cookie formats, including arrays of objects, various string formats, and JSON.

## Real-Time Communication

The library utilizes **MQTT over WebSocket** for real-time message listening and a separate **WebSocket (Lightspeed)** for notifications, ensuring comprehensive event coverage. It features robust **auto-reconnection** with exponential backoff to maintain continuous connectivity and evade detection.

## Network Layer

**Axios** serves as the HTTP client, integrated with `axios-cookiejar-support` for cookie persistence. The network layer incorporates:
-   Automatic retry logic with exponential backoff.
-   Dynamic user agent generation and proxy support.
-   Realistic browser header management, including `sec-ch-ua` headers, to mimic genuine browser behavior and bypass bot detection.

## Message Processing

Facebook's internal delta format is converted into user-friendly event objects. The system handles various event types, including text messages, attachments, thread events, typing indicators, and read receipts. Attachment handling includes resolving URLs for various media types.

## Function Organization

API functions are logically grouped into categories such as `messaging/`, `conversations/`, `accounts/`, `social/`, `auth/`, `network/`, and `realtime/` to improve discoverability and maintainability.

## Advanced Features

Key advanced capabilities include:
-   **Bulk Operations**: Sending messages to multiple threads with rate-limiting considerations.
-   **Poll Management**: Creating and voting on polls.
-   **Thread Operations**: Archiving, muting, and searching messages within threads.
-   **Media Downloads**: Facilitating attachment downloads.
-   **Message Reactions**: Setting emoji reactions via MQTT.
-   **Sticker API**: Searching, listing, and sending stickers.

## TypeScript Support

Comprehensive TypeScript definitions are provided for API methods, event objects, configuration options, and message formats to enhance developer experience and compile-time error checking.

## Error Handling Strategy

The library employs a robust error handling approach with:
-   **Graceful Degradation**: Functions return error objects rather than throwing exceptions when appropriate.
-   **Retry Logic**: Automatic retries for network requests on 5xx errors.
-   **Detailed Logging**: Colorful console output with different log levels.
-   **Thread Membership Error Handling**: `sendMessage` includes optional pre-validation and graceful error modes for error 1545012 (not a participant), with automatic cache invalidation for invalid threads.

# External Dependencies

-   **HTTP Clients**: `axios`, `axios-cookiejar-support`, `tough-cookie`, `undici`
-   **Real-time & Networking**: `mqtt`, `websocket-stream`, `https-proxy-agent`, `form-data`
-   **Parsing & Data Manipulation**: `cheerio`, `deepdash`, `lodash`, `jsonpath-plus`
-   **Utilities**: `chalk`, `gradient-string`, `freeport`, `express` (potentially for webhooks, not core)
-   **Type Definitions**: `@types/tinycolor2`