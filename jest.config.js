module.exports = {
  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'script.js',
    'src/**/*.js',
    // Ensure UI addition modules are included
    'src/IconManager.js',
    'src/SimplifiedThemeManager.js',
    'src/FeatureFlags.js',
    '!node_modules/**',
    '!tests/**',
    '!coverage/**',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Specific thresholds for UI addition modules
    './src/IconManager.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/SimplifiedThemeManager.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/FeatureFlags.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // Module name mapping for mocking
  moduleNameMapper: {
    // Mock CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },

  // Test timeout
  testTimeout: 10000,

  // Globals
  globals: {
    'window': {},
    'document': {},
    'navigator': {},
    'localStorage': {},
    'indexedDB': {}
  },

  // Transform configuration (for ES6+ syntax)
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true
};