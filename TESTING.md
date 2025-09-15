# Testing Guide for Motorcycle Maintenance Tracker

This document provides comprehensive information about the testing infrastructure and practices for the motorcycle maintenance tracker application.

## Overview

The application uses a multi-layered testing approach following Test-Driven Development (TDD) principles:

- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test interactions between components and user workflows
- **End-to-End Tests**: Test complete user journeys across the entire application
- **Accessibility Tests**: Ensure compliance with WCAG 2.1 Level AA standards
- **Performance Tests**: Validate loading times and resource usage

## Testing Stack

### Core Testing Tools
- **Jest**: Unit and integration testing framework
- **@testing-library/dom**: DOM testing utilities
- **@testing-library/user-event**: User interaction simulation
- **Playwright**: End-to-end testing framework
- **ESLint**: Code quality and consistency

### Testing Environment
- **jsdom**: Simulated DOM environment for unit tests
- **fake-indexeddb**: Mock IndexedDB for database testing
- **MSW (Mock Service Worker)**: API mocking for integration tests

## Installation and Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies
```bash
npm install
```

### Install Playwright Browsers
```bash
npx playwright install
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### With Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Playwright Tests in Headed Mode
```bash
npm run test:e2e:headed
```

### Debug Playwright Tests
```bash
npm run test:e2e:debug
```

## Test Structure

### Directory Layout
```
tests/
├── setup.js                 # Global test configuration
├── unit/                    # Unit tests
│   ├── ThemeManager.test.js
│   └── MotorcycleTracker.test.js
├── integration/             # Integration tests
│   └── user-workflows.test.js
└── e2e/                     # End-to-end tests
    ├── global-setup.js
    ├── global-teardown.js
    └── motorcycle-tracker.spec.js
```

### Test Naming Convention
- **Unit tests**: `ComponentName.test.js`
- **Integration tests**: `feature-workflow.test.js`
- **E2E tests**: `feature-name.spec.js`

## Unit Testing

### Testing Approach
Unit tests focus on testing individual classes and functions in isolation. They use mocks and stubs to eliminate external dependencies.

### Example: Testing ThemeManager
```javascript
describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    testUtils.createMockDOM();
    themeManager = new ThemeManager();
  });

  test('should initialize with default theme preference', () => {
    expect(themeManager.themePreference).toBeDefined();
    expect(['light', 'dark', 'system']).toContain(themeManager.themePreference);
  });

  test('should apply theme correctly', () => {
    themeManager.applyTheme('dark');
    expect(document.body.classList.contains('theme-dark')).toBe(true);
  });
});
```

### Unit Test Coverage Areas
- **ThemeManager**: Theme switching, preference persistence, system detection
- **MotorcycleTracker**: Maintenance calculations, data management, CRUD operations
- **Database Operations**: IndexedDB interactions, data migration
- **Form Validation**: Input validation, error handling
- **Event Handling**: User interactions, event delegation

## Integration Testing

### Testing Approach
Integration tests verify that multiple components work together correctly and test complete user workflows.

### Example: User Workflow Test
```javascript
test('should complete full workflow of adding work entry', async () => {
  const user = userEvent.setup();

  // Navigate to Add Work tab
  await user.click(screen.getByRole('button', { name: /add work/i }));

  // Fill out the form
  await user.type(screen.getByLabelText(/date/i), '2023-12-01');
  await user.type(screen.getByLabelText(/mileage/i), '15000');
  await user.selectOptions(screen.getByLabelText(/type/i), 'oil-change');
  await user.type(screen.getByLabelText(/description/i), 'Regular oil change');

  // Submit the form
  await user.click(screen.getByRole('button', { name: /add work/i }));

  // Verify work was added
  await waitFor(() => {
    expect(tracker.workHistory.length).toBeGreaterThan(0);
  });
});
```

### Integration Test Coverage Areas
- **Complete user workflows**: End-to-end user journeys
- **Form submissions**: Data validation and persistence
- **Navigation**: Tab switching and state management
- **Theme switching**: UI updates and persistence
- **Data import/export**: File handling and validation

## End-to-End Testing

### Testing Approach
E2E tests run against the actual application in a real browser environment, testing the complete user experience.

### Example: E2E Test
```javascript
test('should add a work entry successfully', async ({ page }) => {
  // Navigate to the application
  await page.goto('/');

  // Set initial mileage
  await page.fill('#currentMileage', '15000');
  await page.click('#updateMileageBtn');

  // Navigate to Add Work tab
  await page.click('[data-tab="add-work"]');

  // Fill out the form
  await page.fill('#workDate', '2023-12-01');
  await page.fill('#workMileage', '15000');
  await page.selectOption('#workType', 'oil-change');
  await page.fill('#workDescription', 'Regular oil change with synthetic oil');

  // Submit the form
  await page.click('button[type="submit"]');

  // Verify form was reset
  await expect(page.locator('#workMileage')).toHaveValue('');
});
```

### E2E Test Coverage Areas
- **Application loading**: Initial page load and setup
- **Navigation**: Tab switching and URL routing
- **Form interactions**: User input and validation
- **Data persistence**: Data survival across page reloads
- **Theme management**: Visual appearance changes
- **Responsive design**: Mobile and tablet layouts
- **Accessibility**: Keyboard navigation and screen readers
- **Performance**: Loading times and resource usage

## Accessibility Testing

### Automated Accessibility Testing
```javascript
test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Manual Testing Checklist
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible and clear
- [ ] Screen reader announcements are appropriate
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels are properly associated
- [ ] ARIA attributes are correctly implemented

