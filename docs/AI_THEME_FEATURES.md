# Advanced AI Theme Features

## Overview

NeoKEX-FCA now includes advanced AI theme generation capabilities that allow you to create and apply custom AI-generated themes to Messenger conversations. These features integrate with both Facebook's built-in AI theme generator and external image generation APIs.

## New API Methods

### 1. `generateAitheme(options, callback)`

The main function that generates AI-powered themes and applies them to chat threads.

**Parameters:**
- `options` (Object):
  - `prompt` (String, required): Description of the desired theme
  - `threadID` (String, required): The thread ID to apply the theme to
  - `useExternalAPI` (Boolean, optional): Whether to use external image API (default: false)
  - `externalAPIUrl` (String, optional): URL of external image generation API (default: "https://tawsif.is-a.dev/seedream/gen")
- `callback` (Function): Callback function with signature `(err, result)`

**Example:**
```javascript
api.generateAitheme({
  prompt: "A beautiful sunset over ocean waves",
  threadID: "1234567890",
  useExternalAPI: true
}, (err, result) => {
  if (err) return console.error(err);
  console.log("Theme applied:", result);
});
```

**Response:**
```javascript
{
  success: true,
  theme: { /* theme object */ },
  themeFBID: "123456789",
  threadID: "1234567890",
  applied: true,
  imageUrl: "https://..." // if useExternalAPI is true
}
```

### 2. `createAITheme(prompt, callback)`

Creates an AI theme without applying it to a thread.

**Parameters:**
- `prompt` (String): Description of the desired theme
- `callback` (Function): Callback with signature `(err, themes)`

**Example:**
```javascript
api.createAITheme("Space nebula with purple and blue colors", (err, themes) => {
  if (err) return console.error(err);
  console.log("Generated themes:", themes);
});
```

### 3. `setThreadThemeMqtt(threadID, themeFBID, callback)`

Applies a theme to a thread using MQTT (requires active MQTT connection).

**Parameters:**
- `threadID` (String): The thread ID to apply the theme to
- `themeFBID` (String): The Facebook theme ID
- `callback` (Function): Callback with signature `(err, result)`

**Example:**
```javascript
api.setThreadThemeMqtt("1234567890", "987654321", (err, result) => {
  if (err) return console.error(err);
  console.log("Theme applied successfully:", result);
});
```

## Bypass and Protection Features

### 4. `bypassAutomatedBehavior(callback)`

Attempts to bypass Facebook's automated behavior detection system.

**Example:**
```javascript
api.bypassAutomatedBehavior((err, result) => {
  if (err) return console.error(err);
  console.log("Bypass successful:", result);
});
```

**When to use:**
- When you receive automated behavior warnings
- Periodically in long-running bots
- After high-volume operations

### 5. `clearAdvertisingID(callback)`

Clears advertising ID to avoid Facebook advertising issues.

**Example:**
```javascript
api.clearAdvertisingID((err, result) => {
  if (err) return console.error(err);
  console.log("Advertising ID cleared:", result);
});
```

## Complete Example

```javascript
const login = require("neokex-fca");

login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
  if (err) return console.error(err);

  // Generate and apply AI theme
  api.generateAitheme({
    prompt: "Vibrant tropical beach with palm trees",
    threadID: "1234567890",
    useExternalAPI: true
  }, (err, result) => {
    if (err) return console.error(err);
    console.log("AI theme applied successfully!");
    console.log("Theme ID:", result.themeFBID);
    console.log("Generated image:", result.imageUrl);
  });

  // Bypass automated behavior detection
  api.bypassAutomatedBehavior((err) => {
    if (err) return console.error("Bypass failed:", err);
    console.log("Protection active");
  });

  // Listen for messages
  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    if (event.type === "message") {
      console.log("New message:", event.body);
    }
  });
});
```

## Best Practices

1. **Use External API Carefully**: The external image API may have rate limits. Use `useExternalAPI: false` for Facebook's built-in AI theme generator if you encounter issues.

2. **MQTT Connection Required**: Theme application via MQTT requires an active MQTT connection. Ensure you're using `listenMqtt()` before attempting to apply themes.

3. **Bypass Protection**: Use `bypassAutomatedBehavior()` periodically in long-running bots to avoid detection issues.

4. **Error Handling**: Always implement proper error handling for all API calls.

5. **Prompt Quality**: More descriptive prompts produce better themes. Be specific about colors, mood, and visual elements.

## Security Improvements

The library has been updated to remove deprecated security vulnerabilities:

- ✅ Removed deprecated `request` library
- ✅ Updated `tough-cookie` to resolve peer dependency conflicts
- ✅ Now using modern `axios` for all HTTP requests
- ✅ Added retry logic and exponential backoff for improved reliability

## Troubleshooting

**Theme not applying:**
- Ensure MQTT connection is active
- Check that the threadID is correct
- Verify bot has permission to modify the thread

**External API issues:**
- The library will automatically fall back to Facebook's AI if the external API fails
- Check the response for `imageUrl` to confirm external API was used

**Automated behavior warnings:**
- Call `bypassAutomatedBehavior()` immediately
- Reduce bot activity frequency
- Add delays between operations

## Credits

- AI Theme Generation: Based on work by Allou Mohamed
- Enhanced by NeoKEX team
- External API integration by NeoKEX

## Support

For issues and feature requests, please visit: https://github.com/NeoKEX/neokex-fca/issues
