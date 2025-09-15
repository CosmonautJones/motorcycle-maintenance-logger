/**
 * IconManager - SVG Icon System with Accessibility Features
 *
 * Minimal implementation to make tests pass (red → green phase of TDD).
 * This class manages SVG icons with accessibility features and theme compatibility.
 */

class IconManager {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 50;
        this.iconBasePath = './assets/icons/';
        this.fallbackIcon = this.createFallbackIcon();
    }

    /**
     * Retrieve an icon by name with accessibility features
     * @param {string} iconName - Name of the icon to retrieve
     * @param {object} options - Configuration options
     * @returns {Promise<SVGElement>} - SVG element with accessibility attributes
     */
    async getIcon(iconName, options = {}) {
        // Validate icon name
        if (!iconName || typeof iconName !== 'string') {
            throw new Error('Icon name is required');
        }

        if (iconName.includes(' ') || !/^[a-z0-9\-_]+$/i.test(iconName)) {
            throw new Error('Invalid icon name format');
        }

        // Check cache first
        if (this.cache.has(iconName)) {
            return this.cloneIcon(this.cache.get(iconName), options);
        }

        try {
            // Fetch SVG content
            const response = await fetch(`${this.iconBasePath}${iconName}.svg`);

            if (!response.ok) {
                console.warn(`Icon '${iconName}' not found, using fallback`);
                return this.createFallbackIcon();
            }

            const svgContent = await response.text();
            const icon = this.parseSvgContent(svgContent, iconName, options);

            // Cache the icon
            this.cacheIcon(iconName, icon);

            return this.cloneIcon(icon, options);
        } catch (error) {
            throw new Error(`Failed to load icon '${iconName}': ${error.message}`);
        }
    }

    /**
     * Parse SVG content and add accessibility features
     * @param {string} svgContent - Raw SVG content
     * @param {string} iconName - Name of the icon
     * @param {object} options - Configuration options
     * @returns {SVGElement} - Processed SVG element
     */
    parseSvgContent(svgContent, iconName, options = {}) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, 'image/svg+xml');
            const svg = doc.querySelector('svg');

            if (!svg) {
                console.warn(`Failed to parse SVG for icon '${iconName}'`);
                return this.createFallbackIcon();
            }

            // Add accessibility attributes
            this.addAccessibilityAttributes(svg, iconName);

            // Apply theme and sizing
            this.applyIconOptions(svg, options);

            return svg;
        } catch (error) {
            console.warn(`Failed to parse SVG for icon '${iconName}':`, error);
            return this.createFallbackIcon();
        }
    }

    /**
     * Add accessibility attributes to SVG element
     * @param {SVGElement} svg - SVG element to enhance
     * @param {string} iconName - Name of the icon
     */
    addAccessibilityAttributes(svg, iconName) {
        // Set role for screen readers
        svg.setAttribute('role', 'img');

        // Add descriptive label if missing
        if (!svg.getAttribute('aria-label')) {
            const label = this.generateIconLabel(iconName);
            svg.setAttribute('aria-label', label);
        }

        // Make non-focusable
        svg.setAttribute('focusable', 'false');

        // Add CSS class for styling
        svg.classList.add('icon');
    }

    /**
     * Generate descriptive label for icon
     * @param {string} iconName - Name of the icon
     * @returns {string} - Human-readable label
     */
    generateIconLabel(iconName) {
        const formatted = iconName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
        return `${formatted} icon`;
    }

    /**
     * Apply theme and sizing options to icon
     * @param {SVGElement} svg - SVG element to modify
     * @param {object} options - Configuration options
     */
    applyIconOptions(svg, options = {}) {
        // Apply theme
        if (options.theme) {
            svg.classList.add(`icon-${options.theme}-theme`);
            this.applyThemeColors(svg, options.theme);
        }

        // Apply size constraints
        if (options.maxSize) {
            const size = Math.min(options.maxSize, 1000); // Safety limit
            svg.setAttribute('width', size.toString());
            svg.setAttribute('height', size.toString());
            svg.style.maxWidth = `${size}px`;
            svg.style.maxHeight = `${size}px`;
        }
    }

    /**
     * Apply theme-specific colors to icon
     * @param {SVGElement} svg - SVG element to style
     * @param {string} theme - Theme name (light/dark)
     */
    applyThemeColors(svg, theme) {
        const colorMap = {
            light: '#333333',
            dark: '#ffffff'
        };

        svg.style.setProperty('--icon-color', colorMap[theme] || colorMap.light);
    }

    /**
     * Create a fallback icon when the requested icon fails
     * @returns {SVGElement} - Fallback SVG element
     */
    createFallbackIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Icon not available');
        svg.setAttribute('focusable', 'false');
        svg.classList.add('icon', 'icon-fallback');

        // Simple fallback shape
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '4');
        rect.setAttribute('y', '4');
        rect.setAttribute('width', '16');
        rect.setAttribute('height', '16');
        rect.setAttribute('rx', '2');
        rect.setAttribute('fill', 'currentColor');
        rect.setAttribute('opacity', '0.5');

        svg.appendChild(rect);
        return svg;
    }

    /**
     * Clone an icon for reuse
     * @param {SVGElement} icon - Original icon element
     * @param {object} options - Configuration options
     * @returns {SVGElement} - Cloned icon
     */
    cloneIcon(icon, options = {}) {
        const clone = icon.cloneNode(true);
        this.applyIconOptions(clone, options);
        return clone;
    }

    /**
     * Cache an icon with size limit management
     * @param {string} iconName - Name of the icon
     * @param {SVGElement} icon - Icon element to cache
     */
    cacheIcon(iconName, icon) {
        // Manage cache size
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(iconName, icon);
    }

    /**
     * Preload commonly used icons
     * @param {string[]} iconNames - Array of icon names to preload
     * @returns {Promise<void>}
     */
    async preloadIcons(iconNames) {
        const promises = iconNames.map(name =>
            this.getIcon(name).catch(error => {
                console.warn(`Failed to preload icon '${name}':`, error);
                return null;
            })
        );

        await Promise.all(promises);
    }

    /**
     * Handle theme changes by updating cached icons
     * @param {string} newTheme - New theme name
     */
    onThemeChange(newTheme) {
        // Update all cached icons with new theme
        for (const [iconName, icon] of this.cache.entries()) {
            this.applyThemeColors(icon, newTheme);
            icon.classList.remove('icon-light-theme', 'icon-dark-theme');
            icon.classList.add(`icon-${newTheme}-theme`);
        }
    }

    /**
     * Detect current theme from ThemeManager
     * @returns {string} - Current theme name
     */
    detectCurrentTheme() {
        if (window.ThemeManager && window.ThemeManager.currentTheme) {
            return window.ThemeManager.currentTheme;
        }
        return 'light'; // Default fallback
    }

    /**
     * Clear the icon cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache information
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export for use in tests and other modules
module.exports = IconManager;