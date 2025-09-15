module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard',
    'plugin:jest/recommended'
  ],
  plugins: [
    'jest'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Dexie global
    Dexie: 'readonly',

    // Test utilities
    testUtils: 'readonly'
  },
  rules: {
    // Customize rules as needed
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',

    // Jest specific rules
    'jest/prefer-expect-assertions': 'off',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',

    // Allow console in tests
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};