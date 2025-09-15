// Feature Flag Configuration Test Fixtures for Motorcycle Maintenance Tracker
// Supports testing various feature rollout scenarios

export const featureFlags = {
  // Core UI enhancement flags
  iconSystem: {
    name: 'icon-system',
    description: 'Enable SVG icon system for better UI',
    enabled: true,
    rolloutPercentage: 100,
    environment: ['development', 'staging', 'production'],
    dependencies: [],
    metadata: {
      version: '1.0.0',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  enhancedThemes: {
    name: 'enhanced-themes',
    description: 'Advanced theme system with multiple variants',
    enabled: true,
    rolloutPercentage: 85,
    environment: ['development', 'staging'],
    dependencies: ['icon-system'],
    metadata: {
      version: '1.2.0',
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  accessibilityEnhancements: {
    name: 'accessibility-enhancements',
    description: 'High contrast themes and screen reader improvements',
    enabled: false,
    rolloutPercentage: 25,
    environment: ['development'],
    dependencies: ['enhanced-themes'],
    metadata: {
      version: '0.8.0',
      createdAt: '2024-01-14T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  // Motorcycle-specific feature flags
  advancedMaintenanceSchedule: {
    name: 'advanced-maintenance-schedule',
    description: 'Customizable maintenance schedules with weather-based adjustments',
    enabled: false,
    rolloutPercentage: 10,
    environment: ['development'],
    dependencies: ['icon-system'],
    metadata: {
      version: '0.5.0',
      createdAt: '2024-01-13T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  maintenanceReminders: {
    name: 'maintenance-reminders',
    description: 'Push notifications for upcoming maintenance',
    enabled: false,
    rolloutPercentage: 0,
    environment: ['development'],
    dependencies: ['advanced-maintenance-schedule'],
    metadata: {
      version: '0.3.0',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  weatherIntegration: {
    name: 'weather-integration',
    description: 'Adjust maintenance schedules based on weather conditions',
    enabled: false,
    rolloutPercentage: 5,
    environment: ['development'],
    dependencies: ['advanced-maintenance-schedule'],
    metadata: {
      version: '0.2.0',
      createdAt: '2024-01-14T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  // Performance and analytics flags
  performanceMonitoring: {
    name: 'performance-monitoring',
    description: 'Client-side performance tracking',
    enabled: true,
    rolloutPercentage: 100,
    environment: ['staging', 'production'],
    dependencies: [],
    metadata: {
      version: '1.0.0',
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    }
  },

  usageAnalytics: {
    name: 'usage-analytics',
    description: 'Anonymous usage tracking for feature optimization',
    enabled: true,
    rolloutPercentage: 75,
    environment: ['production'],
    dependencies: ['performance-monitoring'],
    metadata: {
      version: '1.1.0',
      createdAt: '2024-01-09T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z'
    }
  },

  // Experimental flags
  voiceCommands: {
    name: 'voice-commands',
    description: 'Voice input for hands-free maintenance logging',
    enabled: false,
    rolloutPercentage: 1,
    environment: ['development'],
    dependencies: ['icon-system', 'enhanced-themes'],
    experimental: true,
    metadata: {
      version: '0.1.0',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  },

  aiMaintenanceSuggestions: {
    name: 'ai-maintenance-suggestions',
    description: 'AI-powered maintenance recommendations',
    enabled: false,
    rolloutPercentage: 0,
    environment: ['development'],
    dependencies: ['advanced-maintenance-schedule'],
    experimental: true,
    metadata: {
      version: '0.1.0',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  }
};

// Environment-specific configurations
export const environmentConfigurations = {
  development: {
    name: 'development',
    allowExperimental: true,
    defaultRollout: 100,
    overrides: {
      'enhanced-themes': { enabled: true, rolloutPercentage: 100 },
      'accessibility-enhancements': { enabled: true, rolloutPercentage: 100 },
      'voice-commands': { enabled: true, rolloutPercentage: 100 }
    },
    debug: true
  },

  staging: {
    name: 'staging',
    allowExperimental: false,
    defaultRollout: 50,
    overrides: {
      'enhanced-themes': { enabled: true, rolloutPercentage: 100 }
    },
    debug: true
  },

  production: {
    name: 'production',
    allowExperimental: false,
    defaultRollout: 10,
    overrides: {
      'icon-system': { enabled: true, rolloutPercentage: 100 },
      'performance-monitoring': { enabled: true, rolloutPercentage: 100 }
    },
    debug: false
  }
};

// Rollout percentage scenarios for testing
export const rolloutScenarios = {
  userInRollout: {
    userId: 'user-123',
    userHash: 0.25, // 25% of user base
    featureFlag: 'enhanced-themes',
    rolloutPercentage: 85,
    expectedEnabled: true
  },

  userOutOfRollout: {
    userId: 'user-456',
    userHash: 0.95, // 95% of user base
    featureFlag: 'enhanced-themes',
    rolloutPercentage: 85,
    expectedEnabled: false
  },

  userInSmallRollout: {
    userId: 'user-789',
    userHash: 0.05, // 5% of user base
    featureFlag: 'weather-integration',
    rolloutPercentage: 5,
    expectedEnabled: true
  },

  userInFullRollout: {
    userId: 'user-321',
    userHash: 0.99, // 99% of user base
    featureFlag: 'icon-system',
    rolloutPercentage: 100,
    expectedEnabled: true
  }
};

// Feature dependency scenarios
export const dependencyScenarios = {
  validDependencies: {
    flagName: 'accessibility-enhancements',
    dependencies: ['enhanced-themes', 'icon-system'],
    dependencyStates: {
      'enhanced-themes': true,
      'icon-system': true
    },
    expectedEnabled: true
  },

  missingDependency: {
    flagName: 'accessibility-enhancements',
    dependencies: ['enhanced-themes', 'icon-system'],
    dependencyStates: {
      'enhanced-themes': false,
      'icon-system': true
    },
    expectedEnabled: false
  },

  circularDependency: {
    flagA: {
      name: 'feature-a',
      dependencies: ['feature-b']
    },
    flagB: {
      name: 'feature-b',
      dependencies: ['feature-a']
    },
    expectedError: 'Circular dependency detected'
  },

  deepDependencyChain: {
    flagName: 'ai-maintenance-suggestions',
    dependencyChain: [
      'advanced-maintenance-schedule',
      'icon-system'
    ],
    allEnabled: true,
    expectedEnabled: true
  }
};

// A/B testing scenarios
export const abTestingScenarios = {
  themeComparison: {
    name: 'theme-variant-test',
    description: 'Compare user engagement with different theme options',
    variants: {
      control: {
        name: 'current-themes',
        percentage: 50,
        features: {
          'enhanced-themes': false
        }
      },
      treatment: {
        name: 'enhanced-themes',
        percentage: 50,
        features: {
          'enhanced-themes': true
        }
      }
    },
    metrics: ['engagement', 'session-duration', 'feature-usage']
  },

  iconSystemTest: {
    name: 'icon-system-test',
    description: 'Test impact of icon system on user experience',
    variants: {
      control: {
        name: 'text-only',
        percentage: 30,
        features: {
          'icon-system': false
        }
      },
      icons: {
        name: 'with-icons',
        percentage: 40,
        features: {
          'icon-system': true
        }
      },
      enhanced: {
        name: 'enhanced-icons',
        percentage: 30,
        features: {
          'icon-system': true,
          'enhanced-themes': true
        }
      }
    },
    metrics: ['usability', 'task-completion', 'user-preference']
  }
};

// User segmentation for feature flags
export const userSegments = {
  powerUsers: {
    name: 'power-users',
    description: 'Users with high engagement and advanced feature usage',
    criteria: {
      maintenanceRecords: { min: 20 },
      lastActive: { within: '7 days' },
      featuresUsed: { min: 5 }
    },
    featureOverrides: {
      'advanced-maintenance-schedule': { enabled: true, rolloutPercentage: 100 },
      'voice-commands': { enabled: true, rolloutPercentage: 50 }
    }
  },

  newUsers: {
    name: 'new-users',
    description: 'Users registered within the last 30 days',
    criteria: {
      registeredWithin: '30 days',
      maintenanceRecords: { max: 5 }
    },
    featureOverrides: {
      'enhanced-themes': { enabled: true, rolloutPercentage: 100 },
      'icon-system': { enabled: true, rolloutPercentage: 100 }
    }
  },

  accessibilityUsers: {
    name: 'accessibility-users',
    description: 'Users with accessibility preferences enabled',
    criteria: {
      accessibilityPreferences: true,
      highContrast: true
    },
    featureOverrides: {
      'accessibility-enhancements': { enabled: true, rolloutPercentage: 100 }
    }
  }
};

// Feature flag evaluation scenarios
export const evaluationScenarios = {
  successfulEvaluation: {
    userId: 'user-123',
    environment: 'production',
    userSegment: 'power-users',
    flags: ['icon-system', 'enhanced-themes'],
    expectedResults: {
      'icon-system': true,
      'enhanced-themes': true
    }
  },

  failedDependency: {
    userId: 'user-456',
    environment: 'production',
    userSegment: 'new-users',
    flags: ['accessibility-enhancements'],
    expectedResults: {
      'accessibility-enhancements': false
    },
    reason: 'Missing dependency: enhanced-themes not enabled'
  },

  environmentRestriction: {
    userId: 'user-789',
    environment: 'production',
    userSegment: 'power-users',
    flags: ['voice-commands'],
    expectedResults: {
      'voice-commands': false
    },
    reason: 'Feature not enabled in production environment'
  }
};

export default featureFlags;