/**
 * SimplifiedThemeManager - Enhanced Theme Controls (Light/Dark Only)
 *
 * Minimal implementation to make tests pass (red → green phase of TDD).
 * This class provides simplified theme switching with only light and dark modes.
 */

class SimplifiedThemeManager {
    constructor() {
        this.validThemes = ['light', 'dark'];
        this.currentTheme = this.loadThemePreference();
        this.hasSystemDetection = false; // Explicitly removed
        this.debounceTimeout = null;
        this.transitionDuration = 300;

        this.initialize();
    }

    /**
     * Initialize the theme manager
     */
    initialize() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.updateToggleButton();
    }

    /**
     * Load theme preference from localStorage
     * @returns {string} - Saved theme or default
     */
    loadThemePreference() {
        try {
            const saved = localStorage.getItem('motorcycle-tracker-theme');
            if (saved && this.validThemes.includes(saved)) {
                return saved;
            }
        } catch (error) {
            console.warn('Failed to load theme preference:', error);
        }
        return 'light'; // Default to light theme
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - Theme to save
     */
    saveThemePreference(theme) {
        try {
            localStorage.setItem('motorcycle-tracker-theme', theme);
        } catch (error) {
            console.warn('Failed to save theme preference:', error);
        }
    }

    /**
     * Set the theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        // Validate theme
        if (!theme || !this.validThemes.includes(theme)) {
            if (theme === 'system') {
                throw new Error('System theme detection has been removed. Use "light" or "dark" only.');
            }
            throw new Error(`Invalid theme '${theme}'. Use 'light' or 'dark'.`);
        }

        const oldTheme = this.currentTheme;
        this.currentTheme = theme;

        this.applyTheme(theme);
        this.saveThemePreference(theme);
        this.updateToggleButton();
        this.announceThemeChange(oldTheme, theme);
        this.dispatchThemeChangeEvent(oldTheme, theme);
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        // Debounce rapid toggles
        if (this.debounceTimeout) {
            return;
        }

        this.debounceTimeout = setTimeout(() => {
            this.debounceTimeout = null;
        }, 100);

        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Apply theme to the document
     * @param {string} theme - Theme to apply
     */
    applyTheme(theme) {
        // Add transition class
        document.body.classList.add('theme-transitioning');

        // Set data attribute for CSS
        document.documentElement.setAttribute('data-theme', theme);

        // Apply CSS custom properties
        this.applyCSSProperties(theme);

        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, this.transitionDuration);
    }

    /**
     * Apply CSS custom properties for the theme
     * @param {string} theme - Theme to apply
     */
    applyCSSProperties(theme) {
        const properties = this.getThemeProperties(theme);

        for (const [property, value] of Object.entries(properties)) {
            document.documentElement.style.setProperty(property, value);
        }
    }

    /**
     * Get CSS custom properties for a theme
     * @param {string} theme - Theme name
     * @returns {object} - CSS properties
     */
    getThemeProperties(theme) {
        const properties = {
            light: {
                '--bg-primary': '#f5f5f5',
                '--bg-surface': '#ffffff',
                '--text-primary': '#333333',
                '--text-secondary': '#666666',
                '--border-primary': '#dddddd'
            },
            dark: {
                '--bg-primary': '#1a1a1a',
                '--bg-surface': '#2a2a2a',
                '--text-primary': '#ffffff',
                '--text-secondary': '#b0b0b0',
                '--border-primary': '#404040'
            }
        };

        return properties[theme] || properties.light;
    }

    /**
     * Update the toggle button appearance
     */
    updateToggleButton() {
        const toggleButton = document.getElementById('theme-toggle');
        if (!toggleButton) {
            console.warn('Theme toggle button not found in DOM');
            return;
        }

        const isDark = this.currentTheme === 'dark';
        const themeIcon = toggleButton.querySelector('.theme-icon');
        const themeText = toggleButton.querySelector('.theme-text');

        // Update button content
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }

        if (themeText) {
            themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }

        // Update ARIA attributes
        toggleButton.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        toggleButton.setAttribute('aria-label',
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );

        // Update role if not set
        if (!toggleButton.getAttribute('role')) {
            toggleButton.setAttribute('role', 'switch');
        }

        if (!toggleButton.getAttribute('aria-checked')) {
            toggleButton.setAttribute('aria-checked', isDark ? 'true' : 'false');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle toggle button click
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.toggle();
            });

            // Handle keyboard activation
            toggleButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.toggle();
                }
            });
        }

        // Handle escape key for expanded controls
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeExpandedControls();
            }
        });
    }

    /**
     * Close any expanded theme controls
     */
    closeExpandedControls() {
        const expandedButton = document.querySelector('[aria-expanded="true"]');
        if (expandedButton) {
            expandedButton.setAttribute('aria-expanded', 'false');
            const dropdown = document.getElementById(expandedButton.getAttribute('aria-controls'));
            if (dropdown) {
                dropdown.setAttribute('hidden', '');
            }
        }
    }

    /**
     * Announce theme change to screen readers
     * @param {string} oldTheme - Previous theme
     * @param {string} newTheme - New theme
     */
    announceThemeChange(oldTheme, newTheme) {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            announcements.textContent = `Theme changed to ${newTheme} mode`;
        }
    }

    /**
     * Dispatch theme change event for other components
     * @param {string} oldTheme - Previous theme
     * @param {string} newTheme - New theme
     */
    dispatchThemeChangeEvent(oldTheme, newTheme) {
        const event = new CustomEvent('themechange', {
            detail: {
                oldTheme,
                newTheme,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Get the current theme
     * @returns {string} - Current theme name
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Check if a theme is valid
     * @param {string} theme - Theme to validate
     * @returns {boolean} - Whether theme is valid
     */
    isValidTheme(theme) {
        return this.validThemes.includes(theme);
    }

    /**
     * Get available themes
     * @returns {string[]} - Array of available theme names
     */
    getAvailableThemes() {
        return [...this.validThemes];
    }

    /**
     * Handle system theme changes (no-op in simplified version)
     * @deprecated System theme detection has been removed
     */
    handleSystemThemeChange() {
        console.warn('System theme detection has been removed from SimplifiedThemeManager');
    }

    /**
     * Check if system detection is available (always false)
     * @returns {boolean} - Always false
     */
    hasSystemThemeDetection() {
        return false;
    }

    /**
     * Destroy the theme manager and clean up
     */
    destroy() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Remove event listeners
        const toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.removeEventListener('click', this.toggle);
            toggleButton.removeEventListener('keydown', this.toggle);
        }

        document.removeEventListener('keydown', this.closeExpandedControls);
    }
}

// Export for use in tests and other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimplifiedThemeManager;
} else {
    window.SimplifiedThemeManager = SimplifiedThemeManager;
}