## Performance Testing

### Lighthouse Integration
The CI pipeline includes Lighthouse performance audits:

```yaml
- name: Run Lighthouse CI
  run: |
    npm run dev &
    sleep 10
    lhci autorun --upload.target=temporary-public-storage
```

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## Test Data Management

### Test Utilities
The `testUtils` global object provides helper functions:

```javascript
// Create mock DOM structure
testUtils.createMockDOM();

// Create test data
const testWork = testUtils.createTestWorkEntry({
  mileage: 15000,
  type: 'oil-change'
});

const testItem = testUtils.createTestMaintenanceItem({
  intervalMiles: 3500
});

// Wait for async operations
await testUtils.waitFor(() => element.isVisible());
```

### Mock Data
- **Work Entries**: Realistic maintenance records
- **Maintenance Items**: Standard motorcycle maintenance schedule
- **User Preferences**: Theme and configuration settings

## Continuous Integration

### GitHub Actions Workflow
The CI pipeline runs automatically on:
- Push to main/master branches
- Pull request creation
- Scheduled daily runs

### Pipeline Stages
1. **Code Quality**: ESLint, security audit
2. **Unit Tests**: Jest tests with coverage
3. **Integration Tests**: Component interaction tests
4. **E2E Tests**: Cross-browser testing
5. **Accessibility**: WCAG compliance validation
6. **Performance**: Lighthouse audits
7. **Security**: Vulnerability scanning
8. **Deployment**: Automated deployment on success

### Quality Gates
- **Test Coverage**: Minimum 80% coverage required
- **ESLint**: No errors allowed
- **Security**: No high/critical vulnerabilities
- **Accessibility**: No violations
- **Performance**: Lighthouse score > 90

## Debugging Tests

### Jest Tests
```bash
# Debug specific test
npm test -- --testNamePattern="should apply theme correctly"

# Run with verbose output
npm test -- --verbose

# Watch mode for development
npm run test:watch
```

### Playwright Tests
```bash
# Debug mode with browser UI
npm run test:e2e:debug

# Run specific test file
npx playwright test motorcycle-tracker.spec.js

# Run with headed browser
npm run test:e2e:headed
```

### Common Debugging Tips
1. **Use `console.log`** in tests for debugging
2. **Add `await page.pause()`** in Playwright tests to inspect state
3. **Use Jest's `--verbose`** flag for detailed output
4. **Check browser console** in headed mode for client-side errors
5. **Use test snapshots** to capture and compare DOM state

## Best Practices

### Writing Tests
1. **Follow AAA pattern**: Arrange, Act, Assert
2. **Test behavior, not implementation**: Focus on what the user experiences
3. **Use descriptive test names**: Should read like specifications
4. **Keep tests independent**: Each test should be able to run in isolation
5. **Mock external dependencies**: Use mocks for APIs, timers, and random data

### Test Organization
1. **Group related tests**: Use `describe` blocks to organize tests logically
2. **Use beforeEach/afterEach**: Set up and tear down test state consistently
3. **Avoid test interdependence**: Tests should not rely on other tests
4. **Test edge cases**: Include boundary conditions and error scenarios
5. **Maintain test data**: Keep test fixtures up to date

### Performance
1. **Minimize DOM operations**: Use efficient selectors and queries
2. **Parallel test execution**: Run tests concurrently where possible
3. **Mock heavy operations**: Avoid actual network calls and file I/O
4. **Clean up resources**: Remove event listeners and clear timers
5. **Use test timeouts**: Set reasonable timeouts for async operations

## Troubleshooting

### Common Issues

#### "Element not found" errors
```javascript
// ❌ Wrong: Immediate query
const button = screen.getByRole('button', { name: /submit/i });

// ✅ Correct: Wait for element
await waitFor(() => {
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});
```

#### Async operation timing
```javascript
// ❌ Wrong: Fixed timeout
await page.waitForTimeout(1000);

// ✅ Correct: Wait for condition
await page.waitForSelector('.loading-spinner', { state: 'hidden' });
```

#### Theme persistence tests failing
```javascript
// Ensure localStorage is cleared between tests
beforeEach(() => {
  localStorage.clear();
});
```

### Getting Help
1. Check the test output for specific error messages
2. Review the GitHub Actions logs for CI failures
3. Use browser developer tools in headed mode
4. Consult the Jest and Playwright documentation
5. Check for similar issues in the project's issue tracker

## Contributing

### Adding New Tests
1. Follow the existing test structure and naming conventions
2. Include both positive and negative test cases
3. Add appropriate test documentation
4. Ensure new tests pass in CI environment
5. Update this documentation if adding new testing patterns

### Test Review Checklist
- [ ] Tests are well-named and descriptive
- [ ] All edge cases are covered
- [ ] Tests are properly isolated and independent
- [ ] Appropriate mocks and test data are used
- [ ] Tests pass consistently in CI environment
- [ ] Test coverage meets minimum requirements

This comprehensive testing infrastructure ensures the motorcycle maintenance tracker is reliable, accessible, and performant while supporting confident refactoring and feature development.