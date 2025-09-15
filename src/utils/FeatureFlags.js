/**
 * Feature Flag Management System
 *
 * Provides centralized control over feature rollouts with support for
 * percentage-based gradual rollouts and environment-specific overrides.
 */

class FeatureFlags {
    constructor() {
        this.flags = {};
        this.userContext = this.getUserContext();
        this.environment = this.detectEnvironment();
        this.loadFlags();
    }

    /**
     * Load feature flags from configuration
     */
    async loadFlags() {
        try {
            // In a static app, we'll embed flags or load from localStorage for testing
            const response = await fetch('./config/flags.json');
            this.flags = await response.json();
        } catch (error) {
            console.warn('Failed to load feature flags, using defaults:', error);
            this.flags = this.getDefaultFlags();
        }
    }

    /**
     * Get default flags for fallback scenarios
     */
    getDefaultFlags() {
        return {
            'ui-addition': {
                enabled: false,
                environments: { development: true }
            }
        };
    }

    /**
     * Check if a feature flag is enabled for the current user/environment
     * @param {string} flagName - Name of the feature flag
     * @returns {boolean} - Whether the flag is enabled
     */
    isEnabled(flagName) {
        const flag = this.flags[flagName];
        if (!flag) {
            console.warn(`Feature flag '${flagName}' not found`);
            return false;
        }

        // Check environment-specific overrides first
        if (flag.environments && flag.environments[this.environment] !== undefined) {
            return flag.environments[this.environment];
        }

        // Check parent flag if this is a child flag
        if (flag.parent_flag && !this.isEnabled(flag.parent_flag)) {
            return false;
        }

        // Check percentage-based rollout
        if (flag.rollout_percentage !== undefined) {
            return this.isUserInRollout(flagName, flag.rollout_percentage);
        }

        // Default to flag's enabled status
        return flag.enabled || false;
    }

    /**
     * Determine if user is in percentage rollout based on consistent hashing
     * @param {string} flagName - Name of the feature flag
     * @param {number} percentage - Rollout percentage (0-100)
     * @returns {boolean} - Whether user is in rollout
     */
    isUserInRollout(flagName, percentage) {
        if (percentage >= 100) return true;
        if (percentage <= 0) return false;

        // Use user ID + flag name for consistent hash
        const hashInput = `${this.userContext.userId}_${flagName}`;
        const hash = this.simpleHash(hashInput);
        return (hash % 100) < percentage;
    }

    /**
     * Simple hash function for percentage-based rollouts
     * @param {string} str - String to hash
     * @returns {number} - Hash value
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Get user context for feature flag decisions
     * @returns {object} - User context object
     */
    getUserContext() {
        // Generate a consistent user ID for this browser
        let userId = localStorage.getItem('motorcycle-tracker-user-id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('motorcycle-tracker-user-id', userId);
        }

        return {
            userId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
    }

    /**
     * Detect current environment
     * @returns {string} - Environment name
     */
    detectEnvironment() {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('.github.io')) {
            return 'production';
        } else if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    /**
     * Override flag for testing purposes (development only)
     * @param {string} flagName - Name of the feature flag
     * @param {boolean} enabled - Whether to enable the flag
     */
    override(flagName, enabled) {
        if (this.environment !== 'development') {
            console.warn('Flag overrides only allowed in development environment');
            return;
        }

        const overrides = JSON.parse(localStorage.getItem('feature-flag-overrides') || '{}');
        overrides[flagName] = enabled;
        localStorage.setItem('feature-flag-overrides', JSON.stringify(overrides));

        // Update in-memory flags
        if (!this.flags[flagName]) {
            this.flags[flagName] = {};
        }
        this.flags[flagName].enabled = enabled;
    }

    /**
     * Get all active flags for debugging
     * @returns {object} - Active flags and their states
     */
    getActiveFlags() {
        const active = {};
        for (const flagName in this.flags) {
            active[flagName] = this.isEnabled(flagName);
        }
        return active;
    }

    /**
     * Track feature flag usage for analytics
     * @param {string} flagName - Name of the feature flag
     * @param {string} action - Action taken (viewed, used, etc.)
     */
    track(flagName, action = 'viewed') {
        // In a real app, this would send to analytics service
        console.debug(`Feature flag '${flagName}' ${action}`, {
            flag: flagName,
            action,
            enabled: this.isEnabled(flagName),
            userContext: this.userContext,
            environment: this.environment,
            timestamp: new Date().toISOString()
        });
    }
}

// Create singleton instance
const featureFlags = new FeatureFlags();

// Initialize flags when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        featureFlags.loadFlags();
    });
} else {
    featureFlags.loadFlags();
}

// Export for use in other modules
window.FeatureFlags = featureFlags;

export default featureFlags;