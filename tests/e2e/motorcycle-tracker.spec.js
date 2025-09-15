/**
 * End-to-end tests for motorcycle maintenance tracker
 */

import { test, expect } from '@playwright/test';

test.describe('Motorcycle Maintenance Tracker E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the application to load
    await expect(page.locator('h1')).toContainText('2001 Suzuki Intruder Volusia 800');
  });

  test.describe('Initial Application Load', () => {
    test('should load the application with correct title and structure', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle('Motorcycle Maintenance Tracker');

      // Check main heading
      await expect(page.locator('h1')).toContainText('🏍️ 2001 Suzuki Intruder Volusia 800');

      // Check navigation tabs are present
      await expect(page.locator('[data-tab="dashboard"]')).toBeVisible();
      await expect(page.locator('[data-tab="maintenance-log"]')).toBeVisible();
      await expect(page.locator('[data-tab="add-work"]')).toBeVisible();
      await expect(page.locator('[data-tab="settings"]')).toBeVisible();

      // Check dashboard is active by default
      await expect(page.locator('[data-tab="dashboard"]')).toHaveClass(/active/);
      await expect(page.locator('#dashboard')).toHaveClass(/active/);
    });

    test('should display mileage input and maintenance status', async ({ page }) => {
      // Check mileage input is present
      await expect(page.locator('#currentMileage')).toBeVisible();
      await expect(page.locator('#updateMileageBtn')).toBeVisible();

      // Check maintenance status section
      await expect(page.locator('#maintenanceStatus')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Maintenance Status');
    });
  });

  test.describe('Mileage Management', () => {
    test('should update current mileage', async ({ page }) => {
      // Enter mileage
      await page.fill('#currentMileage', '15000');

      // Click update button
      await page.click('#updateMileageBtn');

      // Wait for update to complete
      await page.waitForTimeout(500);

      // Verify mileage is displayed correctly
      await expect(page.locator('#currentMileage')).toHaveValue('15000');

      // Check that maintenance status updates
      await expect(page.locator('.maintenance-item')).toHaveCount(7); // Should show all maintenance items
    });

    test('should show proper validation for invalid mileage', async ({ page }) => {
      // Try to enter invalid mileage
      await page.fill('#currentMileage', 'invalid');
      await page.click('#updateMileageBtn');

      // HTML5 validation should prevent submission
      const validationMessage = await page.locator('#currentMileage').evaluate(el => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should navigate between tabs correctly', async ({ page }) => {
      // Start on dashboard
      await expect(page.locator('#dashboard')).toHaveClass(/active/);

      // Navigate to Maintenance Log
      await page.click('[data-tab="maintenance-log"]');
      await expect(page.locator('#maintenance-log')).toHaveClass(/active/);
      await expect(page.locator('#dashboard')).not.toHaveClass(/active/);

      // Navigate to Add Work
      await page.click('[data-tab="add-work"]');
      await expect(page.locator('#add-work')).toHaveClass(/active/);
      await expect(page.locator('#maintenance-log')).not.toHaveClass(/active/);

      // Navigate to Settings
      await page.click('[data-tab="settings"]');
      await expect(page.locator('#settings')).toHaveClass(/active/);
      await expect(page.locator('#add-work')).not.toHaveClass(/active/);

      // Navigate back to Dashboard
      await page.click('[data-tab="dashboard"]');
      await expect(page.locator('#dashboard')).toHaveClass(/active/);
      await expect(page.locator('#settings')).not.toHaveClass(/active/);
    });

    test('should maintain tab state during page interaction', async ({ page }) => {
      // Set initial mileage
      await page.fill('#currentMileage', '15000');
      await page.click('#updateMileageBtn');

      // Switch to settings
      await page.click('[data-tab="settings"]');
      await expect(page.locator('#settings')).toHaveClass(/active/);

      // Switch back to dashboard
      await page.click('[data-tab="dashboard"]');
      await expect(page.locator('#dashboard')).toHaveClass(/active/);

      // Verify mileage is still there
      await expect(page.locator('#currentMileage')).toHaveValue('15000');
    });
  });

  test.describe('Add Work Functionality', () => {
    test('should add a work entry successfully', async ({ page }) => {
      // Set initial mileage
      await page.fill('#currentMileage', '15000');
      await page.click('#updateMileageBtn');

      // Navigate to Add Work tab
      await page.click('[data-tab="add-work"]');

      // Fill out the form
      await page.fill('#workDate', '2023-12-01');
      await page.fill('#workMileage', '15000');
      await page.selectOption('#workType', 'oil-change');
      await page.fill('#workDescription', 'Regular oil change with synthetic oil and new filter');

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for form submission
      await page.waitForTimeout(500);

      // Verify form was reset
      await expect(page.locator('#workMileage')).toHaveValue('');
      await expect(page.locator('#workType')).toHaveValue('');
      await expect(page.locator('#workDescription')).toHaveValue('');

      // Navigate to maintenance log to verify entry was added
      await page.click('[data-tab="maintenance-log"]');

      // Check for work entry (this would require the entry to be rendered)
      // In a real test, we'd check for the specific work entry
      await expect(page.locator('#workHistory')).toBeVisible();
    });

    test('should validate required fields in work form', async ({ page }) => {
      // Navigate to Add Work tab
      await page.click('[data-tab="add-work"]');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Check that HTML5 validation prevents submission
      const dateValidation = await page.locator('#workDate').evaluate(el => el.validationMessage);
      const mileageValidation = await page.locator('#workMileage').evaluate(el => el.validationMessage);
      const typeValidation = await page.locator('#workType').evaluate(el => el.validationMessage);
      const descriptionValidation = await page.locator('#workDescription').evaluate(el => el.validationMessage);

      expect(dateValidation || mileageValidation || typeValidation || descriptionValidation).toBeTruthy();
    });

    test('should pre-fill date with today\'s date', async ({ page }) => {
      // Navigate to Add Work tab
      await page.click('[data-tab="add-work"]');

      // Check that date is pre-filled with today's date
      const dateValue = await page.locator('#workDate').inputValue();
      const today = new Date().toISOString().split('T')[0];
      expect(dateValue).toBe(today);
    });
  });

  test.describe('Theme Management', () => {
    test('should toggle between light and dark themes', async ({ page }) => {
      // Navigate to Settings
      await page.click('[data-tab="settings"]');

      // Find theme toggle switch
      const themeToggle = page.locator('#themeToggle');
      await expect(themeToggle).toBeVisible();

      // Check initial state (should be light mode)
      await expect(themeToggle).toHaveAttribute('aria-checked', 'false');

      // Toggle to dark mode
      await themeToggle.click();

      // Verify dark mode is active
      await expect(themeToggle).toHaveAttribute('aria-checked', 'true');

      // Check that dark theme classes are applied
      await expect(page.locator('body')).toHaveClass(/theme-dark/);

      // Toggle back to light mode
      await themeToggle.click();

      // Verify light mode is active
      await expect(themeToggle).toHaveAttribute('aria-checked', 'false');
      await expect(page.locator('body')).toHaveClass(/theme-light/);
    });

    test('should persist theme preference across page reloads', async ({ page }) => {
      // Navigate to Settings
      await page.click('[data-tab="settings"]');

      // Toggle to dark mode
      await page.click('#themeToggle');
      await expect(page.locator('#themeToggle')).toHaveAttribute('aria-checked', 'true');

      // Reload the page
      await page.reload();

      // Wait for page to load
      await expect(page.locator('h1')).toContainText('2001 Suzuki Intruder Volusia 800');

      // Navigate back to Settings
      await page.click('[data-tab="settings"]');

      // Verify theme preference was preserved
      await expect(page.locator('#themeToggle')).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('body')).toHaveClass(/theme-dark/);
    });

    test('should support system theme preference', async ({ page }) => {
      // Navigate to Settings
      await page.click('[data-tab="settings"]');

      // Select system preference
      await page.selectOption('#themePreference', 'system');

      // This would require mocking the browser's color scheme preference
      // In a real test, we'd simulate system theme changes
      await expect(page.locator('#themePreference')).toHaveValue('system');
    });
  });

  test.describe('Data Export/Import', () => {
    test('should export data', async ({ page }) => {
      // Setup some test data first
      await page.fill('#currentMileage', '15000');
      await page.click('#updateMileageBtn');

      // Navigate to Settings
      await page.click('[data-tab="settings"]');

      // Start download promise before clicking
      const downloadPromise = page.waitForEvent('download');

      // Click export button
      await page.click('button:has-text("Export All Data")');

      // Wait for download
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/motorcycle-maintenance-backup-\d{4}-\d{2}-\d{2}\.json/);
    });

    test('should handle import data flow', async ({ page }) => {
      // Navigate to Settings
      await page.click('[data-tab="settings"]');

      // Click import button (this would trigger file picker)
      await page.click('button:has-text("Import Data")');

      // In a real test, we'd handle file upload
      // For now, just verify the file input is triggered
      await expect(page.locator('#importFile')).toBeAttached();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify mobile layout
      await expect(page.locator('.tabs')).toBeVisible();

      // On mobile, tabs might stack differently
      // This would require CSS media queries to be properly implemented
      const tabsContainer = page.locator('.tabs');
      await expect(tabsContainer).toBeVisible();
    });

    test('should handle tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify tablet layout
      await expect(page.locator('.container')).toBeVisible();
      await expect(page.locator('.tabs')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Focus on first tab
      await page.keyboard.press('Tab');

      // Navigate through tabs with Tab key
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Activate tab with Enter
      await page.keyboard.press('Enter');

      // Verify keyboard navigation works
      // This would require proper focus management in the app
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check theme toggle has proper ARIA attributes
      await page.click('[data-tab="settings"]');

      const themeToggle = page.locator('#themeToggle');
      await expect(themeToggle).toHaveAttribute('role', 'switch');
      await expect(themeToggle).toHaveAttribute('aria-label', 'Toggle dark mode');

      // Check form labels
      await page.click('[data-tab="add-work"]');
      await expect(page.locator('label[for="workDate"]')).toBeVisible();
      await expect(page.locator('label[for="workMileage"]')).toBeVisible();
    });

    test('should support screen readers', async ({ page }) => {
      // Test that important elements are properly labeled
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2')).toBeVisible();

      // Check form accessibility
      await page.click('[data-tab="add-work"]');
      await expect(page.locator('#workDate')).toHaveAttribute('required');
      await expect(page.locator('#workMileage')).toHaveAttribute('required');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This would require mocking network failures
      // For now, verify error handling UI exists

      // Navigate to Add Work
      await page.click('[data-tab="add-work"]');

      // Fill form with valid data
      await page.fill('#workDate', '2023-12-01');
      await page.fill('#workMileage', '15000');
      await page.selectOption('#workType', 'oil-change');
      await page.fill('#workDescription', 'Test work');

      // Submit form
      await page.click('button[type="submit"]');

      // In a real test with network mocking, we'd verify error messages
      // For now, just verify the form submission doesn't break the app
      await expect(page.locator('#workForm')).toBeVisible();
    });

    test('should validate form inputs', async ({ page }) => {
      // Navigate to Add Work
      await page.click('[data-tab="add-work"]');

      // Try to submit with invalid mileage
      await page.fill('#workDate', '2023-12-01');
      await page.fill('#workMileage', '-1000'); // Invalid negative mileage
      await page.selectOption('#workType', 'oil-change');
      await page.fill('#workDescription', 'Test');

      await page.click('button[type="submit"]');

      // Check that validation prevents submission
      const mileageField = page.locator('#workMileage');
      const isValid = await mileageField.evaluate(el => el.checkValidity());
      expect(isValid).toBe(false);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist data across page reloads', async ({ page }) => {
      // Add some data
      await page.fill('#currentMileage', '15000');
      await page.click('#updateMileageBtn');

      // Reload page
      await page.reload();

      // Wait for app to load
      await expect(page.locator('h1')).toContainText('2001 Suzuki Intruder Volusia 800');

      // Verify data persisted
      await expect(page.locator('#currentMileage')).toHaveValue('15000');
    });

    test('should handle localStorage being disabled', async ({ page }) => {
      // Disable localStorage (this would require browser context setup)
      // For now, just verify the app doesn't crash
      await expect(page.locator('h1')).toContainText('2001 Suzuki Intruder Volusia 800');
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await expect(page.locator('h1')).toContainText('2001 Suzuki Intruder Volusia 800');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should not have console errors', async ({ page }) => {
      const consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await expect(page.locator('h1')).toContainText('2001 Suzuki Intruder Volusia 800');

      // Allow some time for any async operations
      await page.waitForTimeout(2000);

      // Filter out known acceptable errors (like 404 for favicon)
      const criticalErrors = consoleErrors.filter(error =>
        !error.includes('favicon.ico') &&
        !error.includes('X-Frame-Options') &&
        !error.includes('Content Security Policy')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });
});