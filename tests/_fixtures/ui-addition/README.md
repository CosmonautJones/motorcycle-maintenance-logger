# UI Addition Test Fixtures

Comprehensive test fixtures for UI enhancement features in the Motorcycle Maintenance Tracker application. These fixtures support testing icon systems, themes, feature flags, UI components, and integration scenarios.

## Structure

```
tests/_fixtures/ui-addition/
├── icons/
│   └── svg-icons.js          # SVG icon fixtures and configurations
├── themes/
│   └── theme-configurations.js # Theme system test data
├── feature-flags/
│   └── flag-configurations.js  # Feature flag scenarios
├── components/
│   └── dom-elements.js        # UI component test data
├── integration/
│   └── page-states.js         # Integration test scenarios
├── index.js                   # Main fixture loader
└── README.md                  # This documentation
```

## Usage

### Basic Import

```javascript
import { uiFixtures } from './tests/_fixtures/ui-addition/index.js';

// Or import specific fixtures
import { iconFixtures, themeConfigurations } from './tests/_fixtures/ui-addition/index.js';
```

### Icon Testing

```javascript
// Get a specific icon
const oilIcon = uiFixtures.getIcon('oil');
console.log(oilIcon.svg); // SVG markup
console.log(oilIcon.alt); // Alt text for accessibility

// Get themed icon variation
const darkOilIcon = uiFixtures.getIcon('oil', 'dark');

// Get icons by category
const maintenanceIcons = uiFixtures.getIconsForCategory('maintenance');

// Validate icon fixture
const validation = uiFixtures.validateIconFixture('oil');
if (!validation.valid) {
  console.error(validation.error);
}
```

### Theme Testing

```javascript
// Get theme configuration
const lightTheme = uiFixtures.getTheme('light');
const darkTheme = uiFixtures.getTheme('dark');

// Test user preference scenarios
const systemFollower = uiFixtures.getUserPreferenceScenario('systemFollower');

// Test theme transitions
const transition = uiFixtures.getThemeTransition('lightToDark');
```

### Feature Flag Testing

```javascript
// Check if feature is enabled for user
const isEnabled = uiFixtures.isFeatureEnabled('enhanced-themes', 'user-123', 'production');

// Get rollout scenarios
const rollout = uiFixtures.fixtures.featureFlags.rollouts.userInRollout;

// Test dependency scenarios
const deps = uiFixtures.fixtures.featureFlags.dependencies.validDependencies;
```

### Component Testing

```javascript
// Get maintenance data for testing
const oilChangeData = uiFixtures.getMaintenanceData('oilChangeGood');

// Get DOM element fixtures
const tabButton = uiFixtures.getDOMElement('tabButton');

// Get component states
const activeTab = uiFixtures.getComponentState('tabButton', 'active');

// Generate test data
const maintenanceItems = uiFixtures.generateMaintenanceItems(10, 'mixed');
```

### Integration Testing

```javascript
// Get page states
const beforeState = uiFixtures.getPageState('beforeUIEnhancements');
const afterState = uiFixtures.getPageState('afterUIEnhancements');

// Get user interaction scenarios
const navFlow = uiFixtures.getUserInteractionScenario('navigationFlow');

// Test browser configurations
const chromeConfig = uiFixtures.getBrowserConfiguration('chrome');
```

## Test Helpers

### Mock Element Creation

```javascript
import { testHelpers } from './tests/_fixtures/ui-addition/index.js';

// Create mock DOM element
const mockButton = testHelpers.createMockElement('tabButton', {
  innerHTML: 'Custom Content'
});

// Mock element has classList and attribute methods
mockButton.classList.add('active');
mockButton.setAttribute('aria-selected', 'true');
```

### Test Environment Setup

```javascript
// Setup test environment with specific flags
const testEnv = testHelpers.setupTestEnvironment('development', [
  'icon-system',
  'enhanced-themes'
]);

// Use in tests
expect(testEnv.flags['icon-system']).toBe(true);

// Cleanup after test
testEnv.cleanup();
```

### Test Data Generation

```javascript
// Generate maintenance items
const items = testHelpers.generateTestData('maintenance-items', {
  count: 5,
  status: 'warning'
});

// Generate user interaction steps
const steps = testHelpers.generateTestData('user-interaction', {
  scenario: 'navigationFlow',
  variations: { theme: 'dark', withIcons: true }
});
```

## Fixture Categories

### 1. Icon Fixtures (`icons/svg-icons.js`)

- **SVG Icons**: Motorcycle maintenance-specific icons (oil, spark plugs, brakes, etc.)
- **Icon Configurations**: Size variants, accessibility options
- **Theme Variations**: Light/dark theme adaptations
- **Accessibility Scenarios**: Screen reader, keyboard navigation tests

### 2. Theme Fixtures (`themes/theme-configurations.js`)

- **Theme Configurations**: Light, dark, high-contrast themes
- **User Preferences**: Various user preference scenarios
- **System Detection**: OS/browser preference scenarios
- **Transitions**: Theme switching test data
- **Component Adaptations**: Theme-specific component styles

### 3. Feature Flag Fixtures (`feature-flags/flag-configurations.js`)

- **Flag Definitions**: UI enhancement feature flags
- **Environment Configs**: Development, staging, production settings
- **Rollout Scenarios**: Percentage-based rollout testing
- **Dependencies**: Feature dependency chains
- **A/B Testing**: Variant testing scenarios
- **User Segments**: Targeted feature rollouts

### 4. Component Fixtures (`components/dom-elements.js`)

- **Maintenance Data**: Realistic motorcycle maintenance records
- **DOM Elements**: Mock HTML elements with attributes
- **Component States**: Active, inactive, disabled states
- **Accessibility Tests**: WCAG compliance scenarios
- **Performance Tests**: Rendering performance data

### 5. Integration Fixtures (`integration/page-states.js`)

- **Page States**: Before/after UI enhancement states
- **User Interactions**: Complete user journey scenarios
- **Cross-Browser**: Browser-specific test configurations
- **E2E Scenarios**: End-to-end test workflows
- **Performance Metrics**: Page performance benchmarks

## Testing Patterns

### Unit Testing with Jest

```javascript
import { uiFixtures } from './tests/_fixtures/ui-addition/index.js';

describe('Icon System', () => {
  test('should render oil icon correctly', () => {
    const icon = uiFixtures.getIcon('oil');
    expect(icon.svg).toContain('<svg');
    expect(icon.category).toBe('maintenance');
    expect(icon.alt).toBe('Oil change maintenance');
  });

  test('should apply correct theme variations', () => {
    const lightIcon = uiFixtures.getIcon('oil', 'light');
    const darkIcon = uiFixtures.getIcon('oil', 'dark');

    expect(lightIcon.stroke).toBe('#e67e22');
    expect(darkIcon.stroke).toBe('#f39c12');
  });
});
```

### Component Testing

```javascript
import { render, screen } from '@testing-library/react';
import { uiFixtures } from './tests/_fixtures/ui-addition/index.js';

test('maintenance status card displays correctly', () => {
  const maintenanceData = uiFixtures.getMaintenanceData('oilChangeGood');

  render(<MaintenanceCard data={maintenanceData} />);

  expect(screen.getByText('Oil & Filter Change')).toBeInTheDocument();
  expect(screen.getByText('Good')).toBeInTheDocument();
});
```

### Integration Testing with Playwright

```javascript
import { test, expect } from '@playwright/test';
import { uiFixtures } from './tests/_fixtures/ui-addition/index.js';

test('complete user journey', async ({ page }) => {
  const scenario = uiFixtures.getE2EScenario('completeUserJourney');

  await page.goto('/');

  for (const step of scenario.steps) {
    // Execute step actions
    for (const action of step.actions) {
      if (action.action === 'click') {
        await page.click(action.target);
      }
    }

    // Verify assertions
    for (const assertion of step.assertions) {
      if (assertion.check === 'pageTitle') {
        await expect(page).toHaveTitle(assertion.equals);
      }
    }
  }
});
```

## Motorcycle Context Features

All fixtures are tailored to the motorcycle maintenance domain:

- **Suzuki Intruder Volusia 800**: Specific to the target motorcycle
- **Maintenance Types**: Oil change, spark plugs, air filter, brake fluid, etc.
- **Realistic Data**: Actual maintenance intervals and descriptions
- **User Scenarios**: Common motorcycle owner workflows
- **Performance Contexts**: Mobile-friendly for garage use

## Accessibility Focus

Fixtures include comprehensive accessibility testing support:

- **WCAG Compliance**: AA and AAA contrast ratios
- **Screen Reader**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Focus management and tab order
- **High Contrast**: Enhanced visibility options
- **Motor Impairments**: Large touch targets and interaction areas

## Performance Considerations

Performance test data covers:

- **Icon Rendering**: SVG vs raster performance
- **Theme Switching**: Transition smoothness
- **Large Datasets**: Virtual scrolling scenarios
- **Mobile Performance**: Touch device optimization
- **Network Conditions**: Various connection speeds

## Contributing

When adding new fixtures:

1. Follow existing naming conventions
2. Include accessibility scenarios
3. Add validation in the main loader
4. Update this documentation
5. Provide realistic motorcycle-related data
6. Include both light and dark theme variants

## Validation

All fixtures include validation methods:

```javascript
// Validate all icon fixtures
Object.keys(uiFixtures.fixtures.icons.svg).forEach(iconName => {
  const validation = uiFixtures.validateIconFixture(iconName);
  if (!validation.valid) {
    console.error(`Invalid icon fixture: ${iconName} - ${validation.error}`);
  }
});
```

This comprehensive fixture system ensures thorough testing coverage for all UI enhancement features while maintaining consistency with the motorcycle maintenance tracker domain.