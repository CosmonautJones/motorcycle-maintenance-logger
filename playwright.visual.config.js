// Playwright configuration for visual regression testing
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory for visual tests
  testDir: './tests/visual',

  // Maximum time one test can run for
  timeout: 60 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/visual-regression-report' }],
    ['json', { outputFile: 'test-results/visual-regression-results.json' }]
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:8000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video on failure
    video: 'retain-on-failure',

    // Take screenshot on failure AND success for comparison
    screenshot: 'only-on-failure',

    // Browser context options
    contextOptions: {
      // Ignore HTTPS errors
      ignoreHTTPSErrors: true,
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium-baseline',
      use: {
        ...devices['Desktop Chrome'],
        // Consistent viewport for visual testing
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'firefox-baseline',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'webkit-baseline',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Mobile visual testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // Consistent mobile viewport
        viewport: { width: 375, height: 667 }
      },
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 812 }
      },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/visual/global-setup.js'),
  globalTeardown: require.resolve('./tests/visual/global-teardown.js'),

  // Run your local dev server before starting the tests
  webServer: {
    command: 'python -m http.server 8000',
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Visual testing specific configuration
  expect: {
    // Visual comparison threshold
    threshold: 0.2,
    // Animations can cause flaky visual tests
    toHaveScreenshot: {
      threshold: 0.2,
      // Wait for animations to complete
      animations: 'disabled',
      // Mask dynamic content
      mask: [
        // Mask any timestamps or dynamic content
        '[data-testid="timestamp"]',
        '.current-time',
        // Mask any user-generated content that might change
        '[data-dynamic="true"]'
      ]
    },
    toMatchSnapshot: {
      threshold: 0.2,
      animations: 'disabled'
    }
  },

  // Global test timeout
  globalTimeout: 15 * 60 * 1000, // 15 minutes
});