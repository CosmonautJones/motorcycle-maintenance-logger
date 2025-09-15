# Test Suite Documentation

Comprehensive testing framework for the Motorcycle Maintenance Tracker UI addition features.

## Overview

This test suite follows Test-Driven Development (TDD) principles with:
- **NEW MODULES**: TDD approach (red → green → refactor)
- **EXISTING MODULES**: Characterization tests to lock behavior before changes

## Test Structure

```
tests/
├── unit/                           # Unit tests for individual components
│   ├── IconManager.test.js        # NEW - SVG icon system tests
│   ├── SimplifiedThemeManager.test.js  # NEW - Enhanced theme controls
│   ├── ThemeManager.characterization.test.js  # EXISTING - Lock current behavior
│   ├── ThemeManager.test.js       # EXISTING - Current tests
│   └── FeatureFlags.test.js       # EXISTING - Enhanced with integration
├── integration/                   # Component interaction tests
│   ├── FeatureFlags.integration.test.js  # NEW - Feature flag integration
│   ├── accessibility.test.js     # NEW - WCAG 2.1 AA compliance
│   └── user-workflows.test.js     # EXISTING - User journey tests
├── e2e/                          # End-to-end browser tests
│   └── motorcycle-tracker.spec.js # EXISTING - Full application tests
└── setup.js                     # Global test configuration
```

## Running Tests

### Prerequisites

Ensure you have Node.js >= 18.0.0 installed:

```bash
node --version
npm --version
```

Install dependencies:

```bash
npm install
```

### Test Commands

#### Windows (PowerShell/Command Prompt)

```powershell
# Run all tests
npm test

# Run with watch mode for development
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/unit/IconManager.test.js

# Run tests matching pattern
npx jest --testNamePattern="IconManager"

# Run tests in debug mode
npx jest --runInBand --detectOpenHandles tests/unit/IconManager.test.js
```

#### POSIX (Linux/macOS/WSL)

```bash
# Run all tests
npm test

# Run with watch mode for development
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/unit/IconManager.test.js

# Run tests matching pattern
npx jest --testNamePattern="IconManager"

# Run tests in debug mode
npx jest --runInBand --detectOpenHandles tests/unit/IconManager.test.js
```

## Debugging Tests

### Visual Studio Code (Windows/POSIX)

1. **Install Extensions**:
   - Jest Test Explorer
   - JavaScript Debugger

2. **Debug Configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-coverage",
        "${file}"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "windows": {
        "program": "${workspaceFolder}/node_modules/jest/bin/jest.js"
      }
    },
    {
      "name": "Debug Current Jest Test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-coverage",
        "${relativeFile}"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "windows": {
        "program": "${workspaceFolder}/node_modules/jest/bin/jest.js"
      }
    }
  ]
}
```

3. **Debug Steps**:
   - Open test file
   - Set breakpoints
   - Press `F5` or use "Debug Current Jest Test"

### Chrome DevTools (Windows/POSIX)

```bash
# Windows
node --inspect-brk ./node_modules/jest/bin/jest.js --runInBand tests/unit/IconManager.test.js

# POSIX
node --inspect-brk ./node_modules/.bin/jest --runInBand tests/unit/IconManager.test.js
```

Then open `chrome://inspect` in Chrome and connect.

### Command Line Debugging

#### Windows
```powershell
# Enable debug logging
$env:DEBUG="*"
npm test

# Run single test with verbose output
npx jest --verbose --no-coverage tests/unit/IconManager.test.js

# Run with Node.js debugging
node --inspect-brk .\node_modules\jest\bin\jest.js --runInBand tests/unit/IconManager.test.js
```

#### POSIX
```bash
# Enable debug logging
DEBUG=* npm test

# Run single test with verbose output
npx jest --verbose --no-coverage tests/unit/IconManager.test.js

# Run with Node.js debugging
node --inspect-brk ./node_modules/.bin/jest --runInBand tests/unit/IconManager.test.js
```

## Test Categories

### Unit Tests

#### IconManager (NEW - TDD)
- **File**: `tests/unit/IconManager.test.js`
- **Coverage**: Icon retrieval, accessibility, theme compatibility
- **Key Tests**:
  - Happy path: Basic icon retrieval with caching
  - Edge cases: Non-existent icons, malformed SVG
  - Error cases: Network failures, invalid parameters
  - Accessibility: ARIA attributes, screen reader support
  - Performance: Caching, memory management

#### SimplifiedThemeManager (NEW - TDD)
- **File**: `tests/unit/SimplifiedThemeManager.test.js`
- **Coverage**: Toggle functionality, persistence, system detection removal
- **Key Tests**:
  - Happy path: Light/dark theme toggling
  - Edge cases: Invalid saved preferences, corrupted localStorage
  - Error cases: Missing DOM elements, invalid theme values
  - Accessibility: Keyboard navigation, ARIA states

