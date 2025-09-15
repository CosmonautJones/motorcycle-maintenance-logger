/**
 * End-to-End Tests for UI Addition Feature
 *
 * Tests the enhanced icons and simplified theme controls feature
 * across multiple browsers and devices, including accessibility validation.
 */

const { test, expect } = require('@playwright/test');

test.describe('UI Addition Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Enable feature flag for testing
        await page.addInitScript(() => {
            localStorage.setItem('feature-flag-overrides', JSON.stringify({
                'ui-addition': true,
                'enhanced-icons': true,
                'simplified-theme-toggle': true
            }));
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Enhanced Icon System', () => {
        test('displays navigation icons in tab buttons', async ({ page }) => {
            // Test dashboard icon
            const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
            const dashboardIcon = dashboardTab.locator('svg, .icon');
            await expect(dashboardIcon).toBeVisible();

            // Test maintenance log icon
            const logTab = page.getByRole('tab', { name: /maintenance log/i });
            const logIcon = logTab.locator('svg, .icon');
            await expect(logIcon).toBeVisible();

            // Test add work icon
            const addTab = page.getByRole('tab', { name: /add work/i });
            const addIcon = addTab.locator('svg, .icon');
            await expect(addIcon).toBeVisible();

            // Test settings icon
            const settingsTab = page.getByRole('tab', { name: /settings/i });
            const settingsIcon = settingsTab.locator('svg, .icon');
            await expect(settingsIcon).toBeVisible();
        });

        test('shows status icons for maintenance items', async ({ page }) => {
            // Set current mileage to trigger status calculations
            await page.fill('#currentMileage', '50000');
            await page.click('#updateMileageBtn');

            // Navigate to dashboard
            await page.click('[data-tab="dashboard"]');

            // Check for status icons in maintenance items
            const maintenanceItems = page.locator('.maintenance-item');
            const firstItem = maintenanceItems.first();

            // Verify status icon exists
            const statusIcon = firstItem.locator('.status-icon, svg[class*="status"]');
            await expect(statusIcon).toBeVisible();

            // Take screenshot for visual verification
            await page.screenshot({
                path: '.claude/artifacts/session-ui-addition/dashboard-with-icons.png',
                fullPage: true
            });
        });

        test('displays action icons in maintenance history', async ({ page }) => {
            // Add some work history first
            await page.click('[data-tab="add-work"]');
            await page.fill('#workDate', '2024-01-15');
            await page.fill('#workMileage', '45000');
            await page.selectOption('#workType', 'Oil Change');
            await page.fill('#workDescription', 'Changed oil and filter');
            await page.click('#workForm button[type="submit"]');

            // Navigate to maintenance log
            await page.click('[data-tab="maintenance-log"]');

            // Check for action icons (edit, delete)
            const workEntry = page.locator('.work-entry').first();
            const editIcon = workEntry.locator('[data-action="edit-work"] svg, .edit-icon');
            const deleteIcon = workEntry.locator('[data-action="delete-work-entry"] svg, .delete-icon');

            await expect(editIcon).toBeVisible();
            await expect(deleteIcon).toBeVisible();
        });

        test('maintains icon accessibility attributes', async ({ page }) => {
            const icons = page.locator('svg[role="img"], .icon[role="img"]');
            const iconCount = await icons.count();

            // Verify each icon has proper accessibility attributes
            for (let i = 0; i < iconCount; i++) {
                const icon = icons.nth(i);

                // Check for aria-label or title
                const hasAriaLabel = await icon.getAttribute('aria-label');
                const hasTitle = await icon.locator('title').count();

                expect(hasAriaLabel || hasTitle > 0).toBeTruthy();
            }
        });

        test('icons are visible in both light and dark themes', async ({ page }) => {
            // Test in light theme
            await page.screenshot({
                path: '.claude/artifacts/session-ui-addition/icons-light-theme.png'
            });

            // Switch to dark theme
            await page.click('[data-tab="settings"]');
            await page.click('#themeToggle');

            // Wait for theme transition
            await page.waitForTimeout(500);

            // Verify icons are still visible in dark theme
            const dashboardIcon = page.getByRole('tab', { name: /dashboard/i }).locator('svg, .icon');
            await expect(dashboardIcon).toBeVisible();

            await page.screenshot({
                path: '.claude/artifacts/session-ui-addition/icons-dark-theme.png'
            });
        });
    });

    test.describe('Simplified Theme Controls', () => {
        test('displays single theme toggle button', async ({ page }) => {
            await page.click('[data-tab="settings"]');

            // Verify single theme toggle exists
            const themeToggle = page.locator('#themeToggle');
            await expect(themeToggle).toBeVisible();

            // Verify old dropdown is removed
            const themeDropdown = page.locator('#themePreference');
            await expect(themeDropdown).not.toBeVisible();
        });

        test('theme toggle switches between light and dark modes', async ({ page }) => {
            await page.click('[data-tab="settings"]');

            // Start in light mode
            await expect(page.locator('body')).toHaveClass(/theme-light/);

            // Click toggle to switch to dark
            await page.click('#themeToggle');
            await page.waitForTimeout(300); // Wait for transition

            // Verify dark mode is active
            await expect(page.locator('body')).toHaveClass(/theme-dark/);

            // Click again to switch back to light
            await page.click('#themeToggle');
            await page.waitForTimeout(300);

            // Verify light mode is active
            await expect(page.locator('body')).toHaveClass(/theme-light/);
        });

        test('theme toggle has proper accessibility attributes', async ({ page }) => {
            await page.click('[data-tab="settings"]');

            const themeToggle = page.locator('#themeToggle');

            // Check ARIA attributes
            await expect(themeToggle).toHaveAttribute('role', 'switch');
            await expect(themeToggle).toHaveAttribute('aria-checked');
            await expect(themeToggle).toHaveAttribute('aria-label');

            // Verify keyboard navigation
            await themeToggle.focus();
            await expect(themeToggle).toBeFocused();

            // Test keyboard activation
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);

            // Verify theme changed via keyboard
            const ariaChecked = await themeToggle.getAttribute('aria-checked');
            expect(ariaChecked).toBe('true');
        });

        test('theme preference persists across page reloads', async ({ page }) => {
            await page.click('[data-tab="settings"]');

            // Switch to dark theme
            await page.click('#themeToggle');
            await page.waitForTimeout(300);

            // Reload page
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Verify dark theme persisted
            await expect(page.locator('body')).toHaveClass(/theme-dark/);
        });

        test('theme toggle updates visual label correctly', async ({ page }) => {
            await page.click('[data-tab="settings"]');

            const themeToggle = page.locator('#themeToggle');
            const themeLabel = themeToggle.locator('.theme-label');

            // Check initial light mode label
            await expect(themeLabel).toContainText(/light mode/i);

            // Switch to dark mode
            await page.click('#themeToggle');
            await page.waitForTimeout(300);

            // Check dark mode label
            await expect(themeLabel).toContainText(/dark mode/i);
        });
    });

    test.describe('Feature Flag Integration', () => {
        test('falls back gracefully when feature flag is disabled', async ({ page }) => {
            // Disable feature flag
            await page.addInitScript(() => {
                localStorage.setItem('feature-flag-overrides', JSON.stringify({
                    'ui-addition': false
                }));
            });

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Verify original UI is shown (no enhanced icons)
            const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
            const hasIcon = await dashboardTab.locator('svg, .icon').count();

            expect(hasIcon).toBe(0); // No icons when feature disabled

            // Verify original theme controls are shown
            await page.click('[data-tab="settings"]');
            const themeDropdown = page.locator('#themePreference');
            await expect(themeDropdown).toBeVisible();
        });

        test('enables partial features based on child flags', async ({ page }) => {
            // Enable parent but disable child features
            await page.addInitScript(() => {
                localStorage.setItem('feature-flag-overrides', JSON.stringify({
                    'ui-addition': true,
                    'enhanced-icons': false,
                    'simplified-theme-toggle': true
                }));
            });

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Icons should not be visible
            const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
            const hasIcon = await dashboardTab.locator('svg, .icon').count();
            expect(hasIcon).toBe(0);

            // But simplified theme toggle should be available
            await page.click('[data-tab="settings"]');
            const themeToggle = page.locator('#themeToggle');
            await expect(themeToggle).toBeVisible();
        });
    });

    test.describe('Performance and Accessibility', () => {
        test('maintains page load performance with icons', async ({ page }) => {
            const startTime = Date.now();

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            const loadTime = Date.now() - startTime;

            // Verify load time is reasonable (under 3 seconds)
            expect(loadTime).toBeLessThan(3000);

            // Check Core Web Vitals
            const metrics = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const vitals = {};

                        entries.forEach((entry) => {
                            if (entry.name === 'first-contentful-paint') {
                                vitals.fcp = entry.value;
                            }
                        });

                        resolve(vitals);
                    }).observe({ entryTypes: ['paint'] });
                });
            });

            // FCP should be under 1.8 seconds for good performance
            if (metrics.fcp) {
                expect(metrics.fcp).toBeLessThan(1800);
            }
        });

        test('passes accessibility audit with axe-core', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Inject axe-core for accessibility testing
            await page.addScriptTag({
                url: 'https://unpkg.com/axe-core@4.7.0/axe.min.js'
            });

            // Run accessibility scan
            const accessibilityResults = await page.evaluate(() => {
                return axe.run();
            });

            // Check for violations
            expect(accessibilityResults.violations).toHaveLength(0);

            // Verify specific accessibility features
            const iconElements = page.locator('svg[role="img"]');
            const iconCount = await iconElements.count();

            for (let i = 0; i < iconCount; i++) {
                const icon = iconElements.nth(i);
                const hasAriaLabel = await icon.getAttribute('aria-label');
                expect(hasAriaLabel).toBeTruthy();
            }
        });

        test('supports keyboard navigation for all interactive elements', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test tab navigation through all interactive elements
            let tabCount = 0;
            const maxTabs = 20; // Prevent infinite loop

            while (tabCount < maxTabs) {
                await page.keyboard.press('Tab');
                tabCount++;

                const focused = await page.evaluate(() => {
                    return {
                        tagName: document.activeElement.tagName,
                        className: document.activeElement.className,
                        id: document.activeElement.id
                    };
                });

                // Verify focused element is interactive
                const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'A'];
                if (interactiveTags.includes(focused.tagName)) {
                    // Verify element is visible and not disabled
                    const focusedElement = page.locator(':focus');
                    await expect(focusedElement).toBeVisible();

                    const isDisabled = await focusedElement.getAttribute('disabled');
                    expect(isDisabled).toBeNull();
                }

                // Break when we loop back to body or a repeated element
                if (focused.tagName === 'BODY' && tabCount > 5) {
                    break;
                }
            }

            expect(tabCount).toBeGreaterThan(5); // Should have multiple interactive elements
        });
    });

    test.describe('Mobile and Responsive Design', () => {
        test('icons are touch-friendly on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test touch interaction with tab icons
            const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
            await dashboardTab.tap();

            // Verify tab switched
            await expect(page.locator('#dashboard')).toHaveClass(/active/);

            // Test theme toggle on mobile
            await page.tap('[data-tab="settings"]');
            await page.tap('#themeToggle');
            await page.waitForTimeout(300);

            // Verify theme switched
            await expect(page.locator('body')).toHaveClass(/theme-dark/);

            await page.screenshot({
                path: '.claude/artifacts/session-ui-addition/mobile-dark-theme.png'
            });
        });

        test('maintains icon visibility across different screen sizes', async ({ page }) => {
            const viewports = [
                { width: 320, height: 568, name: 'mobile-small' },
                { width: 375, height: 667, name: 'mobile-medium' },
                { width: 768, height: 1024, name: 'tablet' },
                { width: 1024, height: 768, name: 'desktop-small' },
                { width: 1440, height: 900, name: 'desktop-large' }
            ];

            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto('/');
                await page.waitForLoadState('networkidle');

                // Verify icons are visible at this viewport
                const dashboardIcon = page.getByRole('tab', { name: /dashboard/i }).locator('svg, .icon');
                await expect(dashboardIcon).toBeVisible();

                // Take screenshot for visual verification
                await page.screenshot({
                    path: `.claude/artifacts/session-ui-addition/icons-${viewport.name}.png`
                });
            }
        });
    });

    test.describe('Cross-Browser Compatibility', () => {
        ['chromium', 'firefox', 'webkit'].forEach(browserName => {
            test(`UI additions work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
                // Skip if not the target browser
                if (currentBrowser !== browserName) {
                    test.skip();
                }

                await page.goto('/');
                await page.waitForLoadState('networkidle');

                // Test basic icon functionality
                const dashboardIcon = page.getByRole('tab', { name: /dashboard/i }).locator('svg, .icon');
                await expect(dashboardIcon).toBeVisible();

                // Test theme toggle
                await page.click('[data-tab="settings"]');
                await page.click('#themeToggle');
                await page.waitForTimeout(300);

                await expect(page.locator('body')).toHaveClass(/theme-dark/);

                // Take browser-specific screenshot
                await page.screenshot({
                    path: `.claude/artifacts/session-ui-addition/ui-additions-${browserName}.png`
                });
            });
        });
    });
});

test.describe('UI Addition Error Scenarios', () => {
    test('handles missing icon gracefully', async ({ page }) => {
        await page.addInitScript(() => {
            // Mock IconManager to simulate missing icon
            window.mockIconError = true;
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Even with icon errors, interface should still be functional
        const dashboardTab = page.getByRole('tab', { name: /dashboard/i });
        await expect(dashboardTab).toBeVisible();
        await dashboardTab.click();

        // Verify tab switching still works
        await expect(page.locator('#dashboard')).toHaveClass(/active/);
    });

    test('recovers from theme toggle errors', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Inject script to cause theme error
        await page.addInitScript(() => {
            localStorage.removeItem('motorcycle-tracker-theme-preference');
        });

        await page.click('[data-tab="settings"]');

        // Theme toggle should still be functional despite localStorage issues
        const themeToggle = page.locator('#themeToggle');
        await expect(themeToggle).toBeVisible();

        await themeToggle.click();
        await page.waitForTimeout(300);

        // Should have some theme applied
        const bodyClass = await page.locator('body').getAttribute('class');
        expect(bodyClass).toContain('theme-');
    });
});