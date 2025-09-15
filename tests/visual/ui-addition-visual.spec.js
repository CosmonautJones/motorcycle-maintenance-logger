/**
 * Visual regression tests for UI Addition feature
 * Compares screenshots to detect unintended visual changes
 */

const { test, expect } = require('@playwright/test');

test.describe('UI Addition Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Enable UI addition features
    await page.addInitScript(() => {
      localStorage.setItem('feature-flag-overrides', JSON.stringify({
        'ui-addition': true,
        'enhanced-icons': true,
        'simplified-theme-toggle': true
      }));
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for any animations to complete
    await page.waitForTimeout(500);
  });

  test.describe('Navigation Icons', () => {
    test('dashboard tab with icon - light theme', async ({ page }) => {
      const dashboardTab = page.getByRole('tab', { name: /dashboard/i });

      await expect(dashboardTab).toHaveScreenshot('dashboard-tab-icon-light.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('all navigation tabs with icons', async ({ page }) => {
      const navigationTabs = page.locator('.tab-navigation');

      await expect(navigationTabs).toHaveScreenshot('navigation-tabs-with-icons.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('navigation icons in dark theme', async ({ page }) => {
      // Switch to dark theme
      await page.click('[data-tab="settings"]');
      await page.click('#themeToggle');
      await page.waitForTimeout(500);

      const navigationTabs = page.locator('.tab-navigation');

      await expect(navigationTabs).toHaveScreenshot('navigation-tabs-dark-theme.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });
  });

  test.describe('Dashboard with Status Icons', () => {
    test('maintenance dashboard with status icons', async ({ page }) => {
      // Set mileage to trigger status calculations
      await page.fill('#currentMileage', '50000');
      await page.click('#updateMileageBtn');
      await page.waitForTimeout(300);

      // Navigate to dashboard
      await page.click('[data-tab="dashboard"]');
      await page.waitForTimeout(300);

      const dashboard = page.locator('#dashboard');

      await expect(dashboard).toHaveScreenshot('dashboard-with-status-icons.png', {
        animations: 'disabled',
        threshold: 0.2,
        // Mask dynamic content that might change
        mask: [page.locator('[data-testid="current-date"]')]
      });
    });

    test('individual maintenance item with status icon', async ({ page }) => {
      await page.fill('#currentMileage', '50000');
      await page.click('#updateMileageBtn');
      await page.click('[data-tab="dashboard"]');
      await page.waitForTimeout(300);

      const firstMaintenanceItem = page.locator('.maintenance-item').first();

      await expect(firstMaintenanceItem).toHaveScreenshot('maintenance-item-with-icon.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });
  });

  test.describe('Simplified Theme Toggle', () => {
    test('theme toggle button in light mode', async ({ page }) => {
      await page.click('[data-tab="settings"]');
      await page.waitForTimeout(300);

      const themeToggle = page.locator('#themeToggle');

      await expect(themeToggle).toHaveScreenshot('theme-toggle-light-mode.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('theme toggle button in dark mode', async ({ page }) => {
      await page.click('[data-tab="settings"]');
      await page.click('#themeToggle');
      await page.waitForTimeout(500);

      const themeToggle = page.locator('#themeToggle');

      await expect(themeToggle).toHaveScreenshot('theme-toggle-dark-mode.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('settings page with simplified controls', async ({ page }) => {
      await page.click('[data-tab="settings"]');
      await page.waitForTimeout(300);

      const settingsContent = page.locator('#settings .content');

      await expect(settingsContent).toHaveScreenshot('settings-simplified-controls.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });
  });

  test.describe('Maintenance Log with Action Icons', () => {
    test('maintenance log with action icons', async ({ page }) => {
      // Add some maintenance work first
      await page.click('[data-tab="add-work"]');
      await page.fill('#workDate', '2024-01-15');
      await page.fill('#workMileage', '45000');
      await page.selectOption('#workType', 'Oil Change');
      await page.fill('#workDescription', 'Changed oil and filter');
      await page.click('#workForm button[type="submit"]');
      await page.waitForTimeout(300);

      // Navigate to maintenance log
      await page.click('[data-tab="maintenance-log"]');
      await page.waitForTimeout(300);

      const maintenanceLog = page.locator('#maintenance-log');

      await expect(maintenanceLog).toHaveScreenshot('maintenance-log-with-action-icons.png', {
        animations: 'disabled',
        threshold: 0.2,
        // Mask dynamic dates
        mask: [page.locator('.work-entry-date')]
      });
    });

    test('work entry with edit and delete icons', async ({ page }) => {
      // Add maintenance work
      await page.click('[data-tab="add-work"]');
      await page.fill('#workDate', '2024-01-15');
      await page.fill('#workMileage', '45000');
      await page.selectOption('#workType', 'Oil Change');
      await page.fill('#workDescription', 'Test oil change');
      await page.click('#workForm button[type="submit"]');

      // Navigate to log and check first entry
      await page.click('[data-tab="maintenance-log"]');
      await page.waitForTimeout(300);

      const firstWorkEntry = page.locator('.work-entry').first();

      await expect(firstWorkEntry).toHaveScreenshot('work-entry-with-icons.png', {
        animations: 'disabled',
        threshold: 0.2,
        mask: [page.locator('.work-entry-date')]
      });
    });
  });

  test.describe('Mobile Responsive Design', () => {
    test('mobile navigation with icons', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);

      const navigation = page.locator('.tab-navigation');

      await expect(navigation).toHaveScreenshot('mobile-navigation-with-icons.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('mobile theme toggle', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.click('[data-tab="settings"]');
      await page.waitForTimeout(300);

      const themeToggle = page.locator('#themeToggle');

      await expect(themeToggle).toHaveScreenshot('mobile-theme-toggle.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`icons render consistently in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        if (currentBrowser !== browserName) {
          test.skip();
        }

        const navigationTabs = page.locator('.tab-navigation');

        await expect(navigationTabs).toHaveScreenshot(`navigation-${browserName}.png`, {
          animations: 'disabled',
          threshold: 0.3 // Slightly higher threshold for cross-browser differences
        });
      });
    });
  });

  test.describe('Feature Flag States', () => {
    test('UI without enhanced icons (icons disabled)', async ({ page }) => {
      // Reload with icons disabled
      await page.addInitScript(() => {
        localStorage.setItem('feature-flag-overrides', JSON.stringify({
          'ui-addition': true,
          'enhanced-icons': false,
          'simplified-theme-toggle': true
        }));
      });

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const navigationTabs = page.locator('.tab-navigation');

      await expect(navigationTabs).toHaveScreenshot('navigation-no-icons.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('UI with original theme controls (simplified toggle disabled)', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('feature-flag-overrides', JSON.stringify({
          'ui-addition': true,
          'enhanced-icons': true,
          'simplified-theme-toggle': false
        }));
      });

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('[data-tab="settings"]');
      await page.waitForTimeout(300);

      const settingsContent = page.locator('#settings .content');

      await expect(settingsContent).toHaveScreenshot('settings-original-controls.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });
  });

  test.describe('Error States and Edge Cases', () => {
    test('graceful degradation when icons fail to load', async ({ page }) => {
      // Mock icon loading failure
      await page.route('**/*.svg', route => route.abort());

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const navigationTabs = page.locator('.tab-navigation');

      await expect(navigationTabs).toHaveScreenshot('navigation-icon-load-failure.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });

    test('theme toggle with localStorage errors', async ({ page }) => {
      // Simulate localStorage error
      await page.addInitScript(() => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
          if (key.includes('theme')) {
            throw new Error('localStorage error');
          }
          return originalSetItem.call(this, key, value);
        };
      });

      await page.click('[data-tab="settings"]');
      await page.waitForTimeout(300);

      const themeToggle = page.locator('#themeToggle');

      await expect(themeToggle).toHaveScreenshot('theme-toggle-error-state.png', {
        animations: 'disabled',
        threshold: 0.2
      });
    });
  });
});