#### ThemeManager Characterization (EXISTING - Lock Behavior)
- **File**: `tests/unit/ThemeManager.characterization.test.js`
- **Purpose**: Document and lock current behavior before modifications
- **Coverage**: All existing functionality exactly as implemented

### Integration Tests

#### FeatureFlags Integration (NEW)
- **File**: `tests/integration/FeatureFlags.integration.test.js`
- **Coverage**: Feature flag integration with UI components
- **Key Tests**:
  - UI addition feature flag activation/deactivation
  - Child flag dependencies (enhanced-icons, simplified-theme)
  - Environment-based flag behavior
  - Gradual rollout percentage testing

#### Accessibility Compliance (NEW)
- **File**: `tests/integration/accessibility.test.js`
- **Coverage**: WCAG 2.1 AA compliance
- **Key Tests**:
  - ARIA attributes and semantics
  - Keyboard navigation support
  - Screen reader compatibility
  - Color contrast and visual accessibility
  - Error states and feedback

### End-to-End Tests

#### Complete User Journeys
- **File**: `tests/e2e/motorcycle-tracker.spec.js`
- **Coverage**: Full application workflows with new features
- **Browsers**: Chromium, Firefox, WebKit

## Coverage Requirements

### Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

#### Windows
```powershell
# Generate coverage report
npm run test:coverage

# Open HTML report
start coverage/lcov-report/index.html
```

#### POSIX
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report (Linux)
xdg-open coverage/lcov-report/index.html

# Open HTML report (macOS)
open coverage/lcov-report/index.html
```

## Feature Flag Testing

### Development Environment
```javascript
// Override flags for testing
featureFlags.override('ui-addition', true);
featureFlags.override('enhanced-icons', true);
featureFlags.override('simplified-theme', true);
```

### Testing Scenarios
1. **Feature OFF**: Test fallback UI behavior
2. **Feature ON**: Test enhanced UI features
3. **Partial Rollout**: Test percentage-based activation
4. **Child Dependencies**: Test flag hierarchy

## Accessibility Testing

### Automated Tests
- ARIA attribute validation
- Keyboard navigation testing
- Screen reader content verification
- Color contrast checking

### Manual Testing Checklist
- [ ] Screen reader navigation (NVDA/JAWS/VoiceOver)
- [ ] Keyboard-only navigation
- [ ] High contrast mode compatibility
- [ ] Reduced motion preference support

### Testing Tools
- **jest-axe**: Automated accessibility testing
- **@testing-library/dom**: DOM testing utilities
- **@testing-library/user-event**: User interaction simulation

## Common Issues and Solutions

### Windows-Specific Issues

#### Path Separators
```javascript
// Use path.join() for cross-platform compatibility
const iconPath = path.join(__dirname, '..', 'assets', 'icons', 'wrench.svg');
```

#### PowerShell Execution Policy
```powershell
# If scripts are blocked
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### POSIX-Specific Issues

#### File Permissions
```bash
# Fix executable permissions
chmod +x node_modules/.bin/jest
```

#### Environment Variables
```bash
# Set NODE_ENV for testing
export NODE_ENV=test
npm test
```

### Common Test Failures

#### Mock Issues
```javascript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

#### Async Test Issues
```javascript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### DOM Cleanup
```javascript
// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
```

## Test Data and Fixtures

### Icon Test Assets
- Located in: `assets/icons/`
- Test icons: `wrench.svg`, `gear.svg`, `oil-drop.svg`, `calendar.svg`

### Mock Data
- Feature flag configurations: `config/flags.json`
- Theme test data: Built into test files
- User context mocks: Generated in tests

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Push to any branch
- Pull request creation/update
- Schedule (daily)

### Local CI Simulation
```bash
# Run the same checks as CI
npm run lint
npm run test:coverage
npm run test:e2e
```

## Performance Testing

### Test Execution Speed
- Unit tests: < 5 seconds
- Integration tests: < 15 seconds
- E2E tests: < 60 seconds

### Memory Usage
- Monitor test memory usage with `--detectOpenHandles`
- Clean up resources in `afterEach` hooks

## Maintenance

### Adding New Tests
1. Follow existing naming conventions
2. Include all three test types (happy path, edge cases, error cases)
3. Add accessibility tests for UI components
4. Update this README with new test descriptions

### Updating Existing Tests
1. Run characterization tests first to understand current behavior
2. Update tests incrementally
3. Maintain backward compatibility where possible
4. Document any breaking changes

### Test Review Checklist
- [ ] Tests follow TDD principles (red → green → refactor)
- [ ] Accessibility compliance is verified
- [ ] Error cases are covered
- [ ] Tests are deterministic and not flaky
- [ ] Documentation is updated

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright E2E Testing](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)