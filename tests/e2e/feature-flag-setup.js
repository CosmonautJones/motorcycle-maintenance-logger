/**
 * Feature Flag Setup for E2E Tests
 * Configures feature flags based on environment variables
 */

const fs = require('fs');
const path = require('path');

async function globalSetup() {
  console.log('Setting up feature flag configuration for E2E tests...');

  try {
    // Read feature flag configuration from environment or file
    let featureFlags = {};

    if (process.env.FEATURE_FLAG_CONFIG) {
      featureFlags = JSON.parse(process.env.FEATURE_FLAG_CONFIG);
    } else if (process.env.FEATURE_FLAG_CONFIG_PATH) {
      const configPath = process.env.FEATURE_FLAG_CONFIG_PATH;
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        featureFlags = configData.flags || configData;
      }
    } else {
      // Default configuration for testing
      featureFlags = {
        'ui-addition': true,
        'enhanced-icons': true,
        'simplified-theme-toggle': true
      };
    }

    console.log('Feature flags configured:', JSON.stringify(featureFlags, null, 2));

    // Store configuration for tests to access
    const testConfigDir = path.join(process.cwd(), 'test-results', 'config');
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir, { recursive: true });
    }

    const configFile = path.join(testConfigDir, 'feature-flags.json');
    fs.writeFileSync(configFile, JSON.stringify({
      flags: featureFlags,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      ci: !!process.env.CI
    }, null, 2));

    // Set global variable for tests
    global.__FEATURE_FLAGS__ = featureFlags;

    console.log('✅ Feature flag setup complete');

  } catch (error) {
    console.error('❌ Failed to set up feature flags:', error);
    throw error;
  }
}

module.exports = globalSetup;