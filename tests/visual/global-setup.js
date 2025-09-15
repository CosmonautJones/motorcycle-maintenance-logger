/**
 * Global setup for visual regression tests
 * Prepares baseline images and test environment
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalSetup() {
  console.log('Setting up visual regression testing environment...');

  // Create baseline directories
  const baselineDirs = [
    'test-results/visual-regression/baselines',
    'test-results/visual-regression/current',
    'test-results/visual-regression/diffs'
  ];

  baselineDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Launch browser for baseline generation if needed
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  try {
    // Navigate to application
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Enable UI addition features for baseline
    await page.addInitScript(() => {
      localStorage.setItem('feature-flag-overrides', JSON.stringify({
        'ui-addition': true,
        'enhanced-icons': true,
        'simplified-theme-toggle': true
      }));
    });

    // Take baseline screenshots if they don't exist
    const baselineScreenshots = [
      { name: 'dashboard-light-theme', selector: '#dashboard' },
      { name: 'dashboard-dark-theme', selector: '#dashboard', theme: 'dark' },
      { name: 'maintenance-log', selector: '#maintenance-log' },
      { name: 'add-work-form', selector: '#add-work' },
      { name: 'settings-page', selector: '#settings' }
    ];

    for (const screenshot of baselineScreenshots) {
      const baselinePath = path.join(process.cwd(), 'test-results/visual-regression/baselines', `${screenshot.name}.png`);

      if (!fs.existsSync(baselinePath)) {
        console.log(`Creating baseline screenshot: ${screenshot.name}`);

        // Switch theme if needed
        if (screenshot.theme === 'dark') {
          await page.click('[data-tab="settings"]');
          await page.click('#themeToggle');
          await page.waitForTimeout(500);
        }

        // Navigate to appropriate tab
        const tabName = screenshot.selector.replace('#', '');
        await page.click(`[data-tab="${tabName}"]`);
        await page.waitForTimeout(300);

        // Take screenshot
        await page.locator(screenshot.selector).screenshot({
          path: baselinePath,
          animations: 'disabled'
        });

        // Reset to light theme
        if (screenshot.theme === 'dark') {
          await page.click('#themeToggle');
          await page.waitForTimeout(500);
        }
      }
    }

    console.log('✅ Visual regression baseline setup complete');

  } catch (error) {
    console.error('❌ Failed to set up visual regression baselines:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;