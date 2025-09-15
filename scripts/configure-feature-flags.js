#!/usr/bin/env node

/**
 * Feature Flag Configuration Script
 *
 * Configures feature flags for different testing environments and scenarios.
 * Used by CI/CD pipeline to set up proper testing contexts.
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const flagsArg = args.find(arg => arg.startsWith('--flags='));

const environment = envArg ? envArg.split('=')[1] : 'development';
const flagCombination = flagsArg ? flagsArg.split('=')[1] : 'all-enabled';

console.log(`Configuring feature flags for ${environment} environment with ${flagCombination} configuration...`);

// Base feature flag configurations
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
    'enhanced-icons': true,
    'simplified-theme-toggle': false
  }
};

// Environment-specific configurations
const environmentConfigs = {
  'production': {
    debug: false,
    logging: 'error',
    performance: {
      monitoring: true,
      thresholds: {
        fcp: 1800,
        lcp: 2500,
        cls: 0.1
      }
    }
  },
  'staging': {
    debug: false,
    logging: 'warn',
    performance: {
      monitoring: true,
      thresholds: {
        fcp: 2000,
        lcp: 3000,
        cls: 0.15
      }
    }
  },
  'development': {
    debug: true,
    logging: 'debug',
    performance: {
      monitoring: false,
      thresholds: {
        fcp: 3000,
        lcp: 4000,
        cls: 0.25
      }
    }
  }
};

function createConfiguration() {
  const baseFlags = flagConfigurations[flagCombination] || flagConfigurations['all-enabled'];
  const envConfig = environmentConfigs[environment] || environmentConfigs['development'];

  const config = {
    environment,
    flagCombination,
    timestamp: new Date().toISOString(),
    flags: baseFlags,
    ...envConfig,
    metadata: {
      version: '1.0.0',
      generatedBy: 'configure-feature-flags.js',
      ciRun: !!process.env.CI,
      gitCommit: process.env.GITHUB_SHA || 'unknown',
      branch: process.env.GITHUB_REF_NAME || 'unknown'
    }
  };

  return config;
}

function writeConfigurations(config) {
  const outputDir = path.join(process.cwd(), 'test-configs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write main configuration file
  const configPath = path.join(outputDir, `config-${environment}-${flagCombination}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Write environment variable file for CI
  const envPath = path.join(outputDir, `env-${environment}-${flagCombination}.env`);
  const envContent = [
    `FEATURE_FLAG_CONFIG=${JSON.stringify(config.flags)}`,
    `ENVIRONMENT=${environment}`,
    `FLAG_COMBINATION=${flagCombination}`,
    `DEBUG=${config.debug}`,
    `LOG_LEVEL=${config.logging}`,
    `PERFORMANCE_MONITORING=${config.performance.monitoring}`,
    `FCP_THRESHOLD=${config.performance.thresholds.fcp}`,
    `LCP_THRESHOLD=${config.performance.thresholds.lcp}`,
    `CLS_THRESHOLD=${config.performance.thresholds.cls}`
  ].join('\n');
  fs.writeFileSync(envPath, envContent);

  // Write Playwright configuration override
  const playwrightConfigPath = path.join(outputDir, `playwright-${environment}-${flagCombination}.config.js`);
  const playwrightConfig = generatePlaywrightConfig(config);
  fs.writeFileSync(playwrightConfigPath, playwrightConfig);

  // Write Lighthouse configuration
  const lighthouseConfigPath = path.join(outputDir, `lighthouserc-${environment}-${flagCombination}.js`);
  const lighthouseConfig = generateLighthouseConfig(config);
  fs.writeFileSync(lighthouseConfigPath, lighthouseConfig);

  return {
    configPath,
    envPath,
    playwrightConfigPath,
    lighthouseConfigPath
  };
}

function generatePlaywrightConfig(config) {
  return `// Auto-generated Playwright configuration for ${config.environment} environment
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-${config.environment}',
      use: {
        browserName: 'chromium',
        // Inject feature flags into page context
        extraHTTPHeaders: {
          'X-Feature-Flags': '${JSON.stringify(config.flags).replace(/"/g, '\\"')}'
        }
      },
    }
  ],
  webServer: {
    command: 'python -m http.server 8000',
    port: 8000,
    reuseExistingServer: !process.env.CI,
  },
  // Environment-specific test configuration
  globalSetup: require.resolve('./tests/e2e/feature-flag-setup.js'),
});`;
}

function generateLighthouseConfig(config) {
  return `// Auto-generated Lighthouse configuration for ${config.environment} environment
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8000'],
      numberOfRuns: ${config.environment === 'production' ? 5 : 3},
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: ${config.flags['ui-addition'] ? '[]' : '["unused-css-rules"]'}
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: ${config.performance.thresholds.fcp < 2000 ? 0.8 : 0.7} }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: ${config.performance.thresholds.fcp} }],
        'largest-contentful-paint': ['error', { maxNumericValue: ${config.performance.thresholds.lcp} }],
        'cumulative-layout-shift': ['error', { maxNumericValue: ${config.performance.thresholds.cls} }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 8080
    }
  }
};`;
}

function createTestDataFiles(config) {
  const testDataDir = path.join(process.cwd(), 'test-data', 'feature-flags');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  // Create test data for different scenarios
  const testScenarios = [
    {
      name: 'basic-navigation',
      description: 'Test basic navigation with current flag configuration',
      steps: [
        'Navigate to dashboard',
        'Switch between tabs',
        'Verify icons visibility',
        'Test theme toggle'
      ]
    },
    {
      name: 'accessibility-validation',
      description: 'Validate accessibility with current configuration',
      steps: [
        'Run axe-core audit',
        'Test keyboard navigation',
        'Verify ARIA attributes',
        'Test screen reader compatibility'
      ]
    },
    {
      name: 'performance-baseline',
      description: 'Establish performance baseline for current configuration',
      steps: [
        'Measure page load time',
        'Check Core Web Vitals',
        'Monitor icon loading performance',
        'Validate memory usage'
      ]
    }
  ];

  testScenarios.forEach(scenario => {
    const scenarioConfig = {
      ...scenario,
      environment: config.environment,
      flags: config.flags,
      timestamp: config.timestamp
    };

    const scenarioPath = path.join(testDataDir, `${scenario.name}-${environment}-${flagCombination}.json`);
    fs.writeFileSync(scenarioPath, JSON.stringify(scenarioConfig, null, 2));
  });

  return testDataDir;
}

// Main execution
try {
  const config = createConfiguration();
  console.log('Generated configuration:', JSON.stringify(config, null, 2));

  const files = writeConfigurations(config);
  const testDataDir = createTestDataFiles(config);

  console.log('✅ Configuration files created:');
  Object.entries(files).forEach(([key, path]) => {
    console.log(`  ${key}: ${path}`);
  });

  console.log(`✅ Test data directory: ${testDataDir}`);

  // Output environment variables for CI
  if (process.env.CI) {
    console.log('\n--- Environment Variables for CI ---');
    console.log(`FEATURE_FLAG_CONFIG=${JSON.stringify(config.flags)}`);
    console.log(`CONFIG_PATH=${files.configPath}`);
    console.log(`ENV_PATH=${files.envPath}`);
    console.log(`PLAYWRIGHT_CONFIG=${files.playwrightConfigPath}`);
    console.log(`LIGHTHOUSE_CONFIG=${files.lighthouseConfigPath}`);
  }

} catch (error) {
  console.error('❌ Failed to configure feature flags:', error.message);
  console.error(error.stack);
  process.exit(1);
}