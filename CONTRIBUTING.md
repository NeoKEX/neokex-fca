# Contributing to NeoKEX-FCA

Thank you for your interest in contributing to NeoKEX-FCA! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Guidelines](#code-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue tracker](https://github.com/NeoKEX/neokex-fca/issues) to avoid duplicates.

When creating a bug report, please include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Code samples** if applicable
- **Environment details**:
  - Node.js version
  - neokex-fca version
  - Operating system
- **Error messages** and stack traces

**Example:**
```markdown
## Bug: sendMessage fails with Error 1545012

### Steps to Reproduce
1. Login with valid appState
2. Call api.sendMessage("test", threadID)
3. Error occurs

### Expected Behavior
Message should be sent successfully

### Actual Behavior
Error 1545012 is thrown immediately

### Environment
- Node.js: v22.0.0
- neokex-fca: v4.2.5
- OS: Ubuntu 22.04
```

---

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed enhancement
- **Explain why this enhancement would be useful**
- **Provide examples** of how it would be used
- **List any alternatives** you've considered

---

### Contributing Code

We love pull requests! Here's how you can contribute code:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test your changes** thoroughly
5. **Commit your changes** with clear commit messages
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

---

## Development Setup

### Prerequisites

- Node.js v22 or higher
- npm (comes with Node.js)
- Git

### Setup Steps

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/neokex-fca.git
   cd neokex-fca
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `appstate.json` for testing:**
   - Follow instructions in [README.md](README.md#getting-started)
   - **Never commit this file!** (it's in `.gitignore`)

4. **Run tests:**
   ```bash
   npm run validate
   ```

5. **Run the test bot:**
   ```bash
   npm run bot
   ```

---

## Code Guidelines

### File Structure

```
neokex-fca/
├── src/
│   ├── apis/          # API method implementations
│   ├── engine/        # Core login and session management
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── examples/          # Usage examples
├── test/             # Test files (not published)
└── index.js          # Main entry point
```

### Coding Standards

#### JavaScript Style

- Use **ES6+ features** where appropriate
- Use **async/await** instead of callbacks for new code
- Use **meaningful variable names**
- Keep functions **small and focused**
- Add **JSDoc comments** for public APIs

**Good Example:**
```javascript
/**
 * Sends a message to a thread.
 * @param {string} message - The message to send
 * @param {string} threadID - The thread ID
 * @returns {Promise<Object>} Message info
 */
async function sendMessage(message, threadID) {
  if (!message || !threadID) {
    throw new Error('message and threadID are required');
  }
  
  const result = await this.sendMessageMqtt(message, threadID);
  return result;
}
```

**Bad Example:**
```javascript
function sm(m, t) {  // Unclear function and parameter names
  // No documentation
  // No error handling
  return this.sendMessageMqtt(m, t);
}
```

#### TypeScript Definitions

- Keep `src/types/index.d.ts` up to date
- Use proper types (avoid `any` when possible)
- Document all exported interfaces and types

#### Error Handling

- Always handle errors gracefully
- Provide meaningful error messages
- Include context in errors (threadID, messageID, etc.)

**Example:**
```javascript
try {
  await api.sendMessage(message, threadID);
} catch (err) {
  console.error(`Failed to send message to ${threadID}:`, err.message);
  throw err;
}
```

---

### Documentation

When adding or modifying features:

1. **Update API_REFERENCE.md** with new methods
2. **Update README.md** if necessary
3. **Add examples** to demonstrate usage
4. **Update CHANGELOG.md** with your changes
5. **Add JSDoc comments** to all public functions

---

### Testing

#### Manual Testing

Before submitting a PR:

1. **Run the test bot:**
   ```bash
   npm run bot
   ```

2. **Test your specific feature** in a real conversation

3. **Verify no regressions** in existing features

#### Validation Tests

Run validation tests before committing:

```bash
npm run validate
```

This checks:
- Package structure
- Required files presence
- No syntax errors

#### Testing Checklist

- [ ] Code runs without errors
- [ ] Test bot works with new changes
- [ ] Validation tests pass
- [ ] No breaking changes to existing APIs (unless major version)
- [ ] Documentation is updated
- [ ] Examples work as documented

---

## Pull Request Process

### Before Submitting

1. **Test thoroughly** on your local machine
2. **Update documentation** as needed
3. **Follow code style guidelines**
4. **Write clear commit messages**
5. **Update CHANGELOG.md** under "Unreleased" section

### Commit Message Format

Use clear, descriptive commit messages:

```
feat: add message editing support
fix: resolve Error 1545012 retry logic
docs: update API reference for themes
refactor: simplify MQTT connection logic
test: add validation for message sending
```

**Prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Motivation
Why is this change needed?

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests pass
- [ ] CHANGELOG.md updated
```

### Review Process

1. **Automated checks** will run on your PR
2. **Maintainers will review** your code
3. **Address feedback** if requested
4. **PR will be merged** once approved

---

## Suggesting Enhancements

### Feature Requests

Feature requests should include:

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - How would it work?
3. **Use cases** - Real-world examples
4. **Alternatives considered** - Other ways to solve the problem

**Example:**
```markdown
## Feature Request: Auto-reconnect on disconnect

### Problem
When MQTT connection drops, bots stop receiving messages

### Proposed Solution
Add automatic reconnection with exponential backoff

### Use Cases
- Long-running bots
- Unstable network environments

### Alternatives
- Manual reconnection (current approach)
- Connection health monitoring
```

---

## API Design Principles

When adding new APIs:

1. **Consistency** - Follow existing patterns
2. **Clarity** - Clear, descriptive names
3. **Flexibility** - Support both callbacks and promises
4. **Error handling** - Provide meaningful errors
5. **Documentation** - Complete JSDoc comments

**Example:**
```javascript
/**
 * Retrieves thread information.
 * @param {string | string[]} threadID - Single thread ID or array
 * @param {Function} [callback] - Optional callback
 * @returns {Promise<Object | Record<string, Object>>}
 */
async function getThreadInfo(threadID, callback) {
  // Implementation
}
```

---

## Questions?

If you have questions about contributing:

- **Check existing issues** and pull requests
- **Read the documentation** thoroughly
- **Ask on GitHub Discussions** (if available)
- **Open an issue** with the "question" label

---

## License

By contributing to NeoKEX-FCA, you agree that your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- CHANGELOG.md for notable features

Thank you for contributing to NeoKEX-FCA! 🎉
