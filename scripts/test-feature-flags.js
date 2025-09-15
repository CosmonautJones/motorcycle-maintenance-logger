#!/usr/bin/env node

/**
 * Feature Flag Testing Script
 *
 * Runs comprehensive tests across different feature flag combinations
 * to ensure UI addition features work correctly in all configurations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const flagsArg = args.find(arg => arg.startsWith('--flags='));

const environment = envArg ? envArg.split('=')[1] : 'development';
const flagCombination = flagsArg ? flagsArg.split('=')[1] : 'all-enabled';

console.log(`Running feature flag tests for ${environment} environment with ${flagCombination} configuration...`);

// Feature flag configurations
const flagConfigurations = {
  'all-enabled': {
    'ui-addition': true,
    'enhanced-icons': true,
    'simplified-theme-toggle': true
  },
  'all-disabled': {
    'ui-addition': false,
    'enhanced-icons': false,
    'simplified-theme-toggle': false
  },
  'icons-only': {
    'ui-addition': true,
    'enhanced-icons': true,
    'simplified-theme-toggle': false
  },
  'theme-only': {
    'ui-addition': true,
    'enhanced-icons': false,
    'simplified-theme-toggle': true
  },
  'mixed': {
    'ui-addition': true,
    'enhanced-icons': Math.random() > 0.5, // Random for chaos testing
    'simplified-theme-toggle': Math.random() > 0.5
  }
};

// Environment-specific overrides
const environmentOverrides = {
  'production': {
    // More conservative settings for production
    'experimental-features': false,
    'debug-mode': false
  },
  'staging': {
    'experimental-features': true,
    'debug-mode': false
  },
  'development': {
    'experimental-features': true,
    'debug-mode': true
  }
};

function createFeatureFlagConfig(combination, env) {
  const baseConfig = flagConfigurations[combination] || flagConfigurations['all-enabled'];
  const envConfig = environmentOverrides[env] || {};

  return {
    ...baseConfig,
    ...envConfig,
    environment: env,
    timestamp: new Date().toISOString()
  };
}

function writeConfigFile(config) {
  const configDir = path.join(process.cwd(), 'test-results', 'feature-flags');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configPath = path.join(configDir, `config-${environment}-${flagCombination}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  return configPath;
}

function runTestSuite(config, configPath) {
  const results = {
    environment,
    flagCombination,
    config,
    tests: [],
    startTime: new Date().toISOString(),
    endTime: null,
    success: false,
    errors: []
  };

  try {
    console.log('Running unit tests for UI addition modules...');

    // Set environment variable for tests
    process.env.FEATURE_FLAG_CONFIG = JSON.stringify(config);
    process.env.FEATURE_FLAG_CONFIG_PATH = configPath;

    // Run unit tests for UI modules
    try {
      execSync('npm run test:ui-addition', {
        stdio: 'inherit',
        env: { ...process.env, FEATURE_FLAG_CONFIG: JSON.stringify(config) }
      });
      results.tests.push({ name: 'unit-tests', status: 'passed' });
    } catch (error) {
      results.tests.push({ name: 'unit-tests', status: 'failed', error: error.message });
      results.errors.push(`Unit tests failed: ${error.message}`);
    }

    // Run integration tests
    try {
      console.log('Running integration tests...');
      execSync('npm run test:integration', {
        stdio: 'inherit',
        env: { ...process.env, FEATURE_FLAG_CONFIG: JSON.stringify(config) }
      });
      results.tests.push({ name: 'integration-tests', status: 'passed' });
    } catch (error) {
      results.tests.push({ name: 'integration-tests', status: 'failed', error: error.message });
      results.errors.push(`Integration tests failed: ${error.message}`);
    }

    // Run E2E tests for UI additions
    try {
      console.log('Running E2E tests for UI additions...');
      execSync('npm run test:e2e:ui-addition', {
        stdio: 'inherit',
        env: { ...process.env, FEATURE_FLAG_CONFIG: JSON.stringify(config) }
      });
      results.tests.push({ name: 'e2e-ui-tests', status: 'passed' });
    } catch (error) {
      results.tests.push({ name: 'e2e-ui-tests', status: 'failed', error: error.message });
      results.errors.push(`E2E UI tests failed: ${error.message}`);
    }

    // Run accessibility tests
    try {
      console.log('Running accessibility tests...');
      execSync('npm run test:accessibility:ui-addition', {
        stdio: 'inherit',
        env: { ...process.env, FEATURE_FLAG_CONFIG: JSON.stringify(config) }
      });
      results.tests.push({ name: 'accessibility-tests', status: 'passed' });
    } catch (error) {
      results.tests.push({ name: 'accessibility-tests', status: 'failed', error: error.message });
      results.errors.push(`Accessibility tests failed: ${error.message}`);
    }

    results.success = results.errors.length === 0;

  } catch (error) {
    results.errors.push(`Test suite execution failed: ${error.message}`);
    results.success = false;
  }

  results.endTime = new Date().toISOString();

  // Write results
  const resultsPath = path.join(path.dirname(configPath), `results-${environment}-${flagCombination}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  return results;
}

function generateSummaryReport(results) {
  console.log('\n=== FEATURE FLAG TEST SUMMARY ===');
  console.log(`Environment: ${results.environment}`);
  console.log(`Flag Combination: ${results.flagCombination}`);
  console.log(`Success: ${results.success ? '✅' : '❌'}`);
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`Passed: ${results.tests.filter(t => t.status === 'passed').length}`);
  console.log(`Failed: ${results.tests.filter(t => t.status === 'failed').length}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('\nTest Results:');
  results.tests.forEach(test => {
    const status = test.status === 'passed' ? '✅' : '❌';
    console.log(`  ${status} ${test.name}`);
    if (test.error) {
      console.log(`    Error: ${test.error}`);
    }
  });

  console.log('\n================================\n');
}

// Main execution
try {
  const config = createFeatureFlagConfig(flagCombination, environment);
  const configPath = writeConfigFile(config);

  console.log(`Feature flag configuration written to: ${configPath}`);
  console.log('Configuration:', JSON.stringify(config, null, 2));

  const results = runTestSuite(config, configPath);
  generateSummaryReport(results);

  // Exit with appropriate code
  process.exit(results.success ? 0 : 1);

} catch (error) {
  console.error('Failed to run feature flag tests:', error.message);
  process.exit(1);
}