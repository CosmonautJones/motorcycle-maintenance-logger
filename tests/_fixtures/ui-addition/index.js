// UI Addition Test Fixtures - Main Loader
// Centralized access to all test fixtures for motorcycle maintenance tracker UI enhancements

// Import all fixture modules
import { iconFixtures, iconConfigurations, themeIconVariations, accessibilityScenarios as iconAccessibilityScenarios } from './icons/svg-icons.js';
import { themeConfigurations, userPreferenceScenarios, systemPreferenceScenarios, themeTransitions, componentThemeAdaptations } from './themes/theme-configurations.js';
import { featureFlags, environmentConfigurations, rolloutScenarios, dependencyScenarios, abTestingScenarios, userSegments, evaluationScenarios } from './feature-flags/flag-configurations.js';
import { maintenanceDataFixtures, domElementFixtures, componentStates, accessibilityTestScenarios, performanceTestScenarios } from './components/dom-elements.js';
import { pageStates, userInteractionScenarios, crossBrowserConfigurations, e2eTestScenarios } from './integration/page-states.js';

/**
 * Main fixture loader class for UI addition tests
 * Provides organized access to all test data with helper methods
 */
export class UIFixtureLoader {
  constructor() {
    this.fixtures = {
      icons: {
        svg: iconFixtures,
        configurations: iconConfigurations,
        themeVariations: themeIconVariations,
        accessibility: iconAccessibilityScenarios
      },
      themes: {
        configurations: themeConfigurations,
        userPreferences: userPreferenceScenarios,
        systemPreferences: systemPreferenceScenarios,
        transitions: themeTransitions,
        componentAdaptations: componentThemeAdaptations
      },
      featureFlags: {
        flags: featureFlags,
        environments: environmentConfigurations,
        rollouts: rolloutScenarios,
        dependencies: dependencyScenarios,
        abTesting: abTestingScenarios,
        userSegments: userSegments,
        evaluations: evaluationScenarios
      },
      components: {
        maintenanceData: maintenanceDataFixtures,
        domElements: domElementFixtures,
        states: componentStates,
        accessibility: accessibilityTestScenarios,
        performance: performanceTestScenarios
      },
      integration: {
        pageStates: pageStates,
        userInteractions: userInteractionScenarios,
        crossBrowser: crossBrowserConfigurations,
        e2eScenarios: e2eTestScenarios
      }
    };
  }

  // Icon fixture helpers
  getIcon(iconName, theme = 'default') {
    if (theme === 'default') {
      return this.fixtures.icons.svg[iconName];
    }
    return this.fixtures.icons.themeVariations[theme]?.[iconName];
  }

  getIconConfiguration(configName) {
    return this.fixtures.icons.configurations[configName];
  }

  getIconsForCategory(category) {
    return Object.entries(this.fixtures.icons.svg)
      .filter(([, icon]) => icon.category === category)
      .reduce((acc, [name, icon]) => {
        acc[name] = icon;
        return acc;
      }, {});
  }

  // Theme fixture helpers
  getTheme(themeName) {
    return this.fixtures.themes.configurations[themeName];
  }

  getUserPreferenceScenario(scenarioName) {
    return this.fixtures.themes.userPreferences[scenarioName];
  }

  getSystemPreferenceScenario(scenarioName) {
    return this.fixtures.themes.systemPreferences[scenarioName];
  }

  getThemeTransition(transitionName) {
    return this.fixtures.themes.transitions[transitionName];
  }

  // Feature flag helpers
  getFeatureFlag(flagName) {
    return this.fixtures.featureFlags.flags[flagName];
  }

  getEnvironmentConfig(environmentName) {
    return this.fixtures.featureFlags.environments[environmentName];
  }

  isFeatureEnabled(flagName, userId, environment = 'development') {
    const flag = this.getFeatureFlag(flagName);
    const envConfig = this.getEnvironmentConfig(environment);

    if (!flag || !flag.enabled) return false;
    if (!flag.environment.includes(environment)) return false;

    // Check dependencies
    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const dependency of flag.dependencies) {
        if (!this.isFeatureEnabled(dependency, userId, environment)) {
          return false;
        }
      }
    }

    // Simple rollout simulation based on user ID hash
    const userHash = this.hashUserId(userId);
    return userHash <= (flag.rolloutPercentage / 100);
  }

  getUserSegment(userId, userProfile) {
    for (const [segmentName, segment] of Object.entries(this.fixtures.featureFlags.userSegments)) {
      if (this.matchesSegmentCriteria(userProfile, segment.criteria)) {
        return segmentName;
      }
    }
    return 'default';
  }

  // Component fixture helpers
  getMaintenanceData(itemId) {
    return this.fixtures.components.maintenanceData[itemId];
  }

  getDOMElement(elementName) {
    return this.fixtures.components.domElements[elementName];
  }

  getComponentState(componentName, stateName) {
    return this.fixtures.components.states[componentName]?.[stateName];
  }

  // Integration test helpers
  getPageState(stateName) {
    return this.fixtures.integration.pageStates[stateName];
  }

  getUserInteractionScenario(scenarioName) {
    return this.fixtures.integration.userInteractions[scenarioName];
  }

  getBrowserConfiguration(browserName) {
    return this.fixtures.integration.crossBrowser[browserName];
  }

  getE2EScenario(scenarioName) {
    return this.fixtures.integration.e2eScenarios[scenarioName];
  }

  // Test data generators
  generateMaintenanceItems(count = 5, status = 'mixed') {
    const templates = Object.values(this.fixtures.components.maintenanceData);
    const items = [];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const item = { ...template };

      if (status === 'mixed') {
        const statuses = ['good', 'warning', 'danger'];
        item.status = statuses[i % statuses.length];
      } else {
        item.status = status;
      }

      item.id = `${item.id}-${i}`;
      items.push(item);
    }

    return items;
  }

  generateUserInteractionSteps(scenario, variations = {}) {
    const baseScenario = this.getUserInteractionScenario(scenario);
    if (!baseScenario) return null;

    const steps = [...baseScenario.steps];

    // Apply variations
    if (variations.theme) {
      steps.forEach(step => {
        if (step.expectedState) {
          step.expectedState.theme = variations.theme;
        }
      });
    }

    if (variations.withIcons !== undefined) {
      steps.forEach(step => {
        if (step.expectedState) {
          step.expectedState.hasIcons = variations.withIcons;
        }
      });
    }

    return { ...baseScenario, steps };
  }

  // Utility methods
  hashUserId(userId) {
    // Simple hash function for consistent rollout simulation
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  matchesSegmentCriteria(userProfile, criteria) {
    for (const [key, value] of Object.entries(criteria)) {
      if (key === 'maintenanceRecords') {
        const count = userProfile.maintenanceRecords?.length || 0;
        if (value.min && count < value.min) return false;
        if (value.max && count > value.max) return false;
      } else if (key === 'registeredWithin') {
        const registeredDate = new Date(userProfile.registeredAt);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(value.split(' ')[0]));
        if (registeredDate < daysAgo) return false;
      } else if (key === 'lastActive') {
        const lastActiveDate = new Date(userProfile.lastActive);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(value.within.split(' ')[0]));
        if (lastActiveDate < daysAgo) return false;
      }
      // Add more criteria matching as needed
    }
    return true;
  }

  // Validation helpers
  validateIconFixture(iconName) {
    const icon = this.getIcon(iconName);
    if (!icon) return { valid: false, error: `Icon '${iconName}' not found` };

    const required = ['svg', 'alt', 'sizes', 'category'];
    const missing = required.filter(field => !icon[field]);

    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    return { valid: true };
  }

  validateThemeConfiguration(themeName) {
    const theme = this.getTheme(themeName);
    if (!theme) return { valid: false, error: `Theme '${themeName}' not found` };

    const required = ['name', 'id', 'properties'];
    const missing = required.filter(field => !theme[field]);

    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    return { valid: true };
  }

  validateFeatureFlag(flagName) {
    const flag = this.getFeatureFlag(flagName);
    if (!flag) return { valid: false, error: `Feature flag '${flagName}' not found` };

    const required = ['name', 'description', 'enabled', 'rolloutPercentage', 'environment'];
    const missing = required.filter(field => flag[field] === undefined);

    if (missing.length > 0) {
      return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    return { valid: true };
  }
}

// Export a singleton instance
export const uiFixtures = new UIFixtureLoader();

// Export individual fixture categories for direct access
export {
  iconFixtures,
  iconConfigurations,
  themeIconVariations,
  themeConfigurations,
  userPreferenceScenarios,
  systemPreferenceScenarios,
  featureFlags,
  environmentConfigurations,
  maintenanceDataFixtures,
  domElementFixtures,
  componentStates,
  pageStates,
  userInteractionScenarios,
  crossBrowserConfigurations,
  e2eTestScenarios
};

// Export helper functions for common testing patterns
export const testHelpers = {
  // Create a mock DOM element based on fixture
  createMockElement(elementName, overrides = {}) {
    const fixture = uiFixtures.getDOMElement(elementName);
    if (!fixture) return null;

    return {
      ...fixture,
      ...overrides,
      getAttribute: (name) => fixture.attributes?.[name] || null,
      setAttribute: (name, value) => {
        if (!fixture.attributes) fixture.attributes = {};
        fixture.attributes[name] = value;
      },
      classList: {
        add: (className) => {
          const classes = fixture.className ? fixture.className.split(' ') : [];
          if (!classes.includes(className)) {
            classes.push(className);
            fixture.className = classes.join(' ');
          }
        },
        remove: (className) => {
          const classes = fixture.className ? fixture.className.split(' ') : [];
          fixture.className = classes.filter(c => c !== className).join(' ');
        },
        contains: (className) => {
          const classes = fixture.className ? fixture.className.split(' ') : [];
          return classes.includes(className);
        }
      }
    };
  },

  // Setup test environment with specific feature flags
  setupTestEnvironment(environment, enabledFlags = []) {
    const config = uiFixtures.getEnvironmentConfig(environment);
    const flagStates = {};

    enabledFlags.forEach(flagName => {
      flagStates[flagName] = true;
    });

    return {
      environment: config,
      flags: flagStates,
      cleanup: () => {
        // Reset any test state
      }
    };
  },

  // Generate test data for specific scenarios
  generateTestData(type, options = {}) {
    switch (type) {
      case 'maintenance-items':
        return uiFixtures.generateMaintenanceItems(options.count, options.status);
      case 'user-interaction':
        return uiFixtures.generateUserInteractionSteps(options.scenario, options.variations);
      default:
        return null;
    }
  }
};

export default uiFixtures;