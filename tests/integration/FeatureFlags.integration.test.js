/**
 * FeatureFlags Integration Tests
 *
 * Tests integration between FeatureFlags and UI components, focusing on
 * the UI addition feature flag and its interaction with other systems.
 */

const { screen, fireEvent, waitFor } = require('@testing-library/dom');

describe('FeatureFlags Integration', () => {
  let featureFlags;
  let iconManager;
  let simplifiedThemeManager;

  beforeEach(() => {
    // Clear DOM and storage
    document.body.innerHTML = '';
    localStorage.clear();

    // Set up basic DOM structure
    document.body.innerHTML = `
      <div id="app">
        <header class="header">
          <h1>Motorcycle Tracker</h1>
          <div id="theme-controls"></div>
        </header>
        <main id="main-content">
          <div id="dashboard" class="tab-content active">
            <div id="status-indicators"></div>
          </div>
        </main>
      </div>
    `;

    // Mock the components that will be integrated
    global.IconManager = jest.fn().mockImplementation(() => ({
      getIcon: jest.fn().mockResolvedValue(document.createElement('svg')),
      preloadIcons: jest.fn().mockResolvedValue(),
      onThemeChange: jest.fn()
    }));

    global.SimplifiedThemeManager = jest.fn().mockImplementation(() => ({
      currentTheme: 'light',
      toggle: jest.fn(),
      setTheme: jest.fn(),
      initialize: jest.fn()
    }));

    // Initialize the system
    featureFlags = new FeatureFlags();
    iconManager = new IconManager();
    simplifiedThemeManager = new SimplifiedThemeManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('UI Addition Feature Flag Integration', () => {
    test('should enable UI additions when feature flag is active', async () => {
      // Arrange
      featureFlags.override('ui-addition', true);

      // Act
      const isEnabled = featureFlags.isEnabled('ui-addition');

      if (isEnabled) {
        // Simulate UI addition activation
        await activateUIAdditions();
      }

      // Assert
      expect(isEnabled).toBe(true);
      expect(screen.getByTestId('enhanced-theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('status-icons')).toBeInTheDocument();
      expect(iconManager.preloadIcons).toHaveBeenCalledWith(['wrench', 'gear', 'oil-drop', 'calendar']);
    });

    test('should use fallback UI when feature flag is disabled', async () => {
      // Arrange
      featureFlags.override('ui-addition', false);

      // Act
      const isEnabled = featureFlags.isEnabled('ui-addition');

      if (!isEnabled) {
        // Simulate fallback UI
        await activateFallbackUI();
      }

      // Assert
      expect(isEnabled).toBe(false);
      expect(screen.queryByTestId('enhanced-theme-toggle')).not.toBeInTheDocument();
      expect(screen.getByTestId('basic-theme-toggle')).toBeInTheDocument();
      expect(iconManager.preloadIcons).not.toHaveBeenCalled();
    });

    test('should handle gradual rollout based on user ID', () => {
      // Arrange
      const mockFlags = {
        'ui-addition': {
          enabled: true,
          rollout_percentage: 50
        }
      };
      featureFlags.flags = mockFlags;

      // Test multiple user IDs to verify percentage rollout
      const results = [];
      for (let i = 0; i < 100; i++) {
        localStorage.setItem('motorcycle-tracker-user-id', `user_${i}`);
        featureFlags.userContext = featureFlags.getUserContext();
        results.push(featureFlags.isEnabled('ui-addition'));
      }

      // Assert
      const enabledCount = results.filter(Boolean).length;
      expect(enabledCount).toBeGreaterThan(30); // Should be around 50%
      expect(enabledCount).toBeLessThan(70);
    });
  });

  describe('Child Feature Flags', () => {
    test('should disable child flags when parent is disabled', () => {
      // Arrange
      featureFlags.flags = {
        'ui-addition': { enabled: false },
        'enhanced-icons': {
          enabled: true,
          parent_flag: 'ui-addition'
        },
        'simplified-theme': {
          enabled: true,
          parent_flag: 'ui-addition'
        }
      };

      // Act & Assert
      expect(featureFlags.isEnabled('ui-addition')).toBe(false);
      expect(featureFlags.isEnabled('enhanced-icons')).toBe(false); // Disabled by parent
      expect(featureFlags.isEnabled('simplified-theme')).toBe(false); // Disabled by parent
    });

    test('should enable child flags when parent is enabled', () => {
      // Arrange
      featureFlags.flags = {
        'ui-addition': { enabled: true },
        'enhanced-icons': {
          enabled: true,
          parent_flag: 'ui-addition'
        },
        'simplified-theme': {
          enabled: false, // Child can still be disabled independently
          parent_flag: 'ui-addition'
        }
      };

      // Act & Assert
      expect(featureFlags.isEnabled('ui-addition')).toBe(true);
      expect(featureFlags.isEnabled('enhanced-icons')).toBe(true);
      expect(featureFlags.isEnabled('simplified-theme')).toBe(false); // Explicitly disabled
    });
  });

  describe('Theme Integration with Feature Flags', () => {
    test('should use simplified theme manager when feature is enabled', async () => {
      // Arrange
      featureFlags.override('ui-addition', true);
      featureFlags.override('simplified-theme', true);

      // Act
      await initializeThemeSystem();

      // Assert
      expect(screen.getByTestId('simplified-theme-toggle')).toBeInTheDocument();
      expect(screen.queryByTestId('legacy-theme-controls')).not.toBeInTheDocument();
    });

    test('should fall back to legacy theme system when feature is disabled', async () => {
      // Arrange
      featureFlags.override('ui-addition', false);

      // Act
      await initializeThemeSystem();

      // Assert
      expect(screen.getByTestId('legacy-theme-controls')).toBeInTheDocument();
      expect(screen.queryByTestId('simplified-theme-toggle')).not.toBeInTheDocument();
    });

    test('should handle theme system transition gracefully', async () => {
      // Arrange
      featureFlags.override('ui-addition', false);
      await initializeThemeSystem();

      const currentTheme = localStorage.getItem('motorcycle-tracker-theme-preference');

      // Act - Enable feature flag
      featureFlags.override('ui-addition', true);
      await initializeThemeSystem();

      // Assert - Theme preference should be preserved
      const newTheme = localStorage.getItem('motorcycle-tracker-theme');
      expect(newTheme).toBe(currentTheme === 'system' ? 'light' : currentTheme);
    });
  });

  describe('Icon System Integration', () => {
    test('should load icon system when enhanced-icons flag is enabled', async () => {
      // Arrange
      featureFlags.override('ui-addition', true);
      featureFlags.override('enhanced-icons', true);

      // Act
      await initializeIconSystem();

      // Assert
      expect(iconManager.preloadIcons).toHaveBeenCalled();
      expect(screen.getAllByRole('img')).toHaveLength(4); // Status icons
    });

    test('should skip icon loading when enhanced-icons flag is disabled', async () => {
      // Arrange
      featureFlags.override('ui-addition', true);
      featureFlags.override('enhanced-icons', false);

      // Act
      await initializeIconSystem();

      // Assert
      expect(iconManager.preloadIcons).not.toHaveBeenCalled();
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    test('should update icons when theme changes', async () => {
      // Arrange
      featureFlags.override('ui-addition', true);
      featureFlags.override('enhanced-icons', true);
      await initializeIconSystem();

      // Act
      fireEvent.click(screen.getByTestId('theme-toggle'));

      // Assert
      await waitFor(() => {
        expect(iconManager.onThemeChange).toHaveBeenCalledWith('dark');
      });
    });
  });

  describe('Environment-Based Flag Behavior', () => {
    test('should respect development environment overrides', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      });

      featureFlags.environment = 'development';
      featureFlags.flags = {
        'ui-addition': {
          enabled: false,
          environments: { development: true }
        }
      };

      // Act & Assert
      expect(featureFlags.isEnabled('ui-addition')).toBe(true);
    });

    test('should respect production environment settings', () => {
      // Arrange
      Object.defineProperty(window, 'location', {
        value: { hostname: 'example.github.io' },
        writable: true
      });

      featureFlags.environment = 'production';
      featureFlags.flags = {
        'ui-addition': {
          enabled: true,
          environments: { production: false }
        }
      };

      // Act & Assert
      expect(featureFlags.isEnabled('ui-addition')).toBe(false);
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should gracefully handle missing flag configuration', async () => {
      // Arrange
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Act
      const newFeatureFlags = new FeatureFlags();
      await newFeatureFlags.loadFlags();

      // Assert
      expect(newFeatureFlags.isEnabled('ui-addition')).toBe(false); // Default fallback
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load feature flags')
      );
    });

    test('should handle corrupted flag data', () => {
      // Arrange
      featureFlags.flags = null;

      // Act & Assert
      expect(() => {
        featureFlags.isEnabled('ui-addition');
      }).not.toThrow();

      expect(featureFlags.isEnabled('ui-addition')).toBe(false);
    });

    test('should continue working when localStorage is unavailable', () => {
      // Arrange
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true
      });

      // Act
      const result = featureFlags.getUserContext();

      // Assert
      expect(result.userId).toMatch(/^user_/);

      // Cleanup
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });
  });

  // Helper functions for integration tests
  async function activateUIAdditions() {
    const themeControls = document.getElementById('theme-controls');
    themeControls.innerHTML = `
      <button id="enhanced-theme-toggle" data-testid="enhanced-theme-toggle">
        Toggle Theme
      </button>
    `;

    const statusIndicators = document.getElementById('status-indicators');
    statusIndicators.innerHTML = `
      <div data-testid="status-icons">
        <div role="img" aria-label="Oil status"></div>
        <div role="img" aria-label="Spark plugs status"></div>
        <div role="img" aria-label="Valve adjustment status"></div>
        <div role="img" aria-label="Air filter status"></div>
      </div>
    `;

    await iconManager.preloadIcons(['wrench', 'gear', 'oil-drop', 'calendar']);
  }

  async function activateFallbackUI() {
    const themeControls = document.getElementById('theme-controls');
    themeControls.innerHTML = `
      <button id="basic-theme-toggle" data-testid="basic-theme-toggle">
        Basic Theme Toggle
      </button>
    `;
  }

  async function initializeThemeSystem() {
    if (featureFlags.isEnabled('ui-addition') && featureFlags.isEnabled('simplified-theme')) {
      document.getElementById('theme-controls').innerHTML = `
        <button data-testid="simplified-theme-toggle">Simplified Toggle</button>
      `;
    } else {
      document.getElementById('theme-controls').innerHTML = `
        <div data-testid="legacy-theme-controls">
          <select>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      `;
    }
  }

  async function initializeIconSystem() {
    if (featureFlags.isEnabled('enhanced-icons')) {
      document.body.innerHTML += `
        <button data-testid="theme-toggle">Toggle Theme</button>
      `;
    }
  }